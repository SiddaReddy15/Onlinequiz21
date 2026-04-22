import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { BookOpen, Clock, Calendar, ArrowRight, Star, ShieldCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface Exam {
  id: string;
  title: string;
  duration: number;
  startTime: string;
  category: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
}

interface UpcomingExamsProps {
  exams: Exam[];
}

export const UpcomingExams = ({ exams }: UpcomingExamsProps) => {
  const navigate = useNavigate();

  if (exams.length === 0) return (
    <div className="bg-white p-16 rounded-[2.5rem] border-2 border-dashed border-slate-200 text-center flex flex-col items-center justify-center space-y-4">
      <div className="text-4xl">🚀</div>
      <div>
        <h4 className="text-slate-900 font-bold text-xl">No exams available right now</h4>
        <p className="text-slate-500 text-sm mt-1 max-w-xs mx-auto">Don't worry, you're all caught up! Check back soon for new assessments.</p>
      </div>
      <button 
        onClick={() => navigate('/student')}
        className="mt-4 bg-sky-500 hover:bg-sky-600 text-white px-8 py-3 rounded-2xl font-bold transition-all shadow-lg shadow-sky-500/20 active:scale-95"
      >
        Explore Other Exams
      </button>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-black text-slate-900 tracking-tight">Available Assessments</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {exams.map((exam, i) => (
          <motion.div
            key={exam.id}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.1 }}
            whileHover={{ y: -5 }}
            className="group relative bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm hover:shadow-2xl hover:shadow-sky-500/10 transition-all overflow-hidden"
          >
            {/* Status Tag */}
            <div className="absolute top-6 right-6 flex items-center gap-1.5 px-3 py-1 bg-sky-50 text-sky-600 rounded-full text-[10px] font-black uppercase tracking-widest border border-sky-100">
              <span className="w-1.5 h-1.5 rounded-full bg-sky-500 animate-pulse" />
              Available
            </div>

            <div className="flex flex-col h-full">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-14 h-14 bg-slate-900 text-white rounded-2xl flex items-center justify-center shadow-xl group-hover:scale-110 transition-transform">
                  <BookOpen size={24} />
                </div>
                <div>
                  <h3 className="text-xl font-black text-slate-900 leading-tight group-hover:text-sky-600 transition-colors">
                    {exam.title}
                  </h3>
                  <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mt-1">{exam.category}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-8">
                <div className="flex items-center gap-2.5 text-slate-500">
                  <div className="p-1.5 bg-slate-50 rounded-lg">
                    <Clock size={14} className="text-slate-400" />
                  </div>
                  <span className="text-xs font-bold">{exam.duration} Minutes</span>
                </div>
                <div className="flex items-center gap-2.5 text-slate-500">
                  <div className="p-1.5 bg-slate-50 rounded-lg">
                    <Star size={14} className="text-amber-400" />
                  </div>
                  <span className="text-xs font-bold">{exam.difficulty}</span>
                </div>
                <div className="flex items-center gap-2.5 text-slate-500">
                  <div className="p-1.5 bg-slate-50 rounded-lg">
                    <Calendar size={14} className="text-slate-400" />
                  </div>
                  <span className="text-xs font-bold">{format(new Date(exam.startTime), 'MMM dd, HH:mm')}</span>
                </div>
                <div className="flex items-center gap-2.5 text-slate-500">
                  <div className="p-1.5 bg-slate-50 rounded-lg">
                    <ShieldCheck size={14} className="text-emerald-500" />
                  </div>
                  <span className="text-xs font-bold">Verified</span>
                </div>
              </div>

              <button
                onClick={() => navigate(`/student/exams/${exam.id}`)}
                className="mt-auto w-full py-4 bg-sky-500 hover:bg-sky-600 text-white rounded-2xl font-black text-sm tracking-wide transition-all flex items-center justify-center gap-2 shadow-lg shadow-sky-500/20 group-hover:shadow-sky-500/40"
              >
                Launch Assessment
                <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </button>
            </div>

            {/* Background Accent */}
            <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-slate-50 rounded-full group-hover:scale-150 transition-transform duration-500 opacity-50" />
          </motion.div>
        ))}
      </div>
    </div>
  );
};
