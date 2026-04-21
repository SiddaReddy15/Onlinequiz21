import { useEffect, useState } from 'react';
import api from '../../services/api';
import { 
  Activity, 
  ChevronRight, 
  Loader2, 
  BookOpen, 
  Calendar,
  CheckCircle2,
  XCircle,
  TrendingUp,
  Search
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import { clsx } from 'clsx';

const ResultsList = () => {
  const [history, setHistory] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const { data } = await api.get('/student/history');
        setHistory(data);
      } catch (error) {
        toast.error('Failed to load attempt history');
      } finally {
        setIsLoading(false);
      }
    };
    fetchHistory();
  }, []);

  if (isLoading) return (
    <div className="h-[80vh] flex flex-col items-center justify-center gap-6">
      <Loader2 className="animate-spin text-sky-500" size={56} />
      <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Retrieving Your History...</p>
    </div>
  );

  return (
    <div className="max-w-5xl mx-auto space-y-10 pb-20">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
           <h1 className="text-4xl font-black text-slate-900 tracking-tight">Attempt History</h1>
           <p className="text-slate-500 font-medium mt-2 text-lg">A chronological record of your assessment performance and progress.</p>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
           <div className="text-right">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Exams</p>
              <p className="text-xl font-black text-slate-900">{history.length}</p>
           </div>
           <div className="w-10 h-10 bg-sky-50 rounded-xl flex items-center justify-center text-sky-500">
              <Activity size={20} />
           </div>
        </div>
      </header>

      <div className="space-y-4">
        {history.length > 0 ? history.map((attempt, i) => (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.05 }}
            key={attempt.id}
            onClick={() => navigate(`/student/results/${attempt.examId}`)}
            className="group bg-white p-6 md:p-8 rounded-[2.5rem] border border-slate-200 shadow-sm hover:shadow-xl hover:border-sky-500/50 transition-all cursor-pointer flex flex-col md:flex-row items-center justify-between gap-6"
          >
            <div className="flex items-center gap-8 flex-1">
              <div className={clsx(
                "w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg transition-transform group-hover:scale-110",
                attempt.score >= 50 ? "bg-emerald-500 text-white shadow-emerald-500/20" : "bg-rose-500 text-white shadow-rose-500/20"
              )}>
                {attempt.score >= 50 ? <CheckCircle2 size={32} /> : <XCircle size={32} />}
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-900 group-hover:text-sky-600 transition-colors">{attempt.examTitle}</h3>
                <div className="flex flex-wrap items-center gap-6 mt-2">
                   <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-widest">
                      <Calendar size={14} className="text-sky-500" /> 
                      {format(new Date(attempt.submittedAt), 'MMMM dd, yyyy')}
                   </div>
                   <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-widest">
                      <TrendingUp size={14} className="text-sky-500" /> 
                      Level: Advanced
                   </div>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-10">
               <div className="text-right">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Score</p>
                  <p className={clsx(
                    "text-3xl font-black tracking-tighter",
                    attempt.score >= 50 ? "text-emerald-600" : "text-rose-600"
                  )}>{attempt.score}%</p>
               </div>
               <div className="w-12 h-12 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-sky-50 group-hover:text-sky-600 transition-all">
                  <ChevronRight size={24} />
               </div>
            </div>
          </motion.div>
        )) : null}
      </div>

      {history.length === 0 && (
        <div className="py-32 bg-slate-50 border-2 border-dashed border-slate-200 rounded-[3rem] text-center">
           <BookOpen size={64} className="mx-auto text-slate-200 mb-6" />
           <h3 className="text-xl font-bold text-slate-400">Your legacy begins here.</h3>
           <p className="text-slate-400 mt-2">Complete your first assessment to see your history logged.</p>
           <button 
             onClick={() => navigate('/student')}
             className="mt-8 px-8 py-3 bg-white border border-slate-200 rounded-xl font-bold text-slate-600 hover:bg-slate-100 transition-all shadow-sm"
           >
             Browse Assessments
           </button>
        </div>
      )}
    </div>
  );
};

export default ResultsList;
