import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../../services/api';
import { 
  Trophy, 
  ArrowLeft, 
  Timer, 
  User, 
  Search,
  Award
} from 'lucide-react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

const Leaderboard = () => {
  const { id: examId } = useParams();
  const [entries, setEntries] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const { data } = await api.get(`/student/leaderboard/${examId}`);
        setEntries(data);
      } catch (error) {
        toast.error('Failed to sync leaderboard data');
      } finally {
        setIsLoading(false);
      }
    };
    fetchLeaderboard();
  }, [examId]);

  const formatDuration = (start: string, end: string) => {
    const duration = new Date(end).getTime() - new Date(start).getTime();
    const minutes = Math.floor(duration / 60000);
    const seconds = Math.floor((duration % 60000) / 1000);
    return `${minutes}m ${seconds}s`;
  };

  if (isLoading) return (
    <div className="h-[80vh] flex flex-col items-center justify-center gap-6">
      <div className="w-16 h-16 border-4 border-amber-100 border-t-amber-500 rounded-full animate-spin" />
      <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Ranking Contenders...</p>
    </div>
  );

  const topThree = entries.slice(0, 3);
  const remaining = entries.slice(3);

  return (
    <div className="max-w-6xl mx-auto pb-20 px-6">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
        <div className="flex items-center gap-6">
          <Link to="/student" className="w-12 h-12 bg-white rounded-2xl shadow-sm border border-slate-200 flex items-center justify-center text-slate-400 hover:text-sky-600 transition-all">
            <ArrowLeft size={24} />
          </Link>
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">Arena Standings</h1>
            <p className="text-slate-500 font-medium">Real-time performance distribution of the cohort.</p>
          </div>
        </div>
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="Search candidate..." 
            className="pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-2xl outline-none w-64 focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all shadow-sm"
          />
        </div>
      </header>

      {/* Podium Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16 items-end">
        {/* Second Place */}
        {topThree[1] && (
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="order-2 md:order-1"
          >
            <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-xl flex flex-col items-center text-center relative overflow-hidden h-72 justify-end">
               <div className="absolute top-0 left-0 w-full h-24 bg-slate-100" />
               <div className="relative z-10 -mt-12 mb-4">
                  <div className="w-20 h-20 rounded-2xl bg-white border-4 border-slate-200 shadow-xl flex items-center justify-center overflow-hidden">
                     <User size={40} className="text-slate-300" />
                  </div>
                  <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-slate-400 text-white rounded-full flex items-center justify-center font-black border-4 border-white">2</div>
               </div>
               <h3 className="text-xl font-bold text-slate-900 mb-1">{topThree[1].studentName}</h3>
               <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Silver Medalist</p>
               <div className="bg-slate-50 px-6 py-2 rounded-full font-black text-slate-900 text-lg border border-slate-100">
                 {topThree[1].score} PTS
               </div>
            </div>
          </motion.div>
        )}

        {/* First Place */}
        {topThree[0] && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: 'spring', damping: 15 }}
            className="order-1 md:order-2"
          >
            <div className="bg-slate-900 p-10 rounded-[3rem] shadow-2xl shadow-amber-500/10 flex flex-col items-center text-center relative overflow-hidden h-96 justify-end border-4 border-amber-400/30">
               <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-amber-400/20 to-transparent" />
               <Trophy size={100} className="absolute top-10 text-amber-400 opacity-20" />
               <div className="relative z-10 -mt-16 mb-6">
                  <div className="w-28 h-28 rounded-3xl bg-white border-8 border-amber-400 shadow-2xl flex items-center justify-center overflow-hidden">
                     <User size={56} className="text-slate-300" />
                  </div>
                  <div className="absolute -bottom-3 -right-3 w-12 h-12 bg-amber-400 text-white rounded-full flex items-center justify-center font-black border-4 border-slate-900 text-xl shadow-lg">1</div>
               </div>
               <h3 className="text-2xl font-black text-white mb-1">{topThree[0].studentName}</h3>
               <p className="text-[10px] font-black text-amber-400 uppercase tracking-[0.3em] mb-6">Supreme Contender</p>
               <div className="bg-amber-400 px-10 py-3 rounded-2xl font-black text-slate-900 text-2xl shadow-lg shadow-amber-400/20">
                 {topThree[0].score} PTS
               </div>
            </div>
          </motion.div>
        )}

        {/* Third Place */}
        {topThree[2] && (
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="order-3"
          >
            <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-xl flex flex-col items-center text-center relative overflow-hidden h-64 justify-end">
               <div className="absolute top-0 left-0 w-full h-20 bg-orange-50" />
               <div className="relative z-10 -mt-10 mb-4">
                  <div className="w-20 h-20 rounded-2xl bg-white border-4 border-orange-200 shadow-xl flex items-center justify-center overflow-hidden">
                     <User size={40} className="text-slate-300" />
                  </div>
                  <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-orange-400 text-white rounded-full flex items-center justify-center font-black border-4 border-white">3</div>
               </div>
               <h3 className="text-xl font-bold text-slate-900 mb-1">{topThree[2].studentName}</h3>
               <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Bronze Medalist</p>
               <div className="bg-orange-50 px-6 py-2 rounded-full font-black text-slate-900 text-lg border border-orange-100">
                 {topThree[2].score} PTS
               </div>
            </div>
          </motion.div>
        )}
      </div>

      {/* List Section */}
      <div className="bg-white rounded-[3rem] border border-slate-100 shadow-xl overflow-hidden">
         <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
            <h3 className="text-lg font-black text-slate-900 uppercase tracking-tighter">Cohort Standings</h3>
            <div className="flex gap-8">
               <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Candidate Info</span>
               <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Efficiency</span>
               <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Final Score</span>
            </div>
         </div>

         <div className="divide-y divide-slate-50">
           {remaining.length > 0 ? remaining.map((entry: any, idx: number) => (
             <motion.div 
               key={idx}
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               className="p-6 md:p-8 flex items-center justify-between hover:bg-slate-50 transition-colors group"
             >
               <div className="flex items-center gap-6">
                 <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center font-black text-slate-400 group-hover:bg-sky-500 group-hover:text-white transition-all">
                   {idx + 4}
                 </div>
                 <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center text-slate-300 group-hover:text-sky-500 transition-colors">
                       <User size={24} />
                    </div>
                    <div>
                       <h4 className="font-bold text-slate-900 group-hover:text-sky-600 transition-colors">{entry.studentName}</h4>
                       <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Verified Candidate</p>
                    </div>
                 </div>
               </div>

               <div className="flex items-center gap-12 md:gap-24">
                  <div className="flex flex-col items-end">
                     <div className="flex items-center gap-2 text-slate-600 font-bold text-sm">
                        <Timer size={14} className="text-sky-500" />
                        {formatDuration(entry.startTime, entry.endTime)}
                     </div>
                     <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest mt-1">Total Effort</span>
                  </div>
                  <div className="text-right w-24">
                     <p className="text-2xl font-black text-slate-900 tracking-tighter">{entry.score}</p>
                     <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Aggregated</p>
                  </div>
               </div>
             </motion.div>
           )) : (
             entries.length <= 3 && remaining.length === 0 && (
               <div className="p-20 text-center flex flex-col items-center">
                  <Award size={48} className="text-slate-100 mb-4" />
                  <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Awaiting further submissions...</p>
               </div>
             )
           )}
         </div>
      </div>
    </div>
  );
};

export default Leaderboard;
