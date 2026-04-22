import { useEffect, useState } from 'react';
import api from '../../services/api';
import { 
  BookOpen, 
  Clock, 
  Star, 
  ChevronRight, 
  Loader2, 
  ShieldCheck,
  Calendar,
  AlertCircle
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

const AvailableExams = () => {
  const [exams, setExams] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchExams = async () => {
      try {
        const { data } = await api.get('/student/exams/available');
        // Only show assessments that haven't been completed yet
        setExams(data.filter((e: any) => !e.isAttempted));
      } catch (error) {
        toast.error('Failed to load available assessments');
      } finally {
        setIsLoading(false);
      }
    };
    fetchExams();
  }, []);

  if (isLoading) return (
    <div className="h-[80vh] flex flex-col items-center justify-center gap-6">
      <Loader2 className="animate-spin text-sky-500" size={56} />
      <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Scanning Available Missions...</p>
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto space-y-12 pb-20">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
           <div className="flex items-center gap-2 text-sky-500 mb-2">
              <BookOpen size={20} />
              <span className="text-xs font-black uppercase tracking-[0.2em]">Active Assessments</span>
           </div>
           <h1 className="text-5xl font-black text-slate-900 tracking-tight">Available Missions</h1>
           <p className="text-slate-500 font-medium mt-3 text-lg max-w-2xl">
             Select an assessment below to begin your evaluation. All progress is monitored and auto-saved in real-time.
           </p>
        </div>
        <div className="bg-white px-6 py-4 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
           <div className="text-right">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Active Now</p>
              <p className="text-2xl font-black text-slate-900">{exams.length}</p>
           </div>
           <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-600 shadow-inner">
              <ShieldCheck size={24} />
           </div>
        </div>
      </header>

      {exams.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {exams.map((exam, i) => (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              key={exam.id}
              className="group bg-white rounded-[2.5rem] border border-slate-200 shadow-sm hover:shadow-2xl hover:border-sky-500/50 transition-all overflow-hidden flex flex-col"
            >
              <div className="p-8 flex-1">
                <div className="flex items-center justify-between mb-6">
                  <div className="w-12 h-12 bg-slate-900 rounded-2xl flex items-center justify-center text-white group-hover:bg-sky-500 transition-colors shadow-lg">
                    <BookOpen size={24} />
                  </div>
                  <div className="px-3 py-1 bg-sky-50 text-sky-600 rounded-full text-[10px] font-black uppercase tracking-widest border border-sky-100">
                    Available
                  </div>
                </div>

                <h3 className="text-2xl font-black text-slate-900 mb-2 group-hover:text-sky-600 transition-colors">{exam.title}</h3>
                <p className="text-slate-500 text-sm font-medium line-clamp-2 mb-6 leading-relaxed">
                  {exam.description || 'Professional evaluation of your core competencies and technical skills.'}
                </p>

                <div className="grid grid-cols-2 gap-4 py-6 border-t border-slate-50">
                   <div className="flex items-center gap-2 text-slate-500">
                      <Clock size={14} className="text-sky-500" />
                      <span className="text-[11px] font-bold uppercase tracking-wider">{exam.duration} Minutes</span>
                   </div>
                   <div className="flex items-center gap-2 text-slate-500">
                      <Star size={14} className="text-amber-400" />
                      <span className="text-[11px] font-bold uppercase tracking-wider">Intermediate</span>
                   </div>
                   <div className="flex items-center gap-2 text-slate-500">
                      <Calendar size={14} className="text-sky-500" />
                      <span className="text-[11px] font-bold uppercase tracking-wider">Ends {format(new Date(exam.endTime), 'MMM dd')}</span>
                   </div>
                   <div className="flex items-center gap-2 text-slate-500">
                      <ShieldCheck size={14} className="text-emerald-500" />
                      <span className="text-[11px] font-bold uppercase tracking-wider">Secure Mode</span>
                   </div>
                </div>
              </div>

              <div className="p-2">
                <button 
                  onClick={() => navigate(`/student/exams/${exam.id}`)}
                  className="w-full py-4 bg-slate-50 text-slate-900 font-black rounded-[2rem] hover:bg-sky-500 hover:text-white transition-all flex items-center justify-center gap-2 group-hover:shadow-lg"
                >
                  Start Assessment <ChevronRight size={18} />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="py-32 bg-slate-50 border-2 border-dashed border-slate-200 rounded-[3rem] text-center">
           <AlertCircle size={64} className="mx-auto text-slate-200 mb-6" />
           <h3 className="text-2xl font-black text-slate-400">All missions completed.</h3>
           <p className="text-slate-400 mt-2 font-medium">Check back later for newly assigned evaluations.</p>
           <button 
             onClick={() => navigate('/student')}
             className="mt-8 px-10 py-4 bg-white border border-slate-200 rounded-2xl font-black text-slate-600 hover:bg-slate-100 transition-all shadow-sm uppercase tracking-widest text-xs"
           >
             Return to Dashboard
           </button>
        </div>
      )}
    </div>
  );
};

export default AvailableExams;
