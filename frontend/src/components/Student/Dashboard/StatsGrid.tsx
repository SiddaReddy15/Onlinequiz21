import { motion } from 'framer-motion';
import { 
  Trophy, 
  Target, 
  Clock, 
  Flame, 
  TrendingUp, 
  TrendingDown,
  type LucideIcon
} from 'lucide-react';
import { clsx } from 'clsx';

interface StatCardProps {
  label: string;
  value: string | number;
  icon: LucideIcon;
  trend?: {
    value: number;
    isUp: boolean;
  };
  color: 'sky' | 'emerald' | 'amber' | 'rose' | 'indigo';
  description: string;
  delay: number;
}

const StatCard = ({ label, value, icon: Icon, trend, color, description, delay }: StatCardProps) => {
  const colorMap = {
    sky: 'bg-sky-50 text-sky-600 border-sky-100',
    emerald: 'bg-emerald-50 text-emerald-600 border-emerald-100',
    amber: 'bg-amber-50 text-amber-600 border-amber-100',
    rose: 'bg-rose-50 text-rose-600 border-rose-100',
    indigo: 'bg-indigo-50 text-indigo-600 border-indigo-100',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      whileHover={{ y: -5, transition: { duration: 0.2 } }}
      className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm hover:shadow-xl hover:shadow-slate-200/50 transition-all group"
    >
      <div className="flex justify-between items-start mb-4">
        <div className={clsx(
          "w-12 h-12 rounded-2xl flex items-center justify-center border transition-transform group-hover:scale-110",
          colorMap[color]
        )}>
          <Icon size={24} />
        </div>
        {trend && (
          <div className={clsx(
            "flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black tracking-wider uppercase",
            trend.isUp ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600"
          )}>
            {trend.isUp ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
            {trend.value}%
          </div>
        )}
      </div>
      
      <div>
        <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-1">{label}</p>
        <div className="flex items-baseline gap-2">
          <h3 className="text-3xl font-black text-slate-900 tracking-tight">{value}</h3>
          <span className="text-[10px] font-bold text-slate-400 uppercase">{description}</span>
        </div>
      </div>
    </motion.div>
  );
};

interface StatsGridProps {
  stats: {
    totalAttempts: number;
    avgScore: number;
    totalTimeSpent: number;
    percentile: number;
    streakDays: number;
  };
}

export const StatsGrid = ({ stats }: StatsGridProps) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      <StatCard 
        label="Global Percentile"
        value={`Top ${stats.percentile}%`}
        icon={Trophy}
        color="amber"
        description="Elite Standing"
        trend={{ value: 2.4, isUp: true }}
        delay={0.1}
      />
      <StatCard 
        label="Accuracy Rate"
        value={`${stats.avgScore}%`}
        icon={Target}
        color="emerald"
        description="Performance"
        trend={{ value: 5.1, isUp: true }}
        delay={0.2}
      />
      <StatCard 
        label="Practice Time"
        value={`${Math.floor(stats.totalTimeSpent / 60)}h ${stats.totalTimeSpent % 60}m`}
        icon={Clock}
        color="sky"
        description="Total Focus"
        delay={0.3}
      />
      <StatCard 
        label="Learning Streak"
        value={`${stats.streakDays} Days`}
        icon={Flame}
        color="rose"
        description="Consistent"
        delay={0.4}
      />
    </div>
  );
};
