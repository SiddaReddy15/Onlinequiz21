import { motion } from 'framer-motion';
import { Trophy, Medal, Crown, Star } from 'lucide-react';
import { clsx } from 'clsx';

interface LeaderboardEntry {
  studentId: string;
  studentName: string;
  totalScore: number;
  examsCompleted: number;
}

interface GlobalLeaderboardProps {
  entries: LeaderboardEntry[];
}

export const GlobalLeaderboard = ({ entries }: GlobalLeaderboardProps) => {
  return (
    <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden">
      <div className="p-8 border-b border-slate-50 flex items-center justify-between">
        <div>
           <h3 className="text-xl font-black text-slate-900 tracking-tight">Hall of Fame</h3>
           <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Platform Top Performers</p>
        </div>
        <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center text-amber-500 shadow-inner">
           <Trophy size={20} />
        </div>
      </div>

      <div className="p-4 space-y-2">
        {entries.map((entry, index) => {
          const RankIcon = index === 0 ? Crown : index === 1 ? Medal : index === 2 ? Medal : Star;
          const rankColor = index === 0 ? 'text-amber-500 bg-amber-50' : index === 1 ? 'text-slate-400 bg-slate-50' : index === 2 ? 'text-orange-400 bg-orange-50' : 'text-slate-300';

          return (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              key={entry.studentId}
              className={clsx(
                "group flex items-center justify-between p-4 rounded-2xl transition-all duration-300 hover:bg-slate-50 border border-transparent hover:border-slate-100",
                index === 0 && "bg-amber-50/30 border-amber-100/50"
              )}
            >
              <div className="flex items-center gap-4">
                <div className={clsx(
                  "w-10 h-10 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110",
                  rankColor
                )}>
                  <RankIcon size={20} />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900 group-hover:text-sky-600 transition-colors">
                    {entry.studentName}
                  </h4>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-0.5">
                    {entry.examsCompleted} Exams Completed
                  </p>
                </div>
              </div>
              
              <div className="text-right">
                <p className="text-lg font-black text-slate-900 tracking-tight">{entry.totalScore}</p>
                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Total Points</p>
              </div>
            </motion.div>
          );
        })}

        {entries.length === 0 && (
          <div className="py-12 text-center">
             <Star size={32} className="mx-auto text-slate-200 mb-3" />
             <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">No rankings yet</p>
          </div>
        )}
      </div>

      <div className="p-4 bg-slate-50/50">
         <button className="w-full py-3 bg-white border border-slate-200 rounded-xl text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] hover:bg-sky-500 hover:text-white hover:border-sky-500 transition-all">
            View Full Leaderboard
         </button>
      </div>
    </div>
  );
};
