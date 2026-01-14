import React, { useState } from 'react';
import { Sparkles, Activity, Zap } from 'lucide-react';
import { Stock } from '../types';

interface AiSummaryCardProps {
  boardName: string;
  stocks: Stock[];
  hasSummary: boolean;
  onGenerate: () => void;
}

const AiSummaryCard: React.FC<AiSummaryCardProps> = ({
  boardName,
  stocks,
  hasSummary,
  onGenerate,
}) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleGenerate = () => {
    setIsLoading(true);
    setTimeout(() => {
      onGenerate();
      setIsLoading(false);
    }, 1500);
  };

  if (!stocks || stocks.length === 0) return null;

  return (
    <div className="mt-4 bg-indigo-50/50 rounded-xl p-4 border border-indigo-100 relative overflow-hidden group">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center space-x-2 text-indigo-700">
          <Sparkles size={16} />
          <span className="text-sm font-bold uppercase tracking-wider">板块异动解读</span>
        </div>
        {!hasSummary && !isLoading && (
          <button
            onClick={handleGenerate}
            className="text-xs bg-white text-indigo-600 px-3 py-1 rounded-full shadow-sm border border-indigo-100 hover:bg-indigo-50 transition-colors font-medium flex items-center"
          >
            <Zap size={12} className="mr-1" />
            生成分析
          </button>
        )}
      </div>

      {isLoading ? (
        <div className="flex items-center space-x-2 text-indigo-400 text-sm animate-pulse">
          <Activity size={14} className="animate-spin" />
          <span>AI 正在扫描盘口异动...</span>
        </div>
      ) : hasSummary ? (
        <div className="text-sm text-slate-700 leading-relaxed">
          <p>
            <strong className="text-indigo-900">板块总结：</strong>
            {boardName}整体呈现<span className="text-rose-600 font-medium">资金净流入</span>态势。
            其中<span className="bg-white px-1 rounded shadow-sm mx-1 font-medium">{stocks[0]?.name}</span>
            今日放量突破，主力资金净流入超 5 亿。
            建议关注<span className="bg-white px-1 rounded shadow-sm mx-1 font-medium">{stocks[1]?.name || stocks[0]?.name}</span>是否跟随上涨，注意5日均线支撑。
          </p>
        </div>
      ) : (
        <div className="text-sm text-slate-400 italic">
          点击上方按钮，让 AI 帮你分析该板块今日的资金流向与异常波动。
        </div>
      )}

      <div className="absolute -right-10 -bottom-10 w-32 h-32 bg-indigo-200/20 rounded-full blur-2xl pointer-events-none"></div>
    </div>
  );
};

export default AiSummaryCard;
