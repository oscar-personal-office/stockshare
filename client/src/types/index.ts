export interface User {
  id: string;
  name: string;
  avatar: string;
  color: string;
}

export interface StockMarking {
  id: string;       // user id
  name: string;
  avatar: string;
  color: string;
  buyPrice: number | null;
  sellPrice: number | null;
}

export interface Stock {
  symbol: string;
  name: string;
  price?: number;
  change?: number;
  high?: number;
  low?: number;
  open?: number;
  volume?: number;
  markings?: StockMarking[];
}

export interface Board {
  id: number;
  title: string;
  stocks: Stock[];
  aiSummary?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface TradeData {
  s: string;      // symbol
  t: number;      // timestamp
  p: string;      // price
  v: string;      // volume
  vw: string;     // turnover
  td: number;     // trade direction
  pc: string;     // percent change (涨跌幅)
}

export interface KlineData {
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

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}
