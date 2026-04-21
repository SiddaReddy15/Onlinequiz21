import { useEffect, useState } from 'react';
import api from '../../services/api';
import { 
  BookOpen, 
  Clock, 
  Calendar, 
  ChevronRight, 
  Trophy, 
  TrendingUp, 
  AlertCircle, 
  Loader2, 
  Target,
  Zap,
  Bell,
  Search,
  User,
  ArrowUpRight
} from 'lucide-react';
import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { clsx } from 'clsx';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

const StudentDashboard = () => {
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

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
      <p className="text-sm font-bold text-slate-400 uppercase tracking-[0.2em]">Synchronizing Assessment Hub...</p>
    </div>
  );

  const { user } = useAuth();
  const { upcomingExams, recentResults, stats } = data;

  return (
    <div className="max-w-7xl mx-auto space-y-10 pb-20">
      {/* Header with Search and Profile Mock */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Welcome back, {user?.name || 'Student'}! 👋</h1>
          <p className="text-slate-500 mt-1">Ready to tackle your assessments today?</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="relative hidden md:block">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Search assessments..." 
              className="pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl outline-none w-64 focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all"
            />
          </div>
          <button className="p-3 bg-slate-50 text-slate-600 rounded-2xl hover:bg-slate-100 transition-colors relative">
            <Bell size={20} />
            <span className="absolute top-2 right-2 w-2 h-2 bg-rose-500 rounded-full border-2 border-white" />
          </button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Exams Taken', value: stats.totalAttempts, icon: BookOpen, color: 'sky' },
          { label: 'Average Score', value: `${stats.avgScore}%`, icon: Target, color: 'emerald' },
          { label: 'Current Rank', value: stats.currentRank, icon: Trophy, color: 'amber' },
          { label: 'Active Missions', value: stats.activeMissions, icon: Zap, color: 'purple' },
        ].map((stat, i) => (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            key={stat.label} 
            className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-md transition-shadow"
          >
            <div className={clsx(
              "w-12 h-12 rounded-2xl flex items-center justify-center mb-4",
              stat.color === 'sky' && "bg-sky-50 text-sky-600",
              stat.color === 'emerald' && "bg-emerald-50 text-emerald-600",
              stat.color === 'amber' && "bg-amber-50 text-amber-600",
              stat.color === 'purple' && "bg-purple-50 text-purple-600",
            )}>
              <stat.icon size={24} />
            </div>
            <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">{stat.label}</p>
            <p className="text-3xl font-black text-slate-900 mt-1">{stat.value}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Main Feed: Upcoming Exams */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-slate-900">Upcoming Assessments</h2>
            <button className="text-sky-600 font-semibold text-sm hover:underline">View All</button>
          </div>

          <div className="grid gap-6">
            <AnimatePresence mode="popLayout">
              {upcomingExams.length > 0 ? upcomingExams.map((exam: any, i: number) => (
                <motion.div
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  whileHover={{ y: -5 }}
                  key={exam.id}
                  className="group bg-white p-8 rounded-[2rem] border border-slate-200 flex flex-col md:flex-row items-center justify-between gap-8 hover:border-sky-500/50 hover:shadow-xl hover:shadow-sky-500/5 transition-all duration-300"
                >
                  <div className="flex items-center gap-8 flex-1 w-full">
                    <div className="w-20 h-20 bg-slate-900 rounded-[1.75rem] flex items-center justify-center text-white shadow-lg transition-transform duration-500 group-hover:rotate-6 group-hover:bg-sky-500">
                      <BookOpen size={32} />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-2xl font-bold text-slate-900 mb-2 group-hover:text-sky-600 transition-colors">{exam.title}</h3>
                      <div className="flex flex-wrap items-center gap-6">
                        <div className="flex items-center gap-2 text-sm font-semibold text-slate-400">
                          <Clock size={16} className="text-sky-500" />
                          {exam.duration} Minutes
                        </div>
                        <div className="flex items-center gap-2 text-sm font-semibold text-slate-400">
                          <Calendar size={16} className="text-sky-500" />
                          {format(new Date(exam.startTime), 'MMM dd, HH:mm')}
                        </div>
                      </div>
                    </div>
                  </div>
                  <button 
                    onClick={() => navigate(`/student/exams/${exam.id}`)}
                    className="w-full md:w-auto px-10 py-4 bg-sky-500 text-white font-bold rounded-2xl hover:bg-sky-600 shadow-lg shadow-sky-500/20 active:scale-95 transition-all flex items-center justify-center gap-2"
                  >
                    Start Now <ArrowUpRight size={20} />
                  </button>
                </motion.div>
              )) : (
                <div className="py-20 bg-slate-50 border-2 border-dashed border-slate-200 rounded-[2rem] text-center">
                  <AlertCircle size={48} className="mx-auto text-slate-300 mb-4" />
                  <p className="text-slate-500 font-semibold">No assessments available at the moment.</p>
                </div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Sidebar Feed: Recent Activity & Results */}
        <div className="space-y-10">
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-slate-900">Recent Results</h2>
            <div className="bg-slate-900 rounded-[2.5rem] p-8 space-y-6 shadow-2xl shadow-slate-900/20">
              <div className="flex items-center justify-between pb-6 border-b border-white/10">
                <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center">
                  <TrendingUp size={24} className="text-sky-400" />
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Global Progress</p>
                  <p className="text-2xl font-black text-white">Consistent</p>
                </div>
              </div>

              <div className="space-y-4">
                {recentResults.length > 0 ? recentResults.map((item: any) => (
                  <div key={item.id} className="p-4 bg-white/5 rounded-2xl border border-white/5 hover:bg-white/10 transition-colors cursor-pointer flex items-center justify-between group">
                    <div>
                      <p className="text-sm font-bold text-white truncate w-40 mb-1 group-hover:text-sky-400 transition-colors">{item.examTitle}</p>
                      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{format(new Date(item.submittedAt), 'MMM dd')}</p>
                    </div>
                    <div className="text-right">
                      <p className={clsx(
                        "text-xl font-black tracking-tighter",
                        item.score >= 70 ? "text-emerald-400" : "text-rose-400"
                      )}>{item.score}%</p>
                      <p className="text-[8px] font-bold text-slate-600 uppercase tracking-widest">Graded</p>
                    </div>
                  </div>
                )) : (
                  <div className="text-center py-10 opacity-30">
                    <p className="text-xs font-bold text-white uppercase tracking-widest">No activities logged yet</p>
                  </div>
                )}
              </div>

              <button 
                onClick={() => navigate('/student/results')}
                className="w-full py-4 rounded-2xl bg-sky-500 text-white text-[10px] font-black uppercase tracking-[0.2em] hover:bg-sky-600 transition-all shadow-lg shadow-sky-500/20"
              >
                View Full History
              </button>
            </div>
          </div>

          {/* Quick Tips or Notifications Card */}
          <div className="bg-gradient-to-br from-indigo-600 to-violet-700 rounded-[2.5rem] p-8 text-white relative overflow-hidden group">
            <Zap size={120} className="absolute -bottom-10 -right-10 text-white/10 group-hover:scale-110 transition-transform duration-700" />
            <h3 className="text-xl font-bold mb-2">Pro Tip! 💡</h3>
            <p className="text-indigo-100 text-sm leading-relaxed mb-6">
              Focus on accuracy over speed. Review your "Attempt History" to understand your weak points and improve.
            </p>
            <button className="px-6 py-3 bg-white/20 hover:bg-white/30 rounded-xl text-sm font-bold transition-colors backdrop-blur-sm">
              Explore Guide
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;
