import { useEffect, useState } from 'react';
import api from '../../services/api';
import { 
  BookOpen, 
  Clock, 
  Calendar, 
  Trophy, 
  TrendingUp, 
  TrendingDown,
  AlertCircle, 
  Target,
  Zap,
  Bell,
  Search,
  ArrowUpRight,
  ChevronRight,
  Star,
  Award,
  Activity,
  ArrowRight,
  Flame,
  Layout,
  History
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
  Tooltip,
  BarChart,
  Bar,
  Cell
} from 'recharts';
import { clsx } from 'clsx';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

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
    <div className="h-[80vh] flex flex-col items-center justify-center gap-6">
      <div className="relative">
        <div className="w-20 h-20 border-4 border-sky-100 border-t-sky-500 rounded-full animate-spin" />
        <div className="absolute inset-0 flex items-center justify-center">
          <Zap size={24} className="text-sky-500 animate-pulse" />
        </div>
      </div>
      <p className="text-sm font-bold text-slate-400 uppercase tracking-[0.2em]">Building Your Analytics Hub...</p>
    </div>
  );

  const { upcomingExams, recentResults, stats, performanceHistory, topicAnalysis, badges, notifications } = data;

  return (
    <div className="max-w-7xl mx-auto space-y-10 pb-20 px-4">
      {/* Premium Header */}
      <div className="flex flex-col lg:flex-row items-center justify-between gap-8 py-4">
        <div className="flex-1 text-center lg:text-left">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <h1 className="text-4xl font-black text-slate-900 tracking-tight leading-none">
              Welcome back, <span className="text-sky-500">{user?.name || 'Explorer'}!</span> 👋
            </h1>
            <p className="text-slate-500 mt-3 text-lg font-medium">
              You've completed <span className="text-slate-900 font-bold">{stats.totalAttempts} assessments</span> so far. Keep pushing!
            </p>
          </motion.div>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-4">
          <div className="relative group hidden sm:block">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-sky-500 transition-colors" size={18} />
            <input 
              type="text" 
              placeholder="Find assessments..." 
              className="pl-11 pr-4 py-3.5 bg-white border border-slate-200 rounded-[1.25rem] outline-none w-72 shadow-sm focus:shadow-xl focus:shadow-sky-500/5 focus:border-sky-500 transition-all duration-300"
            />
          </div>
          
          <button className="relative p-3.5 bg-white text-slate-600 rounded-[1.25rem] border border-slate-200 shadow-sm hover:shadow-xl hover:border-sky-500/50 hover:text-sky-600 transition-all group">
            <Bell size={22} />
            <span className="absolute top-3.5 right-3.5 w-3 h-3 bg-rose-500 rounded-full border-2 border-white animate-pulse" />
          </button>

          <button 
            onClick={() => navigate('/student/results')}
            className="flex items-center gap-3 px-6 py-3.5 bg-slate-900 text-white font-bold rounded-[1.25rem] shadow-xl shadow-slate-900/20 hover:scale-[1.02] active:scale-95 transition-all"
          >
            <History size={18} /> My Progress
          </button>
        </div>
      </div>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Exams Taken', value: stats.totalAttempts, icon: BookOpen, color: 'sky', trend: `+${stats.totalAttempts > 0 ? 1 : 0} this week` },
          { label: 'Average Score', value: `${stats.avgScore}%`, icon: Target, color: 'emerald', trend: stats.avgScore > 70 ? 'High Accuracy' : 'Improving' },
          { label: 'Global Rank', value: stats.currentRank, icon: Trophy, color: 'amber', trend: `Top ${stats.percentile}% students` },
          { label: 'Streak', value: '3 Days', icon: Flame, color: 'orange', trend: 'Consistency is key!' },
        ].map((stat, i) => (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            key={stat.label} 
            className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm hover:shadow-2xl hover:shadow-sky-500/5 hover:-translate-y-1 transition-all duration-300"
          >
            <div className={clsx(
              "w-14 h-14 rounded-2xl flex items-center justify-center mb-6",
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
              <p className="text-[10px] font-bold text-emerald-500 uppercase">{stat.trend}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Middle Section: Analytics & Topics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Performance Chart */}
        <div className="lg:col-span-2 card-premium p-10 space-y-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-3">
                <TrendingUp size={24} className="text-sky-500" /> Performance Analytics
              </h2>
              <p className="text-slate-500 mt-1">Detailed breakdown of your last {performanceHistory.length} attempts</p>
            </div>
            <div className="flex items-center gap-2 bg-slate-50 p-1.5 rounded-xl border border-slate-100">
              <button className="px-4 py-2 bg-white shadow-sm text-xs font-bold text-slate-900 rounded-lg">Score Trend</button>
              <button className="px-4 py-2 text-xs font-bold text-slate-500 rounded-lg hover:bg-white transition-all">Accuracy</button>
            </div>
          </div>

          <div className="h-80 w-full mt-6">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={performanceHistory.length > 0 ? performanceHistory : [{ date: 'Start', score: 0 }]}>
                <defs>
                  <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis 
                  dataKey="date" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 12, fill: '#64748b', fontWeight: 600 }} 
                  dy={10}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 12, fill: '#64748b', fontWeight: 600 }} 
                  domain={[0, 100]}
                />
                <Tooltip 
                  contentStyle={{ 
                    borderRadius: '20px', 
                    border: 'none', 
                    boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)',
                    padding: '16px'
                  }}
                  itemStyle={{ fontWeight: 800, fontSize: '14px' }}
                />
                <Area 
                  type="monotone" 
                  dataKey="score" 
                  stroke="#0ea5e9" 
                  strokeWidth={4} 
                  fillOpacity={1} 
                  fill="url(#colorScore)" 
                  animationDuration={2000}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Topic Breakdown */}
        <div className="card-premium p-10 flex flex-col">
          <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-3 mb-8">
            <Activity size={24} className="text-purple-500" /> Topic Strength
          </h2>
          <div className="space-y-8 flex-1">
            {topicAnalysis.map((topic: any) => (
              <div key={topic.name} className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-bold text-slate-700">{topic.name}</span>
                  <span className="text-slate-500 font-bold">{topic.score}%</span>
                </div>
                <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${topic.score}%` }}
                    transition={{ duration: 1.5, ease: "easeOut" }}
                    className={clsx(
                      "h-full rounded-full transition-all",
                      topic.score >= 80 ? "bg-emerald-500" : topic.score >= 50 ? "bg-sky-500" : "bg-rose-500"
                    )}
                  />
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-10 p-6 bg-slate-50 rounded-3xl border border-slate-100">
            <div className="flex items-center gap-3 mb-2">
              <Zap size={18} className="text-amber-500" />
              <p className="text-sm font-bold text-slate-900">Recommended Topic</p>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              Based on your scores, you should focus on <span className="text-sky-600 font-bold">React Architecture</span> this week to improve your percentile.
            </p>
          </div>
        </div>
      </div>

      {/* Bottom Grid: Activity, Upcoming, Badges */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-10">
        {/* Upcoming Assessments Card */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-slate-900">Current Missions</h2>
            <Link to="/student" className="text-sky-600 font-bold text-sm hover:underline flex items-center gap-1">
              View Roadmap <ArrowRight size={16} />
            </Link>
          </div>

          <div className="grid gap-6">
            <AnimatePresence mode="popLayout">
              {upcomingExams.length > 0 ? upcomingExams.map((exam: any) => (
                <motion.div
                  layout
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  whileHover={{ scale: 1.01 }}
                  key={exam.id}
                  className="group bg-white p-6 rounded-[2rem] border border-slate-200 flex flex-col md:flex-row items-center justify-between gap-6 hover:border-sky-500/50 hover:shadow-2xl hover:shadow-sky-500/5 transition-all duration-300"
                >
                  <div className="flex items-center gap-6 flex-1">
                    <div className="w-16 h-16 bg-slate-900 rounded-2xl flex items-center justify-center text-white shadow-lg transition-all duration-500 group-hover:bg-sky-500 group-hover:rotate-6">
                      <Layout size={28} />
                    </div>
                    <div className="flex-1 overflow-hidden">
                      <h3 className="text-lg font-bold text-slate-900 truncate group-hover:text-sky-600 transition-colors">{exam.title}</h3>
                      <div className="flex flex-wrap items-center gap-4 mt-1">
                        <div className="flex items-center gap-1.5 text-xs font-bold text-slate-400">
                          <Clock size={14} className="text-sky-500" />
                          {exam.duration}m
                        </div>
                        <div className="flex items-center gap-1.5 text-xs font-bold text-slate-400">
                          <Calendar size={14} className="text-sky-500" />
                          {format(new Date(exam.startTime), 'MMM dd')}
                        </div>
                      </div>
                    </div>
                  </div>
                  <button 
                    onClick={() => navigate(`/student/exams/${exam.id}`)}
                    className="w-full md:w-auto px-8 py-3.5 bg-sky-500 text-white font-bold rounded-[1.25rem] hover:bg-sky-600 shadow-xl shadow-sky-500/20 active:scale-95 transition-all flex items-center justify-center gap-2 whitespace-nowrap"
                  >
                    Launch <ArrowUpRight size={18} />
                  </button>
                </motion.div>
              )) : (
                <div className="py-20 bg-slate-50 border-2 border-dashed border-slate-200 rounded-[2.5rem] text-center">
                  <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm border border-slate-100">
                    <AlertCircle size={32} className="text-slate-300" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900">No active assessments</h3>
                  <p className="text-slate-500 mt-2 max-w-xs mx-auto">Explore practice tests or check back later for new missions.</p>
                  <button className="mt-8 px-8 py-3 bg-white border border-slate-200 rounded-xl font-bold text-slate-600 hover:bg-slate-50 transition-all">
                    Explore Roadmap
                  </button>
                </div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Recent Results Timeline */}
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-slate-900">Recent History</h2>
          <div className="card-premium p-8 space-y-6">
            <div className="relative border-l-2 border-slate-100 ml-4 pl-8 space-y-8">
              {recentResults.map((result: any, i: number) => (
                <div key={result.id} className="relative">
                  <div className={clsx(
                    "absolute -left-[41px] top-1 w-6 h-6 rounded-full border-4 border-white shadow-sm flex items-center justify-center",
                    result.score >= 70 ? "bg-emerald-500" : "bg-sky-500"
                  )} />
                  <div className="group cursor-pointer">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{format(new Date(result.submittedAt), 'MMM dd, HH:mm')}</p>
                    <h4 className="text-sm font-bold text-slate-900 mt-1 line-clamp-1 group-hover:text-sky-600 transition-colors">{result.examTitle}</h4>
                    <p className={clsx(
                      "text-lg font-black mt-1",
                      result.score >= 70 ? "text-emerald-500" : "text-sky-500"
                    )}>{result.score}%</p>
                  </div>
                </div>
              ))}
            </div>
            
            <button 
              onClick={() => navigate('/student/results')}
              className="w-full py-4 rounded-2xl bg-slate-50 text-slate-600 font-bold text-xs uppercase tracking-widest hover:bg-slate-100 hover:text-slate-900 transition-all border border-slate-100"
            >
              Full Result Ledger
            </button>
          </div>
        </div>

        {/* Badges & Achievements */}
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-slate-900">Hall of Fame</h2>
          <div className="card-premium p-8">
            <div className="grid grid-cols-2 gap-4">
              {badges.map((badge: any) => (
                <motion.div 
                  whileHover={{ y: -5 }}
                  key={badge.id} 
                  className={clsx(
                    "p-4 rounded-3xl border flex flex-col items-center justify-center text-center gap-3",
                    badge.color === 'blue' && "bg-sky-50 border-sky-100",
                    badge.color === 'orange' && "bg-orange-50 border-orange-100",
                    badge.color === 'amber' && "bg-amber-50 border-amber-100",
                    badge.color === 'purple' && "bg-purple-50 border-purple-100",
                  )}
                >
                  <span className="text-4xl">{badge.icon}</span>
                  <p className="text-[10px] font-black uppercase tracking-widest leading-tight text-slate-700">{badge.title}</p>
                </motion.div>
              ))}
              {badges.length < 4 && (
                <div className="p-4 rounded-3xl border-2 border-dashed border-slate-100 flex flex-col items-center justify-center text-center gap-2 opacity-50">
                  <Star size={24} className="text-slate-300" />
                  <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">Locked</p>
                </div>
              )}
            </div>
            
            <div className="mt-8 p-6 bg-gradient-to-br from-slate-800 to-slate-900 rounded-[2rem] text-white overflow-hidden relative group">
              <Award size={60} className="absolute -bottom-4 -right-4 text-white/10 group-hover:scale-110 transition-transform duration-500" />
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Rank Insight</p>
              <h4 className="text-xl font-bold">Top {stats.percentile}%</h4>
              <p className="text-xs text-slate-500 mt-2">You're outperforming {Math.max(0, stats.totalStudents - stats.currentRank)} other students!</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;
