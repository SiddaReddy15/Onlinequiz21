import { motion } from 'framer-motion';
import { TrendingUp, Users, ShieldCheck } from 'lucide-react';
import { clsx } from 'clsx';

interface RankInsightsProps {
  percentile: number;
  rank: number | string;
}

export const RankInsights = ({ percentile, rank }: RankInsightsProps) => {
  const status = percentile <= 10 ? 'Elite' : percentile <= 30 ? 'Master' : percentile <= 50 ? 'Pro' : 'Rising Star';
  const statusColor = percentile <= 10 ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-sky-50 text-sky-700 border-sky-100';

  return (
    <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm relative overflow-hidden">
      <h3 className="text-xl font-black text-slate-900 tracking-tight mb-8">Global Ranking</h3>
      
      <div className="flex flex-col items-center justify-center py-6">
        <div className="relative w-40 h-40 flex items-center justify-center">
          {/* Progress Circle (Simplified SVG) */}
          <svg className="w-full h-full transform -rotate-90">
            <circle
              cx="80"
              cy="80"
              r="70"
              stroke="currentColor"
              strokeWidth="8"
              fill="transparent"
              className="text-slate-100"
            />
            <motion.circle
              initial={{ strokeDasharray: "0 440" }}
              animate={{ strokeDasharray: `${(100 - percentile) * 4.4} 440` }}
              transition={{ duration: 2, ease: "easeOut" }}
              cx="80"
              cy="80"
              r="70"
              stroke="currentColor"
              strokeWidth="12"
              strokeLinecap="round"
              fill="transparent"
              className="text-sky-500"
            />
          </svg>
          
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
            <p className="text-4xl font-black text-slate-900 tracking-tighter">
              {String(rank).startsWith('#') ? rank : `#${rank}`}
            </p>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Global Rank</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mt-8">
        <div className="bg-slate-50 p-4 rounded-3xl border border-slate-100">
          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Percentile</p>
          <div className="flex items-center gap-2">
            <Users size={14} className="text-sky-500" />
            <span className="text-lg font-black text-slate-900">Top {percentile}%</span>
          </div>
        </div>
        <div className={clsx("p-4 rounded-3xl border", statusColor)}>
          <p className="text-[9px] font-black opacity-60 uppercase tracking-widest mb-1">Status</p>
          <div className="flex items-center gap-2">
            <ShieldCheck size={14} />
            <span className="text-lg font-black">{status}</span>
          </div>
        </div>
      </div>
      
      <div className="mt-6 flex items-center justify-center gap-2 text-xs font-bold text-slate-400">
        <TrendingUp size={14} className="text-emerald-500" />
        {percentile <= 10 ? 'Elite performance this week' : 'Rising through the ranks'}
      </div>
    </div>
  );
};
