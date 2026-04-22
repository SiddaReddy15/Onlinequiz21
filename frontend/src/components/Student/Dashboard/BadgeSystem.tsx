import React from 'react';
import { motion } from 'framer-motion';
import { Trophy, Lock, Star, Award, Zap, Flame, Crown } from 'lucide-react';
import { clsx } from 'clsx';

interface Badge {
  id: string;
  title: string;
  icon: string;
  color: string;
  isLocked: boolean;
  description: string;
}

interface BadgeSystemProps {
  badges: Badge[];
}

export const BadgeSystem = ({ badges }: BadgeSystemProps) => {
  const getBadgeIcon = (iconStr: string) => {
    switch (iconStr) {
      case 'trophy': return Trophy;
      case 'star': return Star;
      case 'award': return Award;
      case 'zap': return Zap;
      case 'flame': return Flame;
      case 'crown': return Crown;
      default: return Award;
    }
  };

  return (
    <div className="bg-slate-900 p-8 rounded-[2.5rem] text-white relative overflow-hidden shadow-2xl">
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h3 className="text-xl font-black tracking-tight">Achievements</h3>
            <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mt-1">
              {badges.filter(b => !b.isLocked).length} / {badges.length} Collected
            </p>
          </div>
          <Trophy className="text-amber-500" size={24} />
        </div>

        {/* Rank & Stats Summary */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          <div className="bg-white/5 border border-white/10 p-4 rounded-2xl">
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Current Rank</p>
            <p className="text-xl font-black">🏆 Rank #1</p>
          </div>
          <div className="bg-white/5 border border-white/10 p-4 rounded-2xl">
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Experience</p>
            <p className="text-xl font-black">🔥 3 Completed</p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          {badges.map((badge) => (
            <motion.div
              key={badge.id}
              whileHover={!badge.isLocked ? { scale: 1.1, rotate: 5 } : {}}
              className="relative group cursor-help"
            >
              <div className={clsx(
                "w-full aspect-square rounded-2xl flex items-center justify-center border-2 transition-all duration-300",
                badge.isLocked 
                  ? "bg-slate-800/50 border-slate-700/50 text-slate-600 opacity-50 grayscale" 
                  : `bg-gradient-to-br from-slate-800 to-slate-900 border-white/10 text-${badge.color}-400 shadow-xl group-hover:border-${badge.color}-500/50`
              )}>
                {badge.isLocked ? <Lock size={20} /> : React.createElement(getBadgeIcon(badge.icon), { size: 28 })}
              </div>
              
              {/* Tooltip on Hover */}
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 w-32 p-3 bg-white text-slate-900 rounded-xl text-[10px] font-bold opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none shadow-2xl text-center z-20">
                <p className="text-slate-900 mb-1">{badge.title}</p>
                <p className="text-slate-400 font-medium leading-tight">{badge.description}</p>
                <div className="absolute top-full left-1/2 -translate-x-1/2 border-8 border-transparent border-t-white" />
              </div>
            </motion.div>
          ))}
        </div>

        <button className="w-full mt-8 py-3.5 bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded-2xl text-xs font-black uppercase tracking-widest transition-all">
          View Hall of Fame
        </button>
      </div>

      {/* Decorative background effects */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-sky-500/10 blur-3xl rounded-full -mr-16 -mt-16" />
      <div className="absolute bottom-0 left-0 w-32 h-32 bg-purple-500/10 blur-3xl rounded-full -ml-16 -mb-16" />
    </div>
  );
};
