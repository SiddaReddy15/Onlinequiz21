import { motion } from 'framer-motion';
import { Rocket, Trophy, History, Award, ChevronRight, type LucideIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { clsx } from 'clsx';

interface Action {
  label: string;
  icon: LucideIcon;
  color: string;
  path: string;
  description: string;
}

export const QuickActions = () => {
  const navigate = useNavigate();

  const actions: Action[] = [
    { label: 'Start Exam', icon: Rocket, color: 'bg-sky-500', path: '/student/exams', description: 'Begin a new session' },
    { label: 'Leaderboard', icon: Trophy, color: 'bg-amber-500', path: '/student/leaderboard', description: 'Global rankings' },
    { label: 'Past Results', icon: History, color: 'bg-emerald-500', path: '/student/results', description: 'Review your performance' },
    { label: 'Certificates', icon: Award, color: 'bg-purple-500', path: '/student/results', description: 'Download your awards' },
  ];

  const handleActionClick = (action: Action) => {
    navigate(action.path);
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {actions.map((action) => (
        <motion.div
          key={action.label}
          whileHover={{ scale: 1.02, x: 5 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => handleActionClick(action)}
          className="group bg-white p-6 rounded-3xl border border-slate-200 shadow-sm cursor-pointer hover:border-sky-500/50 hover:shadow-xl hover:shadow-sky-500/5 transition-all flex items-center gap-5"
        >
          <div className={clsx(
            "w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-lg transition-transform group-hover:scale-110",
            action.color
          )}>
            <action.icon size={20} />
          </div>
          <div className="flex-1">
            <h4 className="text-sm font-black text-slate-900 group-hover:text-sky-600 transition-colors">{action.label}</h4>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">{action.description}</p>
          </div>
          <ChevronRight size={18} className="text-slate-300 group-hover:text-sky-500 transition-colors" />
        </motion.div>
      ))}
    </div>
  );
};
