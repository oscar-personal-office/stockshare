import React from 'react';
import { BrainCircuit, Globe, Activity } from 'lucide-react';

interface GlobalMarketSummaryProps {
  summary: boolean;
  isLoading: boolean;
  onGenerate: () => void;
}

const GlobalMarketSummary: React.FC<GlobalMarketSummaryProps> = ({
  summary,
  isLoading,
  onGenerate,
}) => {
  return (
    <div className="bg-gradient-to-r from-slate-900 to-indigo-900 rounded-2xl p-6 text-white shadow-xl shadow-indigo-200 mb-8 relative overflow-hidden">
      <div className="relative z-10">
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-center space-x-2">
            <div className="bg-white/10 p-2 rounded-lg backdrop-blur-sm">
              <BrainCircuit size={24} className="text-indigo-300" />
            </div>
            <div>
              <h2 className="text-lg font-bold">全域 AI 市场情报</h2>
              <p className="text-indigo-200 text-xs">2026 财富看板 · A股市场情绪监测</p>
            </div>
          </div>

          {!summary && !isLoading && (
            <button
              onClick={onGenerate}
              className="bg-indigo-500 hover:bg-indigo-400 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center shadow-lg border border-indigo-400/50"
            >
              <Globe size={16} className="mr-2" />
              生成今日全局复盘
            </button>
          )}
        </div>

        {isLoading ? (
          <div className="py-4 flex items-center space-x-3 text-indigo-300 animate-pulse">
            <Activity className="animate-spin" />
            <span>AI 正在聚合北向资金流向与板块联动数据...</span>
          </div>
        ) : summary ? (
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/10">
            <p className="leading-relaxed text-indigo-50 text-sm md:text-base">
              <span className="text-indigo-300 font-bold mr-2">【要闻扫描】</span>
              今日沪深两市成交额突破万亿，<span className="text-white font-bold border-b border-indigo-400">新能源与券商</span>板块共振上涨。
              在此群关注的标的中，<span className="bg-rose-500/20 text-rose-300 px-1 rounded">东方财富</span> 领涨大金融，带动市场风险偏好提升。
              <br className="my-2" />
              <span className="text-indigo-300 font-bold mr-2">【操作建议】</span>
              北向资金午后加速净流入，建议关注 <span className="text-white font-bold">核心资产</span> 板块的修复机会，警惕高位题材股退潮风险。
              AI 判定明日变盘概率：<span className="font-mono text-yellow-400">80%</span>。
            </p>
          </div>
        ) : (
          <div className="text-indigo-300/60 text-sm italic py-2">
            点击右上角按钮，获取针对本群关注股票的全局市场情绪分析。
          </div>
        )}
      </div>

      {/* Background Decorations */}
      <div className="absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 bg-indigo-500/20 rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 left-0 -mb-10 -ml-10 w-40 h-40 bg-purple-500/20 rounded-full blur-3xl"></div>
    </div>
  );
};

export default GlobalMarketSummary;
