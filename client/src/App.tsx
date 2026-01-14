import React, { useState, useEffect, useCallback } from 'react';
import { TrendingUp, Plus, Search, Share2, LogIn, LogOut, UserPlus } from 'lucide-react';
import GlobalMarketSummary from './components/GlobalMarketSummary';
import StockBoard from './components/StockBoard';
import StockMarkingModal from './components/StockMarkingModal';
import AuthModal from './components/AuthModal';
import { Board, Stock, User } from './types';
import { boardsApi, stocksApi, markingsApi, authApi } from './services/api';
import './App.css';

function App() {
  // State
  const [boards, setBoards] = useState<Board[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  // Global AI Summary state
  const [globalAiSummary, setGlobalAiSummary] = useState(false);
  const [isGlobalLoading, setIsGlobalLoading] = useState(false);

  // Create board modal state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newBoardName, setNewBoardName] = useState('');

  // Stock marking modal state
  const [activeStock, setActiveStock] = useState<Stock | null>(null);
  const [activeBoardId, setActiveBoardId] = useState<number | null>(null);

  // Auth modal state
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');

  // Load current user from localStorage
  useEffect(() => {
    const savedUserId = localStorage.getItem('userId');
    if (savedUserId) {
      authApi.getUser(savedUserId)
        .then(setCurrentUser)
        .catch(err => {
          console.error('Failed to load user:', err);
          localStorage.removeItem('userId');
        });
    }
  }, []);

  // Load boards from API
  const loadBoards = useCallback(async () => {
    try {
      setLoading(true);
      const data = await boardsApi.getAll();
      setBoards(data.map(b => ({ ...b, aiSummary: false })));
      setError(null);
    } catch (err) {
      setError('加载板块失败，请检查后端服务是否启动');
      console.error('Failed to load boards:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch real-time stock data
  const fetchStockData = useCallback(async () => {
    const allSymbols = boards.flatMap(b => b.stocks.map(s => s.symbol));
    if (allSymbols.length === 0) return;

    try {
      const quotes = await stocksApi.getQuotes(allSymbols);
      const quotesMap = new Map(quotes.map(q => [q.s, q]));

      setBoards(prevBoards =>
        prevBoards.map(board => ({
          ...board,
          stocks: board.stocks.map(stock => {
            const quote = quotesMap.get(stock.symbol);
            if (quote) {
              return {
                ...stock,
                price: parseFloat(quote.p) || stock.price,
                change: parseFloat(quote.pc) || 0, // 涨跌幅
              };
            }
            return stock;
          }),
        }))
      );
    } catch (err) {
      console.error('Failed to fetch stock data:', err);
    }
  }, [boards]);

  // Initial load
  useEffect(() => {
    loadBoards();
  }, [loadBoards]);

  // 检查是否在交易时间内（北京时间 9:00-15:00）
  const isMarketOpen = useCallback(() => {
    const now = new Date();
    // 转换为北京时间 (UTC+8)
    const utc = now.getTime() + now.getTimezoneOffset() * 60000;
    const beijingTime = new Date(utc + 8 * 3600000);
    const hours = beijingTime.getHours();
    const minutes = beijingTime.getMinutes();
    const totalMinutes = hours * 60 + minutes;

    // 9:00 = 540分钟, 15:00 = 900分钟
    // 排除午休 11:30-13:00 (690-780分钟)
    const isInMorningSession = totalMinutes >= 540 && totalMinutes <= 690; // 9:00-11:30
    const isInAfternoonSession = totalMinutes >= 780 && totalMinutes <= 900; // 13:00-15:00

    return isInMorningSession || isInAfternoonSession;
  }, []);

  // 检查是否有股票缺少价格
  const hasStocksWithoutPrice = useCallback(() => {
    return boards.some(b => b.stocks.some(s => !s.price));
  }, [boards]);

  // Refresh stock data:
  // - 首次加载时获取一次
  // - 交易时间内每分钟刷新
  // - 非交易时间，如果有股票没价格也获取一次
  const hasBoards = boards.length > 0;
  useEffect(() => {
    if (!hasBoards) return;

    // 首次加载或有股票没价格时，获取数据
    if (hasStocksWithoutPrice()) {
      fetchStockData();
    }

    // 每分钟检查一次，如果在交易时间内则刷新
    const interval = setInterval(() => {
      if (isMarketOpen()) {
        fetchStockData();
      }
    }, 60000); // 1分钟

    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasBoards, isMarketOpen, hasStocksWithoutPrice]);

  // Handlers
  const handleGlobalGenerate = () => {
    setIsGlobalLoading(true);
    setTimeout(() => {
      setGlobalAiSummary(true);
      setIsGlobalLoading(false);
    }, 2000);
  };

  const handleAddStock = async (boardId: number, stock: Stock) => {
    try {
      await boardsApi.addStock(boardId, stock);

      // 如果股票没有价格，立即获取一次
      let stockWithPrice = { ...stock, markings: [] };
      if (!stock.price) {
        try {
          const quotes = await stocksApi.getQuotes([stock.symbol]);
          if (quotes.length > 0) {
            stockWithPrice = {
              ...stockWithPrice,
              price: parseFloat(quotes[0].p) || 0,
            };
          }
        } catch (e) {
          console.error('Failed to fetch price for new stock:', e);
        }
      }

      setBoards(prevBoards =>
        prevBoards.map(board => {
          if (board.id === boardId) {
            return { ...board, stocks: [...board.stocks, stockWithPrice] };
          }
          return board;
        })
      );
    } catch (err) {
      console.error('Failed to add stock:', err);
      alert('添加股票失败');
    }
  };

  const handleRemoveStock = async (boardId: number, symbol: string) => {
    try {
      await boardsApi.removeStock(boardId, symbol);
      setBoards(prevBoards =>
        prevBoards.map(board => {
          if (board.id === boardId) {
            return {
              ...board,
              stocks: board.stocks.filter(s => s.symbol !== symbol),
            };
          }
          return board;
        })
      );
    } catch (err) {
      console.error('Failed to remove stock:', err);
      alert('移除股票失败');
    }
  };

  const handleDeleteBoard = async (boardId: number) => {
    if (!window.confirm('确定要删除这个板块吗？')) return;

    try {
      await boardsApi.delete(boardId);
      setBoards(prevBoards => prevBoards.filter(b => b.id !== boardId));
    } catch (err) {
      console.error('Failed to delete board:', err);
      alert('删除板块失败');
    }
  };

  const handleGenerateSummary = (boardId: number) => {
    setBoards(prevBoards =>
      prevBoards.map(board => {
        if (board.id === boardId) {
          return { ...board, aiSummary: true };
        }
        return board;
      })
    );
  };

  const handleCreateBoard = async () => {
    if (!newBoardName.trim()) return;

    try {
      const newBoard = await boardsApi.create(newBoardName);
      setBoards(prevBoards => [...prevBoards, { ...newBoard, aiSummary: false }]);
      setNewBoardName('');
      setShowCreateModal(false);
    } catch (err) {
      console.error('Failed to create board:', err);
      alert('创建板块失败');
    }
  };

  // Stock click handler - open marking modal
  const handleStockClick = (boardId: number, symbol: string) => {
    const board = boards.find(b => b.id === boardId);
    const stock = board?.stocks.find(s => s.symbol === symbol);
    if (stock) {
      setActiveBoardId(boardId);
      setActiveStock(stock);
    }
  };

  // Save marking handler
  const handleSaveMarking = async (symbol: string, buyPrice: string, sellPrice: string) => {
    if (!currentUser || !activeBoardId) return;

    try {
      await markingsApi.save(
        currentUser.id,
        activeBoardId,
        symbol,
        buyPrice ? parseFloat(buyPrice) : null,
        sellPrice ? parseFloat(sellPrice) : null
      );

      // Update local state
      setBoards(prevBoards =>
        prevBoards.map(board => {
          if (board.id !== activeBoardId) return board;

          return {
            ...board,
            stocks: board.stocks.map(stock => {
              if (stock.symbol !== symbol) return stock;

              const existingMarkings = stock.markings || [];
              const otherMarkings = existingMarkings.filter(m => m.id !== currentUser.id);

              // If both prices are empty, remove marking
              if (!buyPrice && !sellPrice) {
                return { ...stock, markings: otherMarkings };
              }

              const newMarking = {
                id: currentUser.id,
                name: currentUser.name,
                avatar: currentUser.avatar,
                color: currentUser.color,
                buyPrice: buyPrice ? parseFloat(buyPrice) : null,
                sellPrice: sellPrice ? parseFloat(sellPrice) : null,
              };

              return { ...stock, markings: [...otherMarkings, newMarking] };
            }),
          };
        })
      );

      setActiveStock(null);
    } catch (err) {
      console.error('Failed to save marking:', err);
      alert('保存标记失败');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center">
        <div className="text-slate-500">加载中...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 text-slate-800 font-sans pb-20">
      {/* Top Navigation */}
      <nav className="bg-white border-b border-slate-200 sticky top-0 z-10 px-4 py-3 shadow-sm">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <div className="bg-indigo-600 text-white p-1.5 rounded-lg">
              <TrendingUp size={20} />
            </div>
            <span className="font-bold text-xl tracking-tight text-slate-800">StockPilot</span>
          </div>
          <div className="flex items-center space-x-4">
            <div className="hidden md:flex relative">
              <input
                type="text"
                placeholder="搜索股票/板块..."
                className="bg-slate-100 border-none rounded-full py-1.5 pl-9 pr-4 text-sm focus:ring-2 focus:ring-indigo-500 w-64"
              />
              <Search size={16} className="absolute left-3 top-2 text-slate-400" />
            </div>
            <button className="p-2 text-slate-500 hover:bg-slate-100 rounded-full">
              <Share2 size={20} />
            </button>
            {currentUser ? (
              <div className="flex items-center gap-2">
                <div
                  className={`w-8 h-8 ${currentUser.color} text-white rounded-full flex items-center justify-center font-bold text-xs cursor-pointer`}
                  title={`当前用户: ${currentUser.name}`}
                >
                  {currentUser.avatar}
                </div>
                <button
                  onClick={() => {
                    localStorage.removeItem('userId');
                    setCurrentUser(null);
                  }}
                  className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full"
                  title="退出登录"
                >
                  <LogOut size={18} />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setAuthMode('login');
                    setShowAuthModal(true);
                  }}
                  className="flex items-center gap-1.5 px-4 py-1.5 text-slate-600 hover:bg-slate-100 rounded-full text-sm font-medium transition-colors"
                >
                  <LogIn size={16} />
                  登录
                </button>
                <button
                  onClick={() => {
                    setAuthMode('register');
                    setShowAuthModal(true);
                  }}
                  className="flex items-center gap-1.5 px-4 py-1.5 bg-indigo-600 text-white rounded-full text-sm font-medium hover:bg-indigo-700 transition-colors"
                >
                  <UserPlus size={16} />
                  注册
                </button>
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 py-8">
        {/* Header Section */}
        <div className="flex justify-between items-end mb-6">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 mb-1">2026财富看板</h1>
            <p className="text-slate-500">小圈子共赢 • 实时 AI 复盘</p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-slate-900 text-white hover:bg-slate-800 px-5 py-2.5 rounded-xl font-medium shadow-lg shadow-slate-200 hover:shadow-xl transition-all flex items-center"
          >
            <Plus size={18} className="mr-2" /> 新建板块
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {/* Global Market Summary Section */}
        <GlobalMarketSummary
          summary={globalAiSummary}
          isLoading={isGlobalLoading}
          onGenerate={handleGlobalGenerate}
        />

        {/* Create Board Modal */}
        {showCreateModal && (
          <div className="mb-6 bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
            <label className="block text-sm font-medium text-slate-700 mb-2">板块名称</label>
            <div className="flex gap-3">
              <input
                type="text"
                value={newBoardName}
                onChange={(e) => setNewBoardName(e.target.value)}
                placeholder="例如：🤖 AI 产业链核心票"
                className="flex-1 border border-slate-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500 outline-none"
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleCreateBoard();
                }}
              />
              <button
                onClick={handleCreateBoard}
                className="bg-indigo-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-indigo-700"
              >
                创建
              </button>
              <button
                onClick={() => setShowCreateModal(false)}
                className="bg-white text-slate-600 border border-slate-300 px-6 py-2 rounded-lg font-medium hover:bg-slate-50"
              >
                取消
              </button>
            </div>
          </div>
        )}

        {/* Boards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {boards.map(board => (
            <StockBoard
              key={board.id}
              board={board}
              onAddStock={handleAddStock}
              onRemoveStock={handleRemoveStock}
              onDeleteBoard={handleDeleteBoard}
              onGenerateSummary={handleGenerateSummary}
              onStockClick={handleStockClick}
            />
          ))}

          {/* Empty State */}
          {boards.length === 0 && (
            <div
              onClick={() => setShowCreateModal(true)}
              className="border-2 border-dashed border-slate-300 rounded-2xl p-8 flex flex-col items-center justify-center text-slate-400 hover:border-indigo-400 hover:bg-indigo-50/10 hover:text-indigo-500 transition-all cursor-pointer min-h-[300px]"
            >
              <Plus size={48} className="mb-4 opacity-50" />
              <p className="font-medium">创建一个新板块开始追踪</p>
            </div>
          )}
        </div>
      </main>

      {/* Stock Marking Modal */}
      <StockMarkingModal
        isOpen={!!activeStock}
        onClose={() => setActiveStock(null)}
        stock={activeStock}
        currentUser={currentUser}
        onSaveMarking={handleSaveMarking}
      />

      {/* Auth Modal */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onLoginSuccess={setCurrentUser}
        initialMode={authMode}
      />
    </div>
  );
}

export default App;
