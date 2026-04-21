import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../../services/api';
import { 
  CheckCircle2, 
  XCircle, 
  ArrowLeft, 
  BarChart2, 
  Award, 
  Download, 
  Share2, 
  Info, 
  ChevronDown, 
  ChevronUp, 
  Target, 
  ArrowRight,
  TrendingUp,
  ShieldCheck,
  Zap
} from 'lucide-react';
import { clsx } from 'clsx';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';

import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

const StudentResults = () => {
  const { id: examId } = useParams();
  const [result, setResult] = useState<any>(null);
  const [expandedIndex, setExpandedIndex] = useState<number | null>(0);

  useEffect(() => {
    const fetchResult = async () => {
      try {
        const { data } = await api.get(`/student/results/${examId}`);
        setResult(data);
      } catch (error) {
        toast.error('Failed to retrieve performance metrics');
      }
    };
    fetchResult();
  }, [examId]);

  const handleExportPDF = () => {
    if (!result) return;

    const doc = new jsPDF();
    const totalPoints = result.questions.reduce((acc: number, q: any) => acc + q.points, 0);
    const percentage = Math.round((result.score / totalPoints) * 100);
    
    // Add Brand Header
    doc.setFillColor(13, 17, 23); // Dark background like the app
    doc.rect(0, 0, 210, 40, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(24);
    doc.setFont('helvetica', 'bold');
    doc.text('QuizPro Sentinel', 20, 25);
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text('Official Performance Report', 20, 32);
    
    // Student & Exam Info
    doc.setTextColor(100, 116, 139);
    doc.setFontSize(10);
    doc.text('ASSESSMENT DETAILS', 20, 55);
    
    doc.setTextColor(15, 23, 42);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text(result.questions[0]?.examTitle || 'Assessment Result', 20, 65);
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Submitted on: ${new Date(result.submittedAt).toLocaleString()}`, 20, 72);
    
    // Score Summary Card
    doc.setDrawColor(226, 232, 240);
    doc.roundedRect(20, 85, 170, 30, 5, 5);
    
    doc.setFontSize(9);
    doc.setTextColor(100, 116, 139);
    doc.text('CUMULATIVE SCORE', 30, 95);
    doc.text('ACCURACY RATE', 90, 95);
    doc.text('STATUS', 150, 95);
    
    doc.setFontSize(16);
    doc.setTextColor(15, 23, 42);
    doc.text(`${result.score} / ${totalPoints}`, 30, 105);
    doc.text(`${percentage}%`, 90, 105);
    
    const statusColor = percentage >= 50 ? { r: 16, g: 185, b: 129 } : { r: 244, g: 63, b: 94 };
    doc.setTextColor(statusColor.r, statusColor.g, statusColor.b);
    doc.text(percentage >= 50 ? 'PASSED' : 'FAILED', 150, 105);
    
    // Detailed Review Table
    doc.setTextColor(100, 116, 139);
    doc.setFontSize(10);
    doc.text('DETAILED QUESTION REVIEW', 20, 130);
    
    const tableData = result.questions.map((q: any, i: number) => [
      i + 1,
      q.content,
      Array.isArray(q.studentAnswer) ? q.studentAnswer.join(', ') : (q.studentAnswer || '[No Response]'),
      q.isCorrect ? 'Correct' : 'Incorrect',
      `${q.pointsEarned} / ${q.points}`
    ]);
    
    autoTable(doc, {
      startY: 135,
      head: [['#', 'Question', 'Your Answer', 'Result', 'Points']],
      body: tableData,
      headStyles: { fillColor: [15, 23, 42], textColor: [255, 255, 255], fontStyle: 'bold' },
      alternateRowStyles: { fillColor: [248, 250, 252] },
      columnStyles: {
        0: { cellWidth: 10 },
        1: { cellWidth: 80 },
        2: { cellWidth: 40 },
        3: { cellWidth: 20 },
        4: { cellWidth: 20 },
      },
    });
    
    // Footer
    const pageCount = doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(148, 163, 184);
      doc.text(`Page ${i} of ${pageCount} | QuizPro Sentinel - Verified Assessment Report`, 105, 285, { align: 'center' });
    }
    
    doc.save(`QuizPro_Result_${result.questions[0]?.examTitle || 'Report'}.pdf`);
  };

  if (!result) return (
    <div className="h-[80vh] flex flex-col items-center justify-center gap-6">
      <div className="relative">
        <div className="w-20 h-20 border-4 border-emerald-100 border-t-emerald-500 rounded-full animate-spin" />
        <div className="absolute inset-0 flex items-center justify-center">
          <TrendingUp size={24} className="text-emerald-500 animate-pulse" />
        </div>
      </div>
      <p className="text-sm font-bold text-slate-400 uppercase tracking-[0.2em]">Compiling Performance Analytics...</p>
    </div>
  );

  const totalPoints = result.questions.reduce((acc: number, q: any) => acc + q.points, 0);
  const percentage = (result.score / totalPoints) * 100;
  const isPassed = percentage >= 50;

  const handleShare = () => {
    const shareText = `🚀 I just completed the ${result.questions[0]?.examTitle || 'Assessment'} on QuizPro Sentinel!\n\n🏆 Score: ${result.score} / ${totalPoints}\n📈 Accuracy: ${Math.round(percentage)}%\n\nCheck your own skills at ${window.location.origin}`;
    navigator.clipboard.writeText(shareText);
    toast.success('Result summary copied to clipboard!');
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="max-w-6xl mx-auto pb-20 px-6"
    >
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-12 bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm">
        <div className="flex items-center gap-6">
          <Link to="/student" className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400 hover:text-sky-600 hover:bg-sky-50 transition-all border border-slate-100">
            <ArrowLeft size={24} />
          </Link>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <ShieldCheck size={16} className="text-sky-500" />
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Assessment Validated</span>
            </div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">Post-Exam Analytics</h1>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <button 
            onClick={handleExportPDF}
            className="px-6 py-3 bg-slate-50 text-slate-600 font-bold rounded-xl border border-slate-200 hover:bg-slate-100 transition-all flex items-center gap-2 text-sm"
          >
            <Download size={18} /> Export PDF
          </button>
          <button 
            onClick={handleShare}
            className="px-6 py-3 bg-sky-500 text-white font-bold rounded-xl shadow-lg shadow-sky-500/20 hover:bg-sky-600 transition-all flex items-center gap-2 text-sm"
          >
            <Share2 size={18} /> Share Results
          </button>
        </div>
      </header>

      {/* Hero Stats Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-12">
        <div className="lg:col-span-8">
          <div className="bg-white p-12 rounded-[3rem] border border-slate-100 shadow-xl shadow-slate-200/50 flex flex-col md:flex-row items-center justify-between gap-12 relative overflow-hidden">
            <div className="relative z-10 text-center md:text-left">
              <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.3em] mb-4">Cumulative Proficiency</p>
              <h2 className="text-8xl font-black text-slate-900 mb-8 tracking-tighter">
                {result.score}<span className="text-3xl text-slate-300 font-bold tracking-normal ml-2">/ {totalPoints}</span>
              </h2>
              <div className={clsx(
                "inline-flex items-center gap-3 px-8 py-4 rounded-2xl font-black uppercase tracking-tighter text-sm shadow-sm",
                isPassed ? "bg-emerald-500 text-white shadow-emerald-500/20" : "bg-rose-500 text-white shadow-rose-500/20"
              )}>
                {isPassed ? <CheckCircle2 size={20} strokeWidth={3} /> : <XCircle size={20} strokeWidth={3} />}
                {isPassed ? 'Certification Achieved' : 'Retry Recommended'}
              </div>
            </div>
            
            <div className="relative z-10">
               <div className="relative w-56 h-56">
                  <svg className="w-full h-full transform -rotate-90">
                    <circle cx="112" cy="112" r="100" stroke="currentColor" strokeWidth="20" fill="transparent" className="text-slate-50" />
                    <motion.circle 
                      initial={{ strokeDashoffset: 628 }}
                      animate={{ strokeDashoffset: 628 * (1 - percentage/100) }}
                      transition={{ duration: 2, ease: "circOut" }}
                      cx="112" cy="112" r="100" stroke="currentColor" strokeWidth="20" fill="transparent" 
                      strokeDasharray={628}
                      strokeLinecap="round"
                      className={isPassed ? "text-emerald-500" : "text-rose-500"} 
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-5xl font-black text-slate-900 leading-none">{Math.round(percentage)}%</span>
                    <span className="text-[10px] font-bold text-slate-400 uppercase mt-2 tracking-widest">Accuracy Rate</span>
                  </div>
               </div>
            </div>
            <Award className="absolute -right-12 -bottom-12 text-slate-50 opacity-40 rotate-12" size={300} />
          </div>
        </div>

        <div className="lg:col-span-4 flex flex-col gap-8">
           <Link to={`/student/leaderboard/${examId}`} className="group bg-slate-900 rounded-[3rem] p-8 text-white flex flex-col justify-between relative overflow-hidden hover:bg-slate-800 transition-all flex-1 shadow-2xl shadow-slate-900/20">
              <Zap className="absolute -right-8 -top-8 text-white/5 group-hover:scale-125 transition-transform duration-700" size={200} />
              <div className="relative z-10">
                <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center mb-6 border border-white/10 shadow-inner">
                   <BarChart2 size={28} className="text-sky-400" />
                </div>
                <h3 className="text-2xl font-bold mb-2">Global Ranking</h3>
                <p className="text-slate-400 text-sm font-medium leading-relaxed">See where you stand among thousands of contenders worldwide.</p>
              </div>
              <div className="relative z-10 mt-8 flex items-center justify-between font-bold text-xs bg-white/10 px-6 py-4 rounded-2xl border border-white/5 hover:bg-white/20 transition-all">
                <span>View Full Leaderboard</span>
                <ArrowRight size={18} />
              </div>
           </Link>
        </div>
      </div>

      {/* Review Section */}
      <div className="space-y-6">
        <div className="flex items-center justify-between mb-8">
           <h3 className="text-2xl font-black text-slate-900 flex items-center gap-3">
             <Target size={28} className="text-sky-500" /> Review Matrix
           </h3>
           <div className="flex gap-4">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-400">
                 <div className="w-3 h-3 bg-emerald-500 rounded-full" /> Correct
              </div>
              <div className="flex items-center gap-2 text-xs font-bold text-slate-400">
                 <div className="w-3 h-3 bg-rose-500 rounded-full" /> Incorrect
              </div>
           </div>
        </div>

        <div className="space-y-4">
           {result.questions.map((q: any, idx: number) => (
             <motion.div 
               key={idx}
               layout
               className={clsx(
                 "bg-white rounded-[2.5rem] border border-slate-200 overflow-hidden transition-all",
                 expandedIndex === idx ? "shadow-xl ring-2 ring-sky-500/10 border-sky-100" : "hover:border-slate-300"
               )}
             >
               <button 
                 onClick={() => setExpandedIndex(expandedIndex === idx ? null : idx)}
                 className="w-full p-8 flex items-center justify-between text-left"
               >
                 <div className="flex items-center gap-6">
                   <span className={clsx(
                     "w-12 h-12 rounded-2xl flex items-center justify-center font-black text-lg shadow-sm border",
                     q.isCorrect ? "bg-emerald-50 text-emerald-600 border-emerald-100" : "bg-rose-50 text-rose-600 border-rose-100"
                   )}>
                     {idx + 1}
                   </span>
                   <div>
                     <h4 className="font-bold text-slate-900 line-clamp-1">{q.content}</h4>
                     <div className="flex items-center gap-4 mt-1">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{q.type} Question</span>
                        <span className={clsx(
                          "text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md",
                          q.isCorrect ? "text-emerald-500 bg-emerald-50" : "text-rose-500 bg-rose-50"
                        )}>
                           {q.isCorrect ? 'Correct' : 'Incorrect'}
                        </span>
                     </div>
                   </div>
                 </div>
                 <div className="flex items-center gap-6">
                   <div className="text-right hidden md:block">
                     <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Weight</p>
                     <p className="text-sm font-black text-slate-900">{q.pointsEarned} / {q.points} PTS</p>
                   </div>
                   <div className="p-2 bg-slate-50 rounded-xl text-slate-400 group-hover:text-slate-600 transition-all">
                      {expandedIndex === idx ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                   </div>
                 </div>
               </button>

               <AnimatePresence>
                 {expandedIndex === idx && (
                   <motion.div
                     initial={{ height: 0, opacity: 0 }}
                     animate={{ height: 'auto', opacity: 1 }}
                     exit={{ height: 0, opacity: 0 }}
                     className="px-8 pb-8"
                   >
                     <div className="pt-8 border-t border-slate-100 space-y-8">
                        <div className="space-y-4">
                           <h5 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                             <Info size={14} className="text-sky-500" /> Rationale & Solutions
                           </h5>
                           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                              <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100">
                                 <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Your Response</p>
                                 <p className={clsx(
                                   "font-bold text-sm",
                                   q.isCorrect ? "text-emerald-700" : "text-rose-700"
                                 )}>
                                   {Array.isArray(q.studentAnswer) ? q.studentAnswer.join(' • ') : (q.studentAnswer || '[NO_RESPONSE]')}
                                 </p>
                              </div>
                              <div className="p-6 bg-slate-900 rounded-3xl text-white">
                                 <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3">Correct Solution</p>
                                 <p className="font-bold text-sm">
                                   {Array.isArray(q.correctAnswers) ? q.correctAnswers.join(' • ') : q.correctAnswers}
                                 </p>
                              </div>
                           </div>
                        </div>
                        
                        {/* Explanation placeholder */}
                        <div className="p-6 bg-sky-50 rounded-3xl border border-sky-100 text-sky-800 text-sm font-medium leading-relaxed">
                           <p className="font-bold mb-2 flex items-center gap-2"><Target size={16} /> Key Concept:</p>
                           The correct pattern ensures optimal performance and adheres to standardized industry best practices for {q.type === 'Coding' ? 'algorithm design' : 'logical reasoning'}. Reviewing this area will significantly improve your baseline score in future modules.
                        </div>
                     </div>
                   </motion.div>
                 )}
               </AnimatePresence>
             </motion.div>
           ))}
        </div>
      </div>
    </motion.div>
  );
};

export default StudentResults;
