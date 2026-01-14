import axios from 'axios';
import { Board, Stock, TradeData, KlineData, ApiResponse, User, StockMarking } from '../types';

const API_BASE = 'http://localhost:3001/api';

const api = axios.create({
  baseURL: API_BASE,
  timeout: 10000,
});

// 板块相关 API
export const boardsApi = {
  // 获取所有板块
  getAll: async (): Promise<Board[]> => {
    const response = await api.get<ApiResponse<Board[]>>('/boards');
    return response.data.data || [];
  },

  // 创建板块
  create: async (title: string): Promise<Board> => {
    const response = await api.post<ApiResponse<Board>>('/boards', { title });
    return response.data.data!;
  },

  // 删除板块
  delete: async (id: number): Promise<void> => {
    await api.delete(`/boards/${id}`);
  },

  // 添加股票到板块
  addStock: async (boardId: number, stock: Stock): Promise<void> => {
    await api.post(`/boards/${boardId}/stocks`, {
      symbol: stock.symbol,
      name: stock.name,
    });
  },

  // 从板块删除股票
  removeStock: async (boardId: number, symbol: string): Promise<void> => {
    await api.delete(`/boards/${boardId}/stocks/${encodeURIComponent(symbol)}`);
  },
};

// 股票相关 API
export const stocksApi = {
  // 获取实时行情
  getQuotes: async (symbols: string[]): Promise<TradeData[]> => {
    const response = await api.get<ApiResponse<TradeData[]>>('/stocks/quotes', {
      params: { symbols: symbols.join(',') },
    });
    return response.data.data || [];
  },

  // 获取K线数据
  getKline: async (symbols: string[], type = 1, num = 20): Promise<KlineData[][]> => {
    const response = await api.get<ApiResponse<KlineData[][]>>('/stocks/kline', {
      params: { symbols: symbols.join(','), type, num },
    });
    return response.data.data || [];
  },

  // 搜索股票
  search: async (query: string): Promise<Stock[]> => {
    const response = await api.get<ApiResponse<any[]>>('/stocks/search', {
      params: { q: query },
    });
    return (response.data.data || []).map((item: any) => ({
      symbol: item.symbol,
      name: item.name_cn || item.name_en || item.symbol,
    }));
  },

  // 获取热门股票
  getPopular: async (): Promise<Stock[]> => {
    const response = await api.get<ApiResponse<Stock[]>>('/stocks/popular');
    return response.data.data || [];
  },
};

// 认证相关 API
export const authApi = {
  // 注册
  register: async (name: string, password: string): Promise<User> => {
    const response = await api.post<ApiResponse<User>>('/auth/register', { name, password });
    if (!response.data.success) {
      throw new Error(response.data.error || '注册失败');
    }
    return response.data.data!;
  },

  // 登录
  login: async (name: string, password: string): Promise<User> => {
    const response = await api.post<ApiResponse<User>>('/auth/login', { name, password });
    if (!response.data.success) {
      throw new Error(response.data.error || '登录失败');
    }
    return response.data.data!;
  },

  // 获取用户信息
  getUser: async (userId: string): Promise<User> => {
    const response = await api.get<ApiResponse<User>>(`/auth/me/${userId}`);
    return response.data.data!;
  },
};

// 标记相关 API
export const markingsApi = {
  // 获取股票的所有标记
  getByStock: async (boardId: number, symbol: string): Promise<StockMarking[]> => {
    const response = await api.get<ApiResponse<StockMarking[]>>(`/markings/${boardId}/${encodeURIComponent(symbol)}`);
    return response.data.data || [];
  },

  // 保存或更新标记
  save: async (userId: string, boardId: number, symbol: string, buyPrice: number | null, sellPrice: number | null): Promise<void> => {
    await api.post('/markings', {
      userId,
      boardId,
      symbol,
      buyPrice,
      sellPrice,
    });
  },

  // 删除标记
  delete: async (boardId: number, symbol: string, userId: string): Promise<void> => {
    await api.delete(`/markings/${boardId}/${encodeURIComponent(symbol)}/${userId}`);
  },

  // 获取当前用户
  getCurrentUser: async (): Promise<User> => {
    const response = await api.get<ApiResponse<User>>('/markings/users/me');
    return response.data.data!;
  },
};
