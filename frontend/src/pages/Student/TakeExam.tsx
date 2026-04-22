import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { toast } from 'react-hot-toast';
import { 
  Clock, 
  Send, 
  ChevronLeft, 
  ChevronRight, 
  Loader2, 
  AlertCircle, 
  Shield, 
  CheckCircle2,
  Flag,
  Play,
  Terminal,
  Maximize2,
  Settings,
  HelpCircle,
  FileCode,
  Info,
  Target
} from 'lucide-react';
import { clsx } from 'clsx';
import { motion } from 'framer-motion';
import Editor from '@monaco-editor/react';
import { LanguageSelector, LANGUAGES, type Language } from '../../components/Student/LanguageSelector';

const TakeExam = () => {
  const { id: examId } = useParams();
  const navigate = useNavigate();
  
  // States
  const [exam, setExam] = useState<any>(null);
  const [attemptId, setAttemptId] = useState<string>('');
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [flagged, setFlagged] = useState<Set<string>>(new Set());
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'saved'>('saved');
  const [examStarted, setExamStarted] = useState(false);
  const [isRunningCode, setIsRunningCode] = useState(false);
  const [codeOutput, setCodeOutput] = useState<{success: boolean, output: string, executionTime?: string, error?: string} | null>(null);
  const [selectedLanguage, setSelectedLanguage] = useState<Language>('javascript');
  const [isInitializing, setIsInitializing] = useState(true);

  const timerRef = useRef<any>(null);

  // Initial Fetch (Exam Info & Session Recovery)
  useEffect(() => {
    const initializeExam = async () => {
      try {
        // Step 1: Get Basic Exam Info
        const resAvail = await api.get(`/student/exams/available`);
        const found = resAvail.data.find((e: any) => e.id === examId);
        if (!found) throw new Error('Exam not found');
        setExam(found);

        // Step 2: Check for existing session (Start endpoint acts as recovery)
        // We only do this if the exam is not already completed
        if (found.status !== 'Completed') {
          try {
            const { data: attemptData } = await api.post('/student/attempt/start', { examId });
            if (attemptData.attemptId) {
              setExam(attemptData.exam);
              setAttemptId(attemptData.attemptId);
              
              // Recover start time and timer
              const serverStartTime = new Date(attemptData.startTime).getTime();
              const durationMs = attemptData.exam.duration * 60 * 1000;
              const endTime = serverStartTime + durationMs;
              const now = new Date().getTime();
              
              if (now < endTime) {
                setExamStarted(true);
                startTimer(endTime);
              }
            }
          } catch (e) {
             // If start fails, just stay on instructions page
             console.log('No existing session to recover');
          }
        }
      } catch (error: any) {
        toast.error('Failed to load assessment environment');
        navigate('/student');
      } finally {
        setIsInitializing(false);
      }
    };
    initializeExam();
  }, [examId]);

  const startTimer = (endTime: number) => {
    if (timerRef.current) clearInterval(timerRef.current);
    
    const updateTimer = () => {
      const now = new Date().getTime();
      const remaining = Math.max(0, Math.floor((endTime - now) / 1000));
      setTimeLeft(remaining);

      if (remaining === 0) {
        if (timerRef.current) clearInterval(timerRef.current);
        autoSubmit();
      }
    };

    updateTimer();
    timerRef.current = setInterval(updateTimer, 1000);
  };

  // Start Exam Logic
  const handleStartExam = async () => {
    setIsSubmitting(true);
    try {
      const { data } = await api.post('/student/attempt/start', { examId });
      setExam(data.exam);
      setAttemptId(data.attemptId);
      setExamStarted(true);
      
      const serverStartTime = new Date(data.startTime).getTime();
      const durationMs = data.exam.duration * 60 * 1000;
      const endTime = serverStartTime + durationMs;
      
      startTimer(endTime);
      toast.success('Assessment started. Good luck!');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to start exam');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Robust Save logic
  const saveAnswerToDB = async (qId: string, content: any) => {
    if (!attemptId || content === undefined) return;
    
    setSyncStatus('syncing');
    try {
      await api.post('/student/attempt/save-answer', { attemptId, questionId: qId, content });
      setSyncStatus('saved');
    } catch (error) {
      setSyncStatus('idle');
      console.error('Failed to save answer:', qId);
    }
  };

  const updateAnswer = (qId: string, content: any) => {
    setAnswers(prev => ({ ...prev, [qId]: content }));
    saveAnswerToDB(qId, content);
  };

  const handleSubmit = async () => {
    if (isSubmitting) return;
    
    const unansweredCount = exam.questions.length - Object.keys(answers).length;
    const confirmMsg = unansweredCount > 0 
      ? `You have ${unansweredCount} unanswered questions. Are you sure you want to submit?`
      : 'Are you sure you want to submit your assessment?';

    if (!window.confirm(confirmMsg)) return;

    setIsSubmitting(true);
    const loadingToast = toast.loading('Finalizing your submission...');
    try {
      await api.post('/student/attempt/submit', { attemptId });
      toast.success('Exam submitted successfully!', { id: loadingToast });
      navigate(`/student/results/${examId}`);
    } catch (error) {
      toast.error('Submission failed. Please try again.', { id: loadingToast });
      setIsSubmitting(false);
    }
  };

  const autoSubmit = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    toast.error('Time is up! Submitting automatically...', { duration: 5000 });
    try {
      await api.post('/student/attempt/submit', { attemptId });
      navigate(`/student/results/${examId}`);
    } catch (error) {
      console.error('Auto-submit failed');
    }
  };

  const runCode = async () => {
    const currentQ = exam.questions[currentQIndex];
    const code = answers[currentQ.id];
    if (!code) return toast.error('Please write some code first');

    setIsRunningCode(true);
    setCodeOutput(null);
    try {
      const { data } = await api.post('/student/attempt/run-code', { 
        code, 
        language: selectedLanguage 
      });
      setCodeOutput(data);
    } catch (error) {
      toast.error('Failed to run code');
    } finally {
      setIsRunningCode(false);
    }
  };

  const handleLanguageChange = (lang: Language) => {
    setSelectedLanguage(lang);
    const currentQ = exam.questions[currentQIndex];
    
    // Load template if editor is empty or just has whitespace
    if (!answers[currentQ.id] || answers[currentQ.id].trim() === '') {
      const template = LANGUAGES.find(l => l.id === lang)?.template || '';
      updateAnswer(currentQ.id, template);
    }
  };

  const toggleFlag = (qId: string) => {
    const newFlagged = new Set(flagged);
    if (newFlagged.has(qId)) newFlagged.delete(qId);
    else newFlagged.add(qId);
    setFlagged(newFlagged);
  };

  if (isInitializing || !exam) return (
    <div className="h-screen flex flex-col items-center justify-center gap-6 bg-slate-50">
      <div className="relative">
        <div className="w-20 h-20 border-4 border-sky-100 border-t-sky-500 rounded-full animate-spin" />
        <div className="absolute inset-0 flex items-center justify-center">
          <Shield size={32} className="text-sky-500 animate-pulse" />
        </div>
      </div>
      <div className="text-center">
         <p className="text-sm font-bold text-slate-400 uppercase tracking-[0.2em]">Configuring Sentinel Environment</p>
         <p className="text-[10px] font-bold text-slate-300 uppercase tracking-widest mt-2">Initializing Secure Connection...</p>
      </div>
    </div>
  );

  // Instructions View
  if (!examStarted) {
    return (
      <div className="min-h-screen bg-slate-50 py-20 px-6">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-3xl mx-auto bg-white rounded-[2.5rem] border border-slate-200 shadow-xl overflow-hidden"
        >
          <div className="bg-slate-900 p-10 text-white">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-sky-500 rounded-xl flex items-center justify-center">
                <Shield size={24} />
              </div>
              <span className="text-xs font-bold text-sky-400 uppercase tracking-widest">Secure Examination Mode</span>
            </div>
            <h1 className="text-4xl font-black tracking-tight mb-2">{exam.title}</h1>
            <p className="text-slate-400 font-medium">Ready to demonstrate your skills?</p>
          </div>

          <div className="p-10 space-y-8">
            <div className="grid grid-cols-3 gap-6">
              {[
                { label: 'Duration', value: `${exam.duration}m`, icon: Clock },
                { label: 'Questions', value: '12 Questions', icon: HelpCircle },
                { label: 'Passing Score', value: `${exam.passingScore}%`, icon: Target },
              ].map(stat => (
                <div key={stat.label} className="p-4 bg-slate-50 rounded-2xl border border-slate-100 text-center">
                  <stat.icon size={20} className="mx-auto text-sky-500 mb-2" />
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{stat.label}</p>
                  <p className="text-lg font-black text-slate-900">{stat.value}</p>
                </div>
              ))}
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Info size={18} className="text-sky-500" /> Instructions & Guidelines
              </h3>
              <ul className="space-y-3 text-slate-600 font-medium list-disc list-inside px-4">
                <li>Once started, the timer cannot be paused.</li>
                <li>Your progress is auto-saved every 3 seconds.</li>
                <li>Closing the tab will not pause the timer.</li>
                <li>Do not refresh the page during the examination.</li>
                <li>Ensure a stable internet connection.</li>
              </ul>
            </div>

            <button 
              onClick={handleStartExam}
              disabled={isSubmitting}
              className="w-full py-5 bg-sky-500 text-white font-black rounded-2xl shadow-lg shadow-sky-500/20 hover:bg-sky-600 active:scale-[0.98] transition-all text-lg flex items-center justify-center gap-3 disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="animate-spin" size={24} /> Initializing...
                </>
              ) : (
                <>Begin Assessment <ChevronRight size={24} /></>
              )}
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  const currentQ = exam.questions[currentQIndex];
  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };


  return (
    <div className="h-screen flex flex-col bg-[#0d1117] text-white overflow-hidden">
      {/* Top Bar - LeetCode Style */}
      <nav className="h-14 bg-[#161b22] border-b border-[#30363d] flex items-center justify-between px-6 shrink-0">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/student')}>
            <div className="w-8 h-8 bg-sky-500 rounded-lg flex items-center justify-center text-white shadow-lg">
              <Shield size={18} />
            </div>
            <span className="font-bold tracking-tight hidden md:block">QuizPro <span className="text-sky-500">Sentinel</span></span>
          </div>
          <div className="h-6 w-[1px] bg-[#30363d] mx-2" />
          <div className="flex items-center gap-3">
             <button className="p-1.5 hover:bg-[#30363d] rounded-md transition-colors text-slate-400 hover:text-white">
                <ChevronLeft size={20} />
             </button>
             <span className="text-sm font-bold text-slate-300">Question {currentQIndex + 1} of {exam.questions.length}</span>
             <button className="p-1.5 hover:bg-[#30363d] rounded-md transition-colors text-slate-400 hover:text-white">
                <ChevronRight size={20} />
             </button>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <div className={clsx(
            "flex items-center gap-2 px-4 py-1.5 rounded-lg font-mono text-sm font-bold transition-all border",
            timeLeft !== null && timeLeft < 60 
              ? "bg-rose-500/10 border-rose-500/50 text-rose-500 animate-pulse" 
              : "bg-[#21262d] border-[#30363d] text-sky-400"
          )}>
            <Clock size={16} />
            {timeLeft !== null ? formatTime(timeLeft) : '--:--'}
          </div>
          
          <button 
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-1.5 px-6 rounded-lg text-sm transition-all active:scale-95 flex items-center gap-2 shadow-lg shadow-emerald-900/20"
          >
            {isSubmitting ? <Loader2 className="animate-spin" size={16} /> : <Send size={16} />}
            Submit
          </button>
        </div>
      </nav>

      {/* Main Content Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left: Question Content */}
        <div className="w-1/2 flex flex-col border-r border-[#30363d] bg-[#0d1117] overflow-y-auto custom-scrollbar">
           <div className="p-8 space-y-8">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="px-3 py-1 bg-sky-500/10 text-sky-400 rounded-md text-[10px] font-bold uppercase tracking-widest border border-sky-500/20">
                    {currentQ.type}
                  </span>
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Points: {currentQ.points}</span>
                </div>
                <button 
                  onClick={() => toggleFlag(currentQ.id)}
                  className={clsx(
                    "flex items-center gap-2 text-xs font-bold transition-colors",
                    flagged.has(currentQ.id) ? "text-amber-500" : "text-slate-500 hover:text-white"
                  )}
                >
                  <Flag size={14} fill={flagged.has(currentQ.id) ? "currentColor" : "none"} />
                  {flagged.has(currentQ.id) ? 'Flagged' : 'Flag for review'}
                </button>
              </div>

              <div className="prose prose-invert max-w-none">
                <h2 className="text-2xl font-bold text-white mb-6 leading-relaxed">
                  {currentQ.content}
                </h2>
                {/* Additional description/examples can go here if the schema supported it */}
              </div>

              <div className="space-y-4 pt-10">
                {currentQ.type === 'MCQ' ? (
                  <div className="grid gap-3">
                    {currentQ.options && currentQ.options.length > 0 ? (
                      currentQ.options.map((opt: string, idx: number) => (
                        <button
                          key={idx}
                          onClick={() => {
                            const currentAnswers = Array.isArray(answers[currentQ.id]) ? answers[currentQ.id] : [];
                            const newAnswers = currentAnswers.includes(opt)
                              ? currentAnswers.filter((a: string) => a !== opt)
                              : [...currentAnswers, opt];
                            updateAnswer(currentQ.id, newAnswers);
                          }}
                          className={clsx(
                            "w-full text-left p-5 rounded-xl border transition-all duration-200 flex items-center justify-between group",
                            (Array.isArray(answers[currentQ.id]) && answers[currentQ.id].includes(opt))
                              ? "bg-sky-500/10 border-sky-500 text-white shadow-[0_0_20px_rgba(14,165,233,0.1)]"
                              : "bg-[#161b22] border-[#30363d] text-slate-400 hover:border-slate-500 hover:text-white"
                          )}
                        >
                          <div className="flex items-center gap-4">
                             <span className={clsx(
                               "w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs border transition-colors",
                               (Array.isArray(answers[currentQ.id]) && answers[currentQ.id].includes(opt)) ? "bg-sky-500 border-sky-500 text-white" : "bg-[#21262d] border-[#30363d] text-slate-500"
                             )}>
                               {String.fromCharCode(65 + idx)}
                             </span>
                             <span className="font-semibold">{opt}</span>
                          </div>
                          {(Array.isArray(answers[currentQ.id]) && answers[currentQ.id].includes(opt)) && <CheckCircle2 size={18} className="text-sky-500" />}
                        </button>
                      ))
                    ) : (
                      <div className="p-10 border-2 border-dashed border-[#30363d] rounded-2xl text-center">
                        <AlertCircle className="mx-auto text-slate-600 mb-2" size={32} />
                        <p className="text-slate-500 text-sm italic">No options available for this question. Please contact your instructor.</p>
                      </div>
                    )}
                  </div>
                ) : currentQ.type === 'Short' ? (
                  <textarea
                    className="w-full h-40 p-6 bg-[#161b22] border border-[#30363d] rounded-xl focus:border-sky-500 focus:bg-[#0d1117] outline-none transition-all font-mono text-white placeholder:text-slate-600"
                    placeholder="Type your response here..."
                    value={answers[currentQ.id] || ''}
                    onChange={(e) => updateAnswer(currentQ.id, e.target.value)}
                  />
                ) : (
                  <div className="bg-sky-500/5 border border-sky-500/20 rounded-xl p-4 flex items-center gap-3 text-sky-400 text-sm italic">
                    <FileCode size={18} /> Use the code editor on the right to implement your solution.
                  </div>
                )}
              </div>
           </div>
        </div>

        {/* Right: Coding/Navigation Editor */}
        <div className="w-1/2 flex flex-col bg-[#0d1117]">
          {currentQ.type === 'Coding' ? (
            <div className="flex-1 flex flex-col overflow-hidden">
               {/* Editor Header */}
               <div className="h-10 bg-[#161b22] border-b border-[#30363d] flex items-center justify-between px-4 shrink-0">
                  <div className="flex items-center gap-4">
                     <LanguageSelector 
                       selected={selectedLanguage}
                       onSelect={handleLanguageChange}
                     />
                  </div>
                  <div className="flex items-center gap-3">
                     <button className="p-1 text-slate-400 hover:text-white"><Settings size={14} /></button>
                     <button className="p-1 text-slate-400 hover:text-white"><Maximize2 size={14} /></button>
                  </div>
               </div>
               
               {/* Monaco Editor */}
               <div className="flex-1 overflow-hidden">
                  <Editor
                    theme="vs-dark"
                    language={selectedLanguage}
                    value={answers[currentQ.id] || ''}
                    onChange={(val) => updateAnswer(currentQ.id, val)}
                    options={{
                      fontSize: 14,
                      minimap: { enabled: false },
                      scrollBeyondLastLine: false,
                      automaticLayout: true,
                      padding: { top: 20 }
                    }}
                  />
               </div>

               {/* Console/Output Area */}
               <div className="h-1/3 bg-[#161b22] border-t border-[#30363d] flex flex-col shrink-0">
                  <div className="h-10 border-b border-[#30363d] flex items-center justify-between px-4">
                     <div className="flex items-center gap-2">
                        <Terminal size={14} className="text-sky-500" />
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Console Output</span>
                     </div>
                     <button 
                        onClick={runCode}
                        disabled={isRunningCode}
                        className="bg-[#2ea043] hover:bg-[#3fb950] text-white text-[10px] font-bold px-4 py-1 rounded-md flex items-center gap-2 transition-all"
                     >
                        {isRunningCode ? <Loader2 className="animate-spin" size={12} /> : <Play size={12} fill="currentColor" />}
                        Run Code
                     </button>
                  </div>
                  <div className="flex-1 p-4 font-mono text-sm overflow-y-auto">
                     {isRunningCode ? (
                        <div className="flex items-center gap-2 text-slate-500">
                           <Loader2 className="animate-spin" size={14} />
                           <span>Compiling and executing...</span>
                        </div>
                     ) : codeOutput ? (
                        <div className="space-y-2">
                           <div className="flex items-center gap-4 text-[10px] font-bold">
                              <span className={codeOutput.success ? "text-emerald-500" : "text-rose-500"}>
                                 {codeOutput.success ? 'SUCCESS' : 'RUNTIME ERROR'}
                              </span>
                              <span className="text-slate-500">EXEC TIME: {codeOutput.executionTime}s</span>
                           </div>
                           <pre className={clsx(
                             "whitespace-pre-wrap",
                             codeOutput.success ? "text-slate-300" : "text-rose-400"
                           )}>
                              {codeOutput.success ? codeOutput.output : codeOutput.error}
                           </pre>
                        </div>
                     ) : (
                        <span className="text-slate-600 italic">Click "Run Code" to see the output here...</span>
                     )}
                  </div>
               </div>
            </div>
          ) : (
            <div className="flex-1 p-8 flex flex-col">
               <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] mb-6">Question Palette</h3>
               <div className="grid grid-cols-5 gap-3">
                  {exam.questions.map((q: any, idx: number) => (
                    <button
                      key={idx}
                      onClick={() => setCurrentQIndex(idx)}
                      className={clsx(
                        "aspect-square rounded-lg flex flex-col items-center justify-center text-xs font-black transition-all relative group",
                        currentQIndex === idx ? "bg-white text-slate-900 scale-105 shadow-xl" :
                        answers[q.id] ? "bg-sky-500/20 text-sky-400 border border-sky-500/30" : "bg-[#161b22] text-slate-500 border border-[#30363d] hover:border-slate-500"
                      )}
                    >
                      {idx + 1}
                      {flagged.has(q.id) && (
                        <div className="absolute -top-1 -right-1">
                          <Flag size={12} className="text-amber-500" fill="currentColor" />
                        </div>
                      )}
                    </button>
                  ))}
               </div>

               <div className="mt-auto space-y-6">
                  <div className="p-6 bg-[#161b22] rounded-2xl border border-[#30363d]">
                     <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-4">Legend</p>
                     <div className="grid grid-cols-2 gap-4">
                        <div className="flex items-center gap-2 text-xs font-medium text-slate-400">
                           <div className="w-3 h-3 bg-sky-500/20 border border-sky-500/30 rounded-sm" /> Answered
                        </div>
                        <div className="flex items-center gap-2 text-xs font-medium text-slate-400">
                           <div className="w-3 h-3 bg-[#161b22] border border-[#30363d] rounded-sm" /> Unanswered
                        </div>
                        <div className="flex items-center gap-2 text-xs font-medium text-slate-400">
                           <div className="w-3 h-3 bg-white rounded-sm" /> Current
                        </div>
                        <div className="flex items-center gap-2 text-xs font-medium text-slate-400 text-amber-500">
                           <Flag size={12} fill="currentColor" /> Flagged
                        </div>
                     </div>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-[#161b22] rounded-2xl border border-[#30363d]">
                     <div className="flex items-center gap-2">
                        <div className={clsx(
                          "w-2 h-2 rounded-full",
                          syncStatus === 'syncing' ? "bg-amber-500 animate-pulse" : "bg-emerald-500"
                        )} />
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                           {syncStatus === 'syncing' ? 'Syncing Response...' : 'Responses Secured'}
                        </span>
                     </div>
                     <span className="text-[10px] font-mono text-slate-600">{attemptId.slice(0, 8)}</span>
                  </div>
               </div>
            </div>
          )}
        </div>
      </div>

      {/* Navigation Footer */}
      <div className="h-16 bg-[#161b22] border-t border-[#30363d] flex items-center justify-between px-8 shrink-0">
          <button
            onClick={() => setCurrentQIndex(prev => Math.max(0, prev - 1))}
            disabled={currentQIndex === 0}
            className="flex items-center gap-2 text-sm font-bold text-slate-400 hover:text-white transition-colors disabled:opacity-30"
          >
            <ChevronLeft size={18} /> Previous
          </button>
          
          <div className="hidden md:flex items-center gap-2">
             {exam.questions.map((_: any, idx: number) => (
               <div 
                 key={idx}
                 className={clsx(
                   "h-1 rounded-full transition-all duration-300",
                   currentQIndex === idx ? "w-8 bg-sky-500" : "w-4 bg-[#30363d]"
                 )}
               />
             ))}
          </div>

          <button
            onClick={() => setCurrentQIndex(prev => Math.min(exam.questions.length - 1, prev + 1))}
            disabled={currentQIndex === exam.questions.length - 1}
            className="flex items-center gap-2 text-sm font-bold text-slate-400 hover:text-white transition-colors disabled:opacity-30"
          >
            Next <ChevronRight size={18} />
          </button>
      </div>
      
      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #0d1117;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #30363d;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #484f58;
        }
      `}</style>
    </div>
  );
};

export default TakeExam;
