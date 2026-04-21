import { useEffect, useState } from 'react';
import api from '../../services/api';
import { 
  Trophy, 
  ChevronRight, 
  Loader2, 
  Target
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

const LeaderboardList = () => {
  const [exams, setExams] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchExams = async () => {
      try {
        const { data } = await api.get('/student/exams/available');
        setExams(data);
      } catch (error) {
        toast.error('Failed to load leaderboards');
      } finally {
        setIsLoading(false);
      }
    };
    fetchExams();
  }, []);

  if (isLoading) return (
    <div className="h-[80vh] flex flex-col items-center justify-center gap-6">
      <Loader2 className="animate-spin text-sky-500" size={56} />
      <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Loading Leaderboards...</p>
    </div>
  );

  return (
    <div className="max-w-5xl mx-auto space-y-10 pb-20">
      <header>
        <h1 className="text-4xl font-black text-slate-900 tracking-tight">Arena Rankings</h1>
        <p className="text-slate-500 font-medium mt-2 text-lg">Select an assessment to view the global leaderboard and contender standings.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {exams.map((exam, i) => (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            key={exam.id}
            onClick={() => navigate(`/student/leaderboard/${exam.id}`)}
            className="group bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm hover:shadow-xl hover:border-sky-500/50 transition-all cursor-pointer flex items-center justify-between"
          >
            <div className="flex items-center gap-6">
              <div className="w-16 h-16 bg-slate-900 rounded-2xl flex items-center justify-center text-white group-hover:bg-sky-500 transition-colors shadow-lg">
                <Trophy size={28} />
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-900 group-hover:text-sky-600 transition-colors">{exam.title}</h3>
                <div className="flex items-center gap-4 mt-1">
                   <div className="flex items-center gap-1 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                      <Target size={12} className="text-sky-500" /> {exam.passingScore}% Pass Mark
                   </div>
                </div>
              </div>
            </div>
            <div className="w-12 h-12 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-sky-50 group-hover:text-sky-600 transition-all">
               <ChevronRight size={24} />
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default LeaderboardList;
