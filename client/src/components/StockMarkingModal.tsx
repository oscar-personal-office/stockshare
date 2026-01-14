import React, { useState, useEffect } from 'react';
import { X, Tag, User, Save } from 'lucide-react';
import { Stock, User as UserType, StockMarking } from '../types';

interface StockMarkingModalProps {
  isOpen: boolean;
  onClose: () => void;
  stock: Stock | null;
  currentUser: UserType | null;
  onSaveMarking: (symbol: string, buyPrice: string, sellPrice: string) => void;
}

const StockMarkingModal: React.FC<StockMarkingModalProps> = ({
  isOpen,
  onClose,
  stock,
  currentUser,
  onSaveMarking,
}) => {
  const [buyPrice, setBuyPrice] = useState('');
  const [sellPrice, setSellPrice] = useState('');

  useEffect(() => {
    if (isOpen && stock && currentUser) {
      // Pre-fill if current user has marked
      const myMarking = stock.markings?.find(m => m.id === currentUser.id);
      if (myMarking) {
        setBuyPrice(myMarking.buyPrice?.toString() || '');
        setSellPrice(myMarking.sellPrice?.toString() || '');
      } else {
        setBuyPrice('');
        setSellPrice('');
      }
    }
  }, [isOpen, stock, currentUser]);

  if (!isOpen || !stock) return null;

  const handleSave = () => {
    onSaveMarking(stock.symbol, buyPrice, sellPrice);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose}></div>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md relative z-10">

        {/* Header */}
        <div className="p-6 border-b border-slate-100 flex justify-between items-start">
          <div>
            <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              {stock.name}
              <span className="text-sm font-normal text-slate-400 bg-slate-100 px-2 py-0.5 rounded">
                {stock.symbol}
              </span>
            </h3>
            <div className="text-slate-500 text-sm mt-1">
              当前价格: <span className="font-mono text-slate-800 font-bold">
                ¥{stock.price?.toFixed(2) || '--'}
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-slate-100 rounded-full text-slate-400 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">

          {/* My Marking Form - only show when logged in */}
          {currentUser ? (
            <div className="mb-6">
              <label className="block text-sm font-bold text-slate-700 mb-3 flex items-center">
                <Tag size={16} className="mr-2 text-indigo-500" />
                我的标记 (仅圈内可见)
              </label>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-slate-500 mb-1">目标买入价</label>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-slate-400 text-sm">¥</span>
                    <input
                      type="number"
                      value={buyPrice}
                      onChange={(e) => setBuyPrice(e.target.value)}
                      className="w-full pl-6 pr-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none font-mono text-sm"
                      placeholder="0.00"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs text-slate-500 mb-1">目标卖出价</label>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-slate-400 text-sm">¥</span>
                    <input
                      type="number"
                      value={sellPrice}
                      onChange={(e) => setSellPrice(e.target.value)}
                      className="w-full pl-6 pr-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-rose-500 outline-none font-mono text-sm"
                      placeholder="0.00"
                    />
                  </div>
                </div>
              </div>
              <button
                onClick={handleSave}
                className="mt-4 w-full bg-slate-900 text-white py-2 rounded-lg font-medium hover:bg-slate-800 transition-colors flex items-center justify-center text-sm"
              >
                <Save size={16} className="mr-2" /> 保存我的标记
              </button>
            </div>
          ) : (
            <div className="mb-6 text-center py-4 text-slate-400 text-sm bg-slate-50 rounded-xl border border-dashed border-slate-200">
              登录后可添加自己的标记
            </div>
          )}

          {/* Other Users' Markings */}
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-3 flex items-center">
              <User size={16} className="mr-2 text-slate-400" />
              圈友关注 ({stock.markings?.length || 0})
            </label>

            <div className="space-y-3 max-h-40 overflow-y-auto pr-1">
              {stock.markings && stock.markings.length > 0 ? (
                stock.markings.map((m, idx) => (
                  <div key={idx} className="flex items-center justify-between bg-slate-50 p-3 rounded-xl border border-slate-100">
                    <div className="flex items-center gap-3">
                      <div className={`h-8 w-8 rounded-full flex items-center justify-center text-white text-xs font-bold ${m.color}`}>
                        {m.avatar}
                      </div>
                      <span className="text-sm font-medium text-slate-700">{m.name}</span>
                    </div>
                    <div className="flex gap-4 text-xs font-mono">
                      {m.buyPrice && (
                        <div className="flex flex-col items-end">
                          <span className="text-slate-400 text-[10px]">买入</span>
                          <span className="text-rose-600 font-bold">¥{m.buyPrice}</span>
                        </div>
                      )}
                      {m.sellPrice && (
                        <div className="flex flex-col items-end">
                          <span className="text-slate-400 text-[10px]">卖出</span>
                          <span className="text-emerald-600 font-bold">¥{m.sellPrice}</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-4 text-slate-400 text-sm bg-slate-50 rounded-xl border border-dashed border-slate-200">
                  暂无圈友标记，快来抢沙发
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default StockMarkingModal;
