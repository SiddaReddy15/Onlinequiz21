import { motion } from 'framer-motion';
import { ArrowUpRight, Sparkles } from 'lucide-react';

interface MotivationCardProps {
  userName?: string;
  topic?: string;
}

export const MotivationCard = ({ userName, topic = 'Software Engineering' }: MotivationCardProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-8 rounded-[2.5rem] text-white relative overflow-hidden shadow-xl"
    >
      <div className="relative z-10 flex flex-col h-full">
        <div className="w-12 h-12 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center mb-6">
          <Sparkles size={24} className="text-sky-400" />
        </div>
        
        <h3 className="text-2xl font-black leading-tight tracking-tight mb-4">
          Success is a journey, not a destination.
        </h3>
        
        <p className="text-slate-300 text-sm font-medium leading-relaxed mb-8">
          Excellent work, <span className="text-white font-bold">{userName}</span>! Your recent focus on <span className="text-sky-400 font-bold">{topic}</span> is paying off. You're outperforming 85% of peers this week.
        </p>

        <button className="mt-auto group flex items-center gap-2 text-white font-black text-[10px] uppercase tracking-[0.2em] hover:gap-3 transition-all">
          View Detailed Insights
          <ArrowUpRight size={14} className="group-hover:rotate-45 transition-transform text-sky-400" />
        </button>
      </div>

      {/* Decorative background effects */}
      <Sparkles className="absolute top-8 right-8 text-white/10" size={120} />
      <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-white/10 blur-3xl rounded-full" />
    </motion.div>
  );
};
