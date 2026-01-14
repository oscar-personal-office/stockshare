import dotenv from 'dotenv';

dotenv.config();

const API_KEY = process.env.INFOWAY_API_KEY || '';
const BASE_URL = 'https://data.infoway.io';

interface StockQuote {
  symbol: string;
  name: string;
  price: number;
  change: number;
  high?: number;
  low?: number;
  open?: number;
  volume?: number;
}

interface KlineData {
  s: string;      // symbol
  t: string;      // timestamp
  h: string;      // high
  o: string;      // open
  l: string;      // low
  c: string;      // close
  v: string;      // volume
  vw: string;     // turnover
  pc: string;     // percent change
  pca: string;    // price change amount
}

interface TradeData {
  s: string;      // symbol
  t: number;      // timestamp
  p: string;      // price
  v: string;      // volume
  vw: string;     // turnover
  td: number;     // trade direction
}

// 获取实时成交数据
export async function getBatchTrade(symbols: string[]): Promise<TradeData[]> {
  const codes = symbols.join(',');
  const url = `${BASE_URL}/stock/batch_trade/${encodeURIComponent(codes)}`;

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'apiKey': API_KEY,
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`API request failed: ${response.status}`);
    }

    const data = await response.json() as { data?: TradeData[] };
    return data.data || [];
  } catch (error) {
    console.error('Error fetching trade data:', error);
    return [];
  }
}

// K线响应格式
interface KlineResponse {
  s: string;
  respList: KlineData[];
}

// 获取K线数据
export async function getBatchKline(
  symbols: string[],
  klineType: number = 1,
  klineNum: number = 20
): Promise<KlineResponse[]> {
  const url = `${BASE_URL}/stock/v2/batch_kline`;
  const codes = symbols.join(',');

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'apiKey': API_KEY,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        codes: codes,
        klineType: klineType,
        klineNum: klineNum,
      }),
    });

    if (!response.ok) {
      throw new Error(`API request failed: ${response.status}`);
    }

    const data = await response.json() as { data?: KlineResponse[] };
    return data.data || [];
  } catch (error) {
    console.error('Error fetching kline data:', error);
    return [];
  }
}

// 获取股票列表
export async function getSymbolList(): Promise<any[]> {
  const url = `${BASE_URL}/common/basic/symbols?type=STOCK_CN`;

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'apiKey': API_KEY,
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`API request failed: ${response.status}`);
    }

    const data = await response.json() as { data?: any[] };
    return data.data || [];
  } catch (error) {
    console.error('Error fetching symbol list:', error);
    return [];
  }
}

// 组合数据：获取股票报价（包含价格和涨跌幅）
export async function getStockQuotes(symbols: string[], names: Map<string, string>): Promise<StockQuote[]> {
  const tradeData = await getBatchTrade(symbols);

  return tradeData.map((trade) => ({
    symbol: trade.s,
    name: names.get(trade.s) || trade.s,
    price: parseFloat(trade.p) || 0,
    change: 0, // 需要从K线数据计算
    volume: parseFloat(trade.v) || 0,
  }));
}

// 获取股票完整数据（价格+K线走势）
export async function getStockFullData(symbols: string[], names: Map<string, string>): Promise<StockQuote[]> {
  const [tradeData, klineData] = await Promise.all([
    getBatchTrade(symbols),
    getBatchKline(symbols, 1, 20), // 1分钟K线，20根
  ]);

  const klineMap = new Map<string, KlineData[]>();
  if (Array.isArray(klineData)) {
    klineData.forEach((item) => {
      if (item && item.respList && item.respList.length > 0) {
        klineMap.set(item.s, item.respList);
      }
    });
  }

  return tradeData.map((trade) => {
    const klines = klineMap.get(trade.s);
    const latestKline = klines && klines.length > 0 ? klines[klines.length - 1] : null;

    return {
      symbol: trade.s,
      name: names.get(trade.s) || trade.s,
      price: parseFloat(trade.p) || 0,
      change: latestKline ? parseFloat(latestKline.pc.replace('%', '')) || 0 : 0,
      high: latestKline ? parseFloat(latestKline.h) : undefined,
      low: latestKline ? parseFloat(latestKline.l) : undefined,
      open: latestKline ? parseFloat(latestKline.o) : undefined,
      volume: parseFloat(trade.v) || 0,
    };
  });
}
