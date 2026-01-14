import React, { useState, useEffect } from 'react';
import { Plus, MoreHorizontal, Activity, X, Trash2 } from 'lucide-react';
import StockItem from './StockItem';
import AiSummaryCard from './AiSummaryCard';
import { Board, Stock } from '../types';
import { stocksApi } from '../services/api';

interface StockBoardProps {
  board: Board;
  onAddStock: (boardId: number, stock: Stock) => void;
  onRemoveStock: (boardId: number, symbol: string) => void;
  onDeleteBoard: (boardId: number) => void;
  onGenerateSummary: (boardId: number) => void;
  onStockClick: (boardId: number, symbol: string) => void;
}

const StockBoard: React.FC<StockBoardProps> = ({
  board,
  onAddStock,
  onRemoveStock,
  onDeleteBoard,
  onGenerateSummary,
  onStockClick,
}) => {
  const [isAdding, setIsAdding] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Stock[]>([]);
  const [popularStocks, setPopularStocks] = useState<Stock[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  // 加载热门股票
  useEffect(() => {
    stocksApi.getPopular().then(setPopularStocks).catch(console.error);
  }, []);

  // 搜索股票
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const results = await stocksApi.search(searchQuery);
        setSearchResults(results);
      } catch (error) {
        console.error('Search failed:', error);
      } finally {
        setIsSearching(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleSelectStock = (stock: Stock) => {
    // 检查是否已存在
    if (board.stocks.some(s => s.symbol === stock.symbol)) {
      alert('该股票已在板块中');
      return;
    }
    onAddStock(board.id, stock);
    setIsAdding(false);
    setSearchQuery('');
  };

  const displayStocks = searchQuery.trim() ? searchResults : popularStocks;

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col h-full hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
        <h3 className="font-bold text-lg text-slate-800 flex items-center">
          {board.title}
          <span className="ml-2 px-2 py-0.5 bg-slate-200 text-slate-600 text-xs rounded-full">
            {board.stocks.length}
          </span>
        </h3>
        <div className="relative">
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="text-slate-400 hover:text-slate-600"
          >
            <MoreHorizontal size={20} />
          </button>
          {showMenu && (
            <div className="absolute right-0 top-8 bg-white shadow-lg rounded-lg border border-slate-200 py-1 z-10">
              <button
                onClick={() => {
                  onDeleteBoard(board.id);
                  setShowMenu(false);
                }}
                className="flex items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50 w-full"
              >
                <Trash2 size={14} className="mr-2" />
                删除板块
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Stock List */}
      <div className="flex-1 min-h-[150px] max-h-[300px] overflow-y-auto">
        {board.stocks.length > 0 ? (
          board.stocks.map(stock => (
            <div key={stock.symbol} className="relative group">
              <StockItem
                stock={stock}
                onClick={() => onStockClick(board.id, stock.symbol)}
              />
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onRemoveStock(board.id, stock.symbol);
                }}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                title="移除股票"
              >
                <X size={14} />
              </button>
            </div>
          ))
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-slate-400 py-8">
            <Activity size={32} className="mb-2 opacity-20" />
            <p className="text-sm">暂无自选股</p>
          </div>
        )}
      </div>

      {/* Actions & AI */}
      <div className="p-4 bg-slate-50/30">
        {isAdding ? (
          <div className="mb-2">
            <div className="flex items-center space-x-2 mb-2">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="搜索股票代码或名称..."
                className="flex-1 text-sm border border-slate-200 rounded-lg p-2 focus:ring-2 focus:ring-indigo-500 outline-none"
                autoFocus
              />
              <button
                onClick={() => {
                  setIsAdding(false);
                  setSearchQuery('');
                }}
                className="p-2 text-slate-500 hover:bg-slate-200 rounded-lg"
              >
                <X size={16} />
              </button>
            </div>

            {isSearching ? (
              <div className="text-sm text-slate-400 text-center py-2">搜索中...</div>
            ) : (
              <div className="max-h-40 overflow-y-auto border border-slate-200 rounded-lg">
                {displayStocks.map(stock => (
                  <button
                    key={stock.symbol}
                    onClick={() => handleSelectStock(stock)}
                    className="w-full text-left px-3 py-2 hover:bg-indigo-50 text-sm flex justify-between items-center border-b border-slate-100 last:border-0"
                  >
                    <span className="font-medium">{stock.name}</span>
                    <span className="text-slate-400 text-xs">{stock.symbol}</span>
                  </button>
                ))}
                {displayStocks.length === 0 && searchQuery && (
                  <div className="text-sm text-slate-400 text-center py-2">未找到匹配股票</div>
                )}
              </div>
            )}
          </div>
        ) : (
          <button
            onClick={() => setIsAdding(true)}
            className="w-full py-2 border border-dashed border-slate-300 rounded-lg text-slate-500 text-sm hover:border-indigo-400 hover:text-indigo-600 hover:bg-indigo-50 transition-all flex items-center justify-center mb-2"
          >
            <Plus size={16} className="mr-1" /> 添加股票
          </button>
        )}

        <AiSummaryCard
          boardName={board.title}
          stocks={board.stocks}
          hasSummary={board.aiSummary || false}
          onGenerate={() => onGenerateSummary(board.id)}
        />
      </div>
    </div>
  );
};

export default StockBoard;
