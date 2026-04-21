import { useEffect, useState } from 'react';
import api from '../../services/api';
import { 
  BookOpen, 
  Users, 
  FileCheck, 
  Calendar, 
  TrendingUp, 
  ArrowUpRight, 
  MoreVertical,
  Activity,
  CheckCircle2,
  Clock
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer
} from 'recharts';
import { format } from 'date-fns';

const AdminDashboard = () => {
  const [stats, setStats] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const { data } = await api.get('/admin/dashboard');
        setStats(data);
      } catch (error) {
        console.error('Failed to fetch dashboard stats');
      } finally {
        setIsLoading(false);
      }
    };
    fetchStats();
  }, []);

  const chartData = [
    { name: 'Apr 14', value: 45 },
    { name: 'Apr 15', value: 52 },
    { name: 'Apr 16', value: 38 },
    { name: 'Apr 17', value: 65 },
    { name: 'Apr 18', value: 48 },
    { name: 'Apr 19', value: 80 },
    { name: 'Apr 20', value: 95 },
  ];

  if (isLoading) return (
    <div className="space-y-8">
      <div className="h-10 w-48 bg-slate-200 rounded-lg animate-pulse"></div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map(i => <div key={i} className="h-32 bg-slate-100 rounded-2xl animate-pulse"></div>)}
      </div>
      <div className="h-96 bg-slate-100 rounded-2xl animate-pulse"></div>
    </div>
  );

  const kpis = [
    { label: 'Total Exams', value: stats?.exams || 0, icon: BookOpen, color: 'text-sky-600', bg: 'bg-sky-50' },
    { label: 'Total Students', value: stats?.users || 0, icon: Users, color: 'text-violet-600', bg: 'bg-violet-50' },
    { label: 'Submissions', value: stats?.submissions || 0, icon: FileCheck, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { label: 'Upcoming', value: stats?.upcomingExams?.length || 0, icon: Calendar, color: 'text-amber-600', bg: 'bg-amber-50' },
  ];

  return (
    <div className="space-y-8 pb-10">
      <div>
        <h1 className="heading-xl">Dashboard Overview</h1>
        <p className="text-muted mt-1">Welcome back! Here's what's happening with your assessments today.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {kpis.map((kpi, idx) => (
          <div key={idx} className="card-premium p-6 flex items-center gap-4">
            <div className={`w-12 h-12 ${kpi.bg} ${kpi.color} rounded-xl flex items-center justify-center`}>
              <kpi.icon size={24} />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{kpi.label}</p>
              <h3 className="text-2xl font-bold text-slate-900 mt-0.5">{kpi.value}</h3>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 card-premium p-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="heading-lg">Performance Trends</h3>
              <p className="text-muted">Assessment activity over the last 7 days</p>
            </div>
            <div className="flex items-center gap-2 text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full text-xs font-bold">
              <TrendingUp size={14} />
              +24% increase
            </div>
          </div>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{fontSize: 12, fill: '#64748b'}} 
                  dy={10}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{fontSize: 12, fill: '#64748b'}} 
                />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                />
                <Area 
                  type="monotone" 
                  dataKey="value" 
                  stroke="#0ea5e9" 
                  strokeWidth={3} 
                  fillOpacity={1} 
                  fill="url(#colorValue)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card-premium p-8">
          <h3 className="heading-lg mb-6">Upcoming Exams</h3>
          <div className="space-y-6">
            {stats?.upcomingExams?.length > 0 ? (
              stats.upcomingExams.map((exam: any) => (
                <div key={exam.id} className="flex gap-4 p-4 rounded-xl hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100">
                  <div className="w-12 h-12 bg-sky-100 text-sky-600 rounded-xl flex flex-col items-center justify-center flex-shrink-0">
                    <span className="text-[10px] font-bold uppercase">{format(new Date(exam.startTime), 'MMM')}</span>
                    <span className="text-lg font-bold leading-none">{format(new Date(exam.startTime), 'dd')}</span>
                  </div>
                  <div className="flex-1 overflow-hidden">
                    <h4 className="font-bold text-slate-900 truncate">{exam.title}</h4>
                    <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                      <Clock size={12} />
                      {format(new Date(exam.startTime), 'hh:mm a')} • {exam.duration}m
                    </p>
                  </div>
                  <button className="text-slate-400 hover:text-slate-600">
                    <MoreVertical size={18} />
                  </button>
                </div>
              ))
            ) : (
              <div className="text-center py-10 text-slate-400">
                <Calendar size={48} className="mx-auto mb-4 opacity-20" />
                <p>No upcoming exams</p>
              </div>
            )}
          </div>
          <Link to="/admin/exams" className="btn-premium-secondary w-full mt-6 text-sm">
            View All Exams
          </Link>
        </div>
      </div>

      <div className="card-premium overflow-hidden">
        <div className="p-8 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="heading-lg">Recent Submissions</h3>
            <p className="text-muted">Latest student attempt activities across all exams</p>
          </div>
          <Link to="/admin/results" className="text-sky-600 text-sm font-bold hover:underline flex items-center gap-1">
            View All <ArrowUpRight size={16} />
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50">
                <th className="p-4 px-8 text-xs font-bold text-slate-500 uppercase tracking-widest border-b border-slate-100">Student</th>
                <th className="p-4 px-8 text-xs font-bold text-slate-500 uppercase tracking-widest border-b border-slate-100">Assessment</th>
                <th className="p-4 px-8 text-xs font-bold text-slate-500 uppercase tracking-widest border-b border-slate-100">Status</th>
                <th className="p-4 px-8 text-xs font-bold text-slate-500 uppercase tracking-widest border-b border-slate-100">Score</th>
                <th className="p-4 px-8 text-xs font-bold text-slate-500 uppercase tracking-widest border-b border-slate-100">Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {stats?.recentActivity?.length > 0 ? (
                stats.recentActivity.map((activity: any) => (
                  <tr key={activity.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="p-4 px-8">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center text-slate-600 font-bold text-xs">
                          {activity.studentName.charAt(0)}
                        </div>
                        <span className="font-semibold text-slate-900">{activity.studentName}</span>
                      </div>
                    </td>
                    <td className="p-4 px-8 text-slate-600 font-medium">{activity.examTitle}</td>
                    <td className="p-4 px-8">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        activity.status === 'submitted' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'
                      }`}>
                        {activity.status === 'submitted' ? <CheckCircle2 size={12} /> : <Activity size={12} />}
                        {activity.status}
                      </span>
                    </td>
                    <td className="p-4 px-8 font-bold text-slate-900">{activity.score}%</td>
                    <td className="p-4 px-8 text-slate-500 text-sm">{format(new Date(activity.timestamp), 'MMM dd, hh:mm a')}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="p-10 text-center text-slate-400">
                    No recent activity found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
