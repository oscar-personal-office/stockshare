import React, { useState } from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';
import Sparkline from './Sparkline';
import { Stock } from '../types';

interface StockItemProps {
  stock: Stock;
  trendData?: number[];
  onClick?: () => void;
}

// 生成模拟趋势数据
const generateMockTrend = (length = 20): number[] => {
  let points = [50];
  for (let i = 1; i < length; i++) {
    const change = (Math.random() - 0.5) * 10;
    points.push(points[i - 1] + change);
  }
  return points;
};

const StockItem: React.FC<StockItemProps> = ({ stock, trendData, onClick }) => {
  const [trend] = useState(() => trendData || generateMockTrend());

  const isPositive = (stock.change || 0) >= 0;
  // 中国股市：红涨绿跌
  const colorClass = isPositive ? 'text-rose-500' : 'text-emerald-500';
  const chartColor = isPositive ? '#f43f5e' : '#10b981';

  const price = stock.price ?? 0;
  const change = stock.change ?? 0;
  const markings = stock.markings || [];

  return (
    <div
      onClick={onClick}
      className="flex items-center justify-between p-3 hover:bg-slate-50 transition-colors border-b border-slate-100 last:border-0 cursor-pointer group"
    >
      <div className="w-1/4">
        <div className="font-bold text-slate-800">{stock.name}</div>
        <div className="text-xs text-slate-400 font-mono mb-1">{stock.symbol}</div>

        {/* Avatars of users who marked this stock */}
        {markings.length > 0 && (
          <div className="flex -space-x-2 overflow-hidden py-1">
            {markings.slice(0, 5).map((m, i) => (
              <div
                key={i}
                className={`inline-flex items-center justify-center h-5 w-5 rounded-full ring-2 ring-white text-[10px] text-white font-bold ${m.color}`}
                title={`${m.name}: 买入 ¥${m.buyPrice || '-'} / 卖出 ¥${m.sellPrice || '-'}`}
              >
                {m.avatar}
              </div>
            ))}
            {markings.length > 5 && (
              <div className="inline-flex items-center justify-center h-5 w-5 rounded-full ring-2 ring-white text-[10px] text-slate-600 font-bold bg-slate-200">
                +{markings.length - 5}
              </div>
            )}
          </div>
        )}
      </div>

      <div className="w-1/3 flex justify-center opacity-80 group-hover:opacity-100 transition-opacity">
        <Sparkline data={trend} color={chartColor} />
      </div>

      <div className="w-1/4 text-right">
        <div className={`font-mono font-bold ${colorClass}`}>
          {price > 0 ? price.toFixed(2) : '--'}
        </div>
        <div className={`text-xs font-mono flex items-center justify-end ${colorClass}`}>
          {isPositive ? (
            <TrendingUp size={12} className="mr-1" />
          ) : (
            <TrendingDown size={12} className="mr-1" />
          )}
          {isPositive ? '+' : ''}{change.toFixed(2)}%
        </div>
      </div>
    </div>
  );
};

export default StockItem;
