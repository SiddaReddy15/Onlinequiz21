import { useEffect, useState } from 'react';
import api from '../../services/api';
import { 
  BookOpen, 
  Clock, 
  Calendar, 
  Trophy, 
  TrendingUp, 
  AlertCircle, 
  Target,
  Zap,
  Bell,
  Search,
  ArrowUpRight,
  Star,
  Award,
  Activity,
  ArrowRight,
  Flame,
  Layout,
  History,
  Rocket,
  Shield,
  MessageSquare,
  CheckCircle2
} from 'lucide-react';
import { format } from 'date-fns';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip
} from 'recharts';
import { clsx } from 'clsx';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

const StatSkeleton = () => (
  <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 animate-pulse">
    <div className="w-14 h-14 bg-slate-100 rounded-2xl mb-6" />
    <div className="h-3 w-20 bg-slate-100 rounded mb-4" />
    <div className="h-8 w-32 bg-slate-100 rounded" />
  </div>
);

const StudentDashboard = () => {
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await api.get('/student/dashboard');
        setData(res.data);
      } catch (error) {
        toast.error('Failed to sync dashboard data');
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  if (isLoading) return (
    <div className="max-w-7xl mx-auto space-y-10 pb-20 px-4">
      <div className="h-20 w-1/3 bg-slate-100 rounded-2xl animate-pulse" />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map(i => <StatSkeleton key={i} />)}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2 h-96 bg-slate-100 rounded-[2.5rem] animate-pulse" />
        <div className="h-96 bg-slate-100 rounded-[2.5rem] animate-pulse" />
      </div>
    </div>
  );

  if (!data) return (
    <div className="h-[60vh] flex flex-col items-center justify-center text-center">
      <AlertCircle size={48} className="text-rose-500 mb-4" />
      <h2 className="text-xl font-bold text-slate-900">Unable to load dashboard</h2>
      <p className="text-slate-500 mt-2">Please check your connection and try again.</p>
      <button 
        onClick={() => window.location.reload()}
        className="mt-6 px-6 py-2 bg-sky-500 text-white rounded-xl font-bold hover:bg-sky-600 transition-all"
      >
        Retry Sync
      </button>
    </div>
  );

  const { upcomingExams, recentResults, stats, performanceHistory, topicAnalysis, badges, notifications } = data;

  const quickActions = [
    { label: 'Start Exam', icon: Rocket, color: 'bg-sky-500', path: '/student', description: 'Take a new assessment' },
    { label: 'Leaderboard', icon: Trophy, color: 'bg-amber-500', path: '/student/leaderboard', description: 'Check your global rank' },
    { label: 'History', icon: History, color: 'bg-emerald-500', path: '/student/results', description: 'Review past attempts' },
    { label: 'Achievements', icon: Award, color: 'bg-purple-500', path: '#', description: 'View your badges' },
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-10 pb-20 px-4">
      {/* SaaS Header */}
      <div className="flex flex-col lg:flex-row items-center justify-between gap-8 pt-4">
        <div className="flex-1">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
            <h1 className="text-4xl font-black text-slate-900 tracking-tight leading-none">
              Dashboard <span className="text-sky-500">Analytics</span>
            </h1>
            <p className="text-slate-500 mt-3 text-lg font-medium">
              Welcome back, <span className="text-slate-900 font-bold">{user?.name}</span>. Your learning journey is in full swing!
            </p>
          </motion.div>
        </div>

        <div className="flex items-center gap-4">
          <div className="relative group hidden sm:block">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-sky-500 transition-colors" size={18} />
            <input 
              type="text" 
              placeholder="Quick search..." 
              className="pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-2xl outline-none w-64 shadow-sm focus:shadow-xl focus:shadow-sky-500/5 focus:border-sky-500 transition-all"
            />
          </div>
          <button className="p-3 bg-white text-slate-600 rounded-2xl border border-slate-200 shadow-sm hover:text-sky-600 transition-all relative">
            <Bell size={22} />
            <span className="absolute top-2.5 right-2.5 w-3 h-3 bg-rose-500 rounded-full border-2 border-white" />
          </button>
        </div>
      </div>

      {/* Main Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Exams Taken', value: stats.totalAttempts, icon: BookOpen, color: 'sky', trend: 'Lifetime' },
          { label: 'Avg Accuracy', value: `${stats.avgScore}%`, icon: Target, color: 'emerald', trend: stats.avgScore > 70 ? 'Superior' : 'Standard' },
          { label: 'Global Rank', value: stats.currentRank, icon: Trophy, color: 'amber', trend: `Top ${stats.percentile}%` },
          { label: 'Days Streak', value: '03', icon: Flame, color: 'orange', trend: 'Consistency' },
        ].map((stat, i) => (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            key={stat.label} 
            className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm hover:shadow-2xl hover:shadow-sky-500/5 transition-all group"
          >
            <div className={clsx(
              "w-14 h-14 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform",
              stat.color === 'sky' && "bg-sky-50 text-sky-600",
              stat.color === 'emerald' && "bg-emerald-50 text-emerald-600",
              stat.color === 'amber' && "bg-amber-50 text-amber-600",
              stat.color === 'orange' && "bg-orange-50 text-orange-600",
            )}>
              <stat.icon size={28} />
            </div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{stat.label}</p>
            <div className="flex items-baseline gap-2 mt-2">
              <p className="text-4xl font-black text-slate-900 tracking-tight">{stat.value}</p>
              <p className="text-[10px] font-bold text-slate-400 uppercase">{stat.trend}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Action and Chart Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2 space-y-10">
          {/* Performance Analytics */}
          <div className="card-premium p-10 space-y-8">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-slate-900">Performance Trend</h2>
                <p className="text-slate-500 mt-1">Detailed analysis of your assessment results</p>
              </div>
              <div className="flex items-center gap-2 text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-full text-xs font-bold">
                <TrendingUp size={14} /> +12% vs last month
              </div>
            </div>
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={performanceHistory.length > 0 ? performanceHistory : [{ date: 'Start', score: 0 }]}>
                  <defs>
                    <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.1}/>
                      <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#64748b' }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#64748b' }} domain={[0, 100]} />
                  <Tooltip contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)' }} />
                  <Area type="monotone" dataKey="score" stroke="#0ea5e9" strokeWidth={3} fillOpacity={1} fill="url(#colorScore)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Quick Actions Panel */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {quickActions.map((action, i) => (
              <motion.div
                whileHover={{ scale: 1.02, y: -5 }}
                key={action.label}
                onClick={() => action.path !== '#' && navigate(action.path)}
                className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm cursor-pointer hover:border-sky-500/50 hover:shadow-xl transition-all flex items-center gap-6"
              >
                <div className={`w-14 h-14 ${action.color} text-white rounded-2xl flex items-center justify-center shadow-lg`}>
                  <action.icon size={24} />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900">{action.label}</h4>
                  <p className="text-xs text-slate-500 mt-1">{action.description}</p>
                </div>
                <ChevronRight size={18} className="ml-auto text-slate-300" />
              </motion.div>
            ))}
          </div>
        </div>

        {/* Strength & Notifications Sidebar */}
        <div className="space-y-10">
          {/* Notifications Card */}
          <div className="card-premium p-8 bg-slate-900 text-white relative overflow-hidden">
            <div className="relative z-10 space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold flex items-center gap-2">
                  <MessageSquare size={20} className="text-sky-400" /> News & Updates
                </h3>
                <span className="bg-sky-500 text-[10px] font-black px-2 py-0.5 rounded-full uppercase">Live</span>
              </div>
              <div className="space-y-4">
                {notifications.map((n: any) => (
                  <div key={n.id} className="p-3 bg-white/5 rounded-xl border border-white/10 flex items-start gap-3 group cursor-default hover:bg-white/10 transition-colors">
                    <div className="w-8 h-8 bg-sky-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                      {n.type === 'exam' ? <Layout size={14} className="text-sky-400" /> : <Trophy size={14} className="text-sky-400" />}
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed">{n.message}</p>
                  </div>
                ))}
              </div>
            </div>
            <Shield size={120} className="absolute -bottom-10 -right-10 text-white/5" />
          </div>

          {/* Topic Strengths */}
          <div className="card-premium p-8 space-y-8">
            <h3 className="text-lg font-bold flex items-center gap-2">
              <Activity size={20} className="text-purple-500" /> Skills Matrix
            </h3>
            <div className="space-y-6">
              {topicAnalysis.map((topic: any) => (
                <div key={topic.name} className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-600">{topic.name}</span>
                    <span className="text-slate-400 font-bold">{topic.score}%</span>
                  </div>
                  <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }} 
                      animate={{ width: `${topic.score}%` }} 
                      className={clsx(
                        "h-full rounded-full",
                        topic.score >= 80 ? "bg-emerald-500" : topic.score >= 50 ? "bg-sky-500" : "bg-rose-500"
                      )}
                    />
                  </div>
                </div>
              ))}
            </div>
            <button className="btn-premium-secondary w-full text-xs py-3">View Detailed Report</button>
          </div>
        </div>
      </div>

      {/* Bottom Grid: Activity, Upcoming, Badges */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-10">
        <div className="lg:col-span-2 space-y-6">
          <h2 className="text-2xl font-bold text-slate-900">Available Missions</h2>
          <div className="grid gap-6">
            {upcomingExams.length > 0 ? upcomingExams.map((exam: any) => (
              <motion.div key={exam.id} whileHover={{ y: -5 }} className="bg-white p-6 rounded-[2rem] border border-slate-200 flex items-center justify-between gap-6 hover:border-sky-500 transition-all shadow-sm hover:shadow-xl">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-sky-50 text-sky-600 rounded-2xl flex items-center justify-center">
                    <Layout size={24} />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900">{exam.title}</h4>
                    <p className="text-xs text-slate-400 mt-0.5">{exam.duration}m • {format(new Date(exam.startTime), 'MMM dd')}</p>
                  </div>
                </div>
                <button onClick={() => navigate(`/student/exams/${exam.id}`)} className="px-6 py-2.5 bg-sky-500 text-white font-bold rounded-xl hover:bg-sky-600 transition-all text-sm flex items-center gap-2">
                  Launch <ArrowRight size={16} />
                </button>
              </motion.div>
            )) : (
              <div className="py-16 bg-slate-50 border-2 border-dashed border-slate-200 rounded-[2.5rem] text-center">
                <AlertCircle size={40} className="mx-auto text-slate-300 mb-4" />
                <p className="text-slate-500 font-bold">No active missions right now.</p>
              </div>
            )}
          </div>
        </div>

        {/* Recent Activity Timeline */}
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-slate-900">Recent Activity</h2>
          <div className="card-premium p-8 space-y-6">
            <div className="relative border-l-2 border-slate-100 ml-4 pl-8 space-y-8">
              {recentResults.map((result: any) => (
                <div key={result.id} className="relative">
                  <div className={clsx(
                    "absolute -left-[41px] top-1 w-6 h-6 rounded-full border-4 border-white shadow-sm flex items-center justify-center",
                    result.score >= 70 ? "bg-emerald-500" : "bg-sky-500"
                  )} />
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{format(new Date(result.submittedAt), 'MMM dd')}</p>
                    <h5 className="text-sm font-bold text-slate-900 mt-1 line-clamp-1">{result.examTitle}</h5>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-lg font-black text-slate-900">{result.score}%</span>
                      {result.score >= 70 && <CheckCircle2 size={14} className="text-emerald-500" />}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Achievements */}
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-slate-900">Hall of Fame</h2>
          <div className="card-premium p-8 space-y-6 text-center">
            <div className="grid grid-cols-2 gap-4">
              {badges.map((badge: any) => (
                <div key={badge.id} className={clsx(
                  "p-4 rounded-3xl border flex flex-col items-center justify-center gap-2",
                  badge.color === 'blue' && "bg-sky-50 border-sky-100",
                  badge.color === 'orange' && "bg-orange-50 border-orange-100",
                  badge.color === 'amber' && "bg-amber-50 border-amber-100",
                  badge.color === 'purple' && "bg-purple-50 border-purple-100",
                )}>
                  <span className="text-3xl">{badge.icon}</span>
                  <p className="text-[8px] font-black uppercase tracking-widest leading-tight">{badge.title}</p>
                </div>
              ))}
            </div>
            <div className="p-6 bg-slate-900 rounded-[2rem] text-white">
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Status</p>
              <h4 className="text-xl font-black">Top {stats.percentile}%</h4>
              <p className="text-xs text-slate-500 mt-1">Elite Performer</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;
