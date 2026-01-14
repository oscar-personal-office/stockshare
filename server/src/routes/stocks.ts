import { Router, Request, Response } from 'express';
import { getBatchTrade, getBatchKline, getSymbolList } from '../services/stockApi';

const router = Router();

// 涨跌幅缓存 (symbol -> { pc, timestamp })
const changeCache = new Map<string, { pc: string; timestamp: number }>();
const CACHE_TTL = 60000; // 缓存1分钟

// 获取股票实时行情（包含涨跌幅）
router.get('/quotes', async (req: Request, res: Response) => {
  const { symbols } = req.query;

  if (!symbols || typeof symbols !== 'string') {
    return res.status(400).json({ success: false, error: 'Symbols parameter is required' });
  }

  const symbolList = symbols.split(',').filter(Boolean);

  try {
    // 先获取实时价格
    const tradeData = await getBatchTrade(symbolList);

    // 检查哪些股票需要更新涨跌幅
    const now = Date.now();
    const symbolsNeedKline = symbolList.filter(s => {
      const cached = changeCache.get(s);
      return !cached || (now - cached.timestamp > CACHE_TTL);
    });

    // 如果有需要更新的，获取K线数据
    if (symbolsNeedKline.length > 0) {
      try {
        const klineData = await getBatchKline(symbolsNeedKline, 6, 1);
        if (Array.isArray(klineData)) {
          klineData.forEach((item: any) => {
            if (item && item.respList && item.respList.length > 0) {
              const latestKline = item.respList[item.respList.length - 1];
              const pcValue = latestKline.pc ? latestKline.pc.replace('%', '') : '0';
              changeCache.set(item.s, { pc: pcValue, timestamp: now });
            }
          });
        }
      } catch (klineError) {
        console.error('Error fetching kline (will use cache):', klineError);
      }
    }

    // 合并数据，添加涨跌幅
    const enrichedData = tradeData.map(trade => ({
      ...trade,
      pc: changeCache.get(trade.s)?.pc || '0',
    }));

    res.json({ success: true, data: enrichedData });
  } catch (error) {
    console.error('Error fetching quotes:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch quotes' });
  }
});

// 获取K线数据
router.get('/kline', async (req: Request, res: Response) => {
  const { symbols, type = '1', num = '20' } = req.query;

  if (!symbols || typeof symbols !== 'string') {
    return res.status(400).json({ success: false, error: 'Symbols parameter is required' });
  }

  const symbolList = symbols.split(',').filter(Boolean);

  try {
    const klineData = await getBatchKline(
      symbolList,
      parseInt(type as string),
      parseInt(num as string)
    );
    res.json({ success: true, data: klineData });
  } catch (error) {
    console.error('Error fetching kline:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch kline data' });
  }
});

// 搜索股票
router.get('/search', async (req: Request, res: Response) => {
  const { q } = req.query;

  if (!q || typeof q !== 'string') {
    return res.status(400).json({ success: false, error: 'Query parameter is required' });
  }

  try {
    const allSymbols = await getSymbolList();

    // 过滤匹配的股票
    const filtered = allSymbols
      .filter((stock: any) => {
        const query = q.toLowerCase();
        return (
          stock.symbol?.toLowerCase().includes(query) ||
          stock.name_cn?.toLowerCase().includes(query) ||
          stock.name_en?.toLowerCase().includes(query)
        );
      })
      .slice(0, 20); // 最多返回20条

    res.json({ success: true, data: filtered });
  } catch (error) {
    console.error('Error searching stocks:', error);
    res.status(500).json({ success: false, error: 'Failed to search stocks' });
  }
});

// 获取热门股票列表（预设）
router.get('/popular', async (req: Request, res: Response) => {
  const popularStocks = [
    { symbol: '600519.SH', name: '贵州茅台' },
    { symbol: '300750.SZ', name: '宁德时代' },
    { symbol: '601318.SH', name: '中国平安' },
    { symbol: '002594.SZ', name: '比亚迪' },
    { symbol: '600036.SH', name: '招商银行' },
    { symbol: '300059.SZ', name: '东方财富' },
    { symbol: '000858.SZ', name: '五粮液' },
    { symbol: '601138.SH', name: '工业富联' },
    { symbol: '002230.SZ', name: '科大讯飞' },
    { symbol: '603259.SH', name: '药明康德' },
  ];

  res.json({ success: true, data: popularStocks });
});

export default router;
