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
  SkillsBreakdown as SkillBreakdown,
  UpcomingExams,
  BadgeSystem as Achievements,
  ActivityTimeline as RecentActivity,
  QuickActions,
  MotivationCard as ProgressCard,
  RankInsights
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
    currentRank: data?.stats?.currentRank ?? 42,
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

  const skills = data?.topicAnalysis?.length > 0 ? data.topicAnalysis : [
    { name: 'SQL Databases', score: 85, totalQuestions: 100, correctAnswers: 85 },
    { name: 'Python Core', score: 72, totalQuestions: 100, correctAnswers: 72 },
    { name: 'Data Structures', score: 90, totalQuestions: 100, correctAnswers: 90 },
    { name: 'React.js', score: 65, totalQuestions: 100, correctAnswers: 65 },
  ];

  const exams = data?.upcomingExams?.length > 0 ? data.upcomingExams : [
    { id: '1', title: 'Full Stack Challenge', duration: 90, startTime: new Date().toISOString(), category: 'Development', difficulty: 'Hard' },
    { id: '2', title: 'Algorithm Mastery', duration: 60, startTime: new Date(Date.now() + 86400000).toISOString(), category: 'CS Fundamentals', difficulty: 'Medium' },
  ];

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

  const badges = data?.badges?.length > 0 ? data.badges : [
    { id: 'b1', title: 'Problem Solver', icon: 'zap', color: 'sky', isLocked: false, description: 'Solved 50+ problems' },
    { id: 'b2', title: 'Top 10%', icon: 'trophy', color: 'amber', isLocked: false, description: 'Ranked in global top 10%' },
    { id: 'b3', title: 'Streak Hero', icon: 'flame', color: 'rose', isLocked: false, description: '7-day active streak' },
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
    <div className="max-w-7xl mx-auto p-4 md:p-8 space-y-8 bg-[#f8fafc] min-h-screen">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
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
          <UpcomingExams exams={exams} />
          <SkillBreakdown skills={skills} />
          <RecentActivity activities={activities} />
        </div>

        {/* RIGHT SIDE (4 SPAN) */}
        <div className="lg:col-span-4 space-y-8">
          <ProgressCard />
          <RankInsights rank={stats.currentRank} percentile={stats.percentile} />
          <QuickActions />
          <Achievements badges={badges} />
          
          {/* Motivation Insight Card */}
          <div className="bg-slate-900 text-white p-8 rounded-[2rem] relative overflow-hidden shadow-2xl">
            <div className="relative z-10">
              <h3 className="text-xl font-bold mb-2">Daily Goal</h3>
              <p className="text-slate-400 text-sm mb-6">Complete one more quiz to reach your weekly milestone!</p>
              <div className="h-2 bg-white/10 rounded-full overflow-hidden mb-2">
                <div className="h-full bg-sky-500 w-[75%]" />
              </div>
              <p className="text-[10px] font-black uppercase tracking-widest text-sky-400 text-right">75% Achieved</p>
            </div>
            <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-sky-500/10 rounded-full blur-3xl" />
          </div>

          <div className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm text-center">
            <HelpCircle size={32} className="mx-auto text-slate-300 mb-3" />
            <h4 className="font-bold text-slate-900">Need Help?</h4>
            <p className="text-slate-500 text-xs mt-1">Check our documentation or contact support.</p>
            <button className="mt-4 w-full py-2.5 text-sky-600 bg-sky-50 rounded-xl text-xs font-bold hover:bg-sky-100 transition-all">
              Contact Support
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

export default StudentDashboard;
