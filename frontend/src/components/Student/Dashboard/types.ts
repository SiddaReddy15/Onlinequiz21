export interface DashboardStats {
  totalAttempts: number;
  avgScore: number;
  totalTimeSpent: number; // in minutes
  currentRank: number | string;
  percentile: number;
  streakDays: number;
}

export interface PerformanceData {
  date: string;
  score: number;
  avgScore?: number;
}

export interface TopicSkill {
  name: string;
  score: number;
  totalQuestions: number;
  correctAnswers: number;
}

export interface Exam {
  id: string;
  title: string;
  duration: number;
  startTime: string;
  category: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
}

export interface Activity {
  id: string;
  type: 'exam' | 'badge' | 'milestone';
  title: string;
  timestamp: string;
  score?: number;
  icon?: string;
}

export interface Badge {
  id: string;
  title: string;
  icon: string;
  color: string;
  earnedAt?: string;
  isLocked: boolean;
  description: string;
}

export interface DashboardData {
  stats: DashboardStats;
  performanceHistory: PerformanceData[];
  topicAnalysis: TopicSkill[];
  upcomingExams: Exam[];
  recentActivity: Activity[];
  badges: Badge[];
}
