import { useEffect, useState } from 'react';
import api from '../../services/api';
import { 
  Bell,
  Search, 
  Settings,
  HelpCircle,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

// New Modular Components
import {
  StatsGrid as Stats,
  PerformanceChart,
  UpcomingExams,
  BadgeSystem as Achievements,
  ActivityTimeline as RecentActivity,
  QuickActions,
  MotivationCard as ProgressCard,
  RankInsights,
  GlobalLeaderboard
} from '../../components/Student/Dashboard';

const StudentDashboard = () => {
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await api.get('/student/dashboard');
        setData(res.data);
      } catch (error) {
        console.error('API Error:', error);
        setData(null); 
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  // Standard Mock Data for consistent UI
  const stats = {
    totalAttempts: data?.stats?.totalAttempts ?? 15,
    avgScore: data?.stats?.avgScore ?? 82,
    totalTimeSpent: data?.stats?.totalTimeSpent ?? 540,
    currentRank: data?.stats?.currentRank ?? '1',
    percentile: data?.stats?.percentile ?? 3,
    streakDays: data?.stats?.streakDays ?? 12,
  };

  const performance = data?.performanceHistory?.length > 0 ? data.performanceHistory : [
    { date: 'Week 1', score: 45 },
    { date: 'Week 2', score: 52 },
    { date: 'Week 3', score: 48 },
    { date: 'Week 4', score: 70 },
    { date: 'Week 5', score: 65 },
    { date: 'Week 6', score: 85 },
    { date: 'Week 7', score: 82 },
  ];


  const exams = data?.upcomingExams || [];

  const activities = data?.recentResults?.map((r: any) => ({
    id: r.id,
    type: 'exam',
    title: r.examTitle,
    timestamp: r.submittedAt,
    score: r.score
  })) || [
    { id: 'a1', type: 'exam', title: 'React Basics', timestamp: new Date().toISOString(), score: 92 },
    { id: 'a2', type: 'badge', title: 'Earned "Fast Learner" Badge', timestamp: new Date(Date.now() - 3600000).toISOString() },
    { id: 'a3', type: 'exam', title: 'SQL Intermediate', timestamp: new Date(Date.now() - 86400000).toISOString(), score: 78 },
  ];

  const badges = data?.badges || [
    { id: 'b1', title: 'First Steps', icon: 'award', color: 'sky', isLocked: false, description: 'Completed your first assessment' },
    { id: 'b2', title: 'Top Scorer', icon: 'zap', color: 'amber', isLocked: false, description: 'Scored 90%+ in an exam' },
    { id: 'b3', title: 'Consistent', icon: 'flame', color: 'rose', isLocked: true, description: '7-day active streak' },
  ];

  if (isLoading) return (
    <div className="max-w-7xl mx-auto p-6 space-y-8 animate-pulse">
      <div className="h-10 w-48 bg-slate-200 rounded-lg" />
      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-8 space-y-6">
          <div className="h-32 bg-slate-100 rounded-2xl" />
          <div className="h-96 bg-slate-100 rounded-2xl" />
        </div>
        <div className="col-span-4 space-y-6">
          <div className="h-64 bg-slate-100 rounded-2xl" />
          <div className="h-64 bg-slate-100 rounded-2xl" />
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-8 pb-12">
      {/* HEADER */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">
            Welcome back, <span className="text-sky-500">{user?.name}</span>
          </h1>
          <p className="text-slate-500 font-medium">Here's what's happening with your learning today.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative group hidden md:block">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Search..." 
              className="pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl outline-none w-64 focus:border-sky-500 transition-all shadow-sm"
            />
          </div>
          <button className="p-2.5 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-all relative">
            <Bell size={20} className="text-slate-600" />
            <span className="absolute top-2 right-2 w-2 h-2 bg-rose-500 rounded-full border-2 border-white" />
          </button>
          <button className="p-2.5 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-all">
            <Settings size={20} className="text-slate-600" />
          </button>
        </div>
      </div>

      {/* 2-COLUMN GRID LAYOUT */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* LEFT SIDE (8 SPAN) */}
        <div className="lg:col-span-8 space-y-8">
          <Stats stats={stats} />
          <PerformanceChart data={performance} />
          <div id="assessments" className="grid grid-cols-1 2xl:grid-cols-2 gap-8">
            <UpcomingExams exams={exams} />
            <RecentActivity activities={activities} />
          </div>
          <GlobalLeaderboard entries={data?.globalLeaderboard || []} />
        </div>

        {/* RIGHT SIDE (4 SPAN) */}
        <div className="lg:col-span-4 space-y-8">
          <ProgressCard userName={user?.name} topic={data?.topTopic || 'Software Engineering'} />
          <RankInsights rank={stats.currentRank} percentile={stats.percentile} />
          <QuickActions />
          <Achievements badges={badges} />
          
          <div className="bg-white p-8 rounded-[2rem] border border-slate-200 shadow-sm text-center">
            <HelpCircle size={40} className="mx-auto text-sky-200 mb-4" />
            <h4 className="font-bold text-slate-900">Need Assistance?</h4>
            <p className="text-slate-500 text-xs mt-2 leading-relaxed px-4">Our support team is available 24/7 to help you with any technical issues.</p>
            <button 
              onClick={() => window.location.href = 'mailto:support@quizpro.com?subject=Technical Assistance Request'}
              className="mt-6 w-full py-3.5 text-sky-600 bg-sky-50 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-sky-100 transition-all border border-sky-100"
            >
              Contact Support
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

export default StudentDashboard;
