import { useEffect, useState, useCallback } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import api from '../../services/api';
import { toast } from 'react-hot-toast';
import { 
  Save, 
  Plus, 
  Trash2, 
  ArrowLeft, 
  CheckCircle, 
  Loader2, 
  Clock, 
  Target, 
  AlertCircle,
  FileText,
  Code2,
  ListFilter,
  Eye,
  ChevronDown,
  ChevronUp,
  Settings,
  Database,
  ShieldCheck,
  Zap,
  MoreVertical,
  GripVertical
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { clsx } from 'clsx';
import Editor from '@monaco-editor/react';

const EditExam = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  // State
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSynced, setLastSynced] = useState<Date | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  
  const [examData, setExamData] = useState({
    title: '',
    description: '',
    duration: '',
    passingScore: '50',
    status: 'draft' as 'draft' | 'published'
  });

  const [questions, setQuestions] = useState<any[]>([]);

  // Fetch Data
  useEffect(() => {
    const fetchExam = async () => {
      try {
        const { data } = await api.get(`/admin/exams/${id}`);
        setExamData({
          title: data.title,
          description: data.description || '',
          duration: data.duration.toString(),
          passingScore: data.passingScore.toString(),
          status: data.status || 'draft'
        });
        setQuestions(data.questions.map((q: any) => ({
          ...q,
          tempId: q.id || Math.random().toString(36).substr(2, 9)
        })));
        setLastSynced(new Date());
      } catch (error) {
        toast.error('Failed to load exam data');
        navigate('/admin/exams');
      } finally {
        setIsLoading(false);
      }
    };
    fetchExam();
  }, [id, navigate]);

  // Handlers
  const addQuestion = (type: 'MCQ' | 'Short' | 'Coding') => {
    const newQ = {
      tempId: Math.random().toString(36).substr(2, 9),
      type,
      content: '',
      options: type === 'MCQ' ? ['', '', '', ''] : null,
      correctAnswers: [],
      points: '10',
      category: 'General'
    };
    setQuestions([...questions, newQ]);
    setExpandedId(newQ.tempId);
  };

  const removeQuestion = (tempId: string) => {
    setQuestions(questions.filter(q => q.tempId !== tempId));
  };

  const updateQuestion = (tempId: string, updates: any) => {
    setQuestions(questions.map(q => q.tempId === tempId ? { ...q, ...updates } : q));
  };

  const handleSave = async () => {
    setIsSaving(true);
    const loadingToast = toast.loading('Saving changes...');
    try {
      await api.put(`/admin/exams/${id}`, examData);
      await api.put('/admin/questions', { 
        examId: id, 
        questions: questions.map(({ tempId, ...q }) => q) 
      });
      setLastSynced(new Date());
      toast.success('Exam updated successfully', { id: loadingToast });
    } catch (error) {
      toast.error('Failed to save changes', { id: loadingToast });
    } finally {
      setIsSaving(false);
    }
  };

  // Validation
  const validationErrors = [];
  if (!examData.title) validationErrors.push('Exam title is required');
  if (!examData.duration) validationErrors.push('Duration is not set');
  if (questions.length === 0) validationErrors.push('Add at least one question');
  questions.forEach((q, i) => {
    if (!q.content) validationErrors.push(`Question ${i + 1} has no content`);
    if (q.type === 'MCQ' && q.correctAnswers.length === 0) validationErrors.push(`Question ${i + 1} has no correct answer selected`);
  });

  const totalPoints = questions.reduce((acc, q) => acc + parseInt(q.points || 0), 0);
  const difficulty = totalPoints / (questions.length || 1) > 15 ? 'Hard' : (totalPoints / (questions.length || 1) > 8 ? 'Medium' : 'Easy');

  if (isLoading) return (
    <div className="h-[60vh] flex flex-col items-center justify-center gap-6">
      <div className="w-16 h-16 border-4 border-sky-100 border-t-sky-500 rounded-full animate-spin" />
      <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Loading Editor...</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#f8fafc] font-['Inter']">
      {/* Sticky Top Header */}
      <div className="sticky top-0 z-[100] bg-white/80 backdrop-blur-xl border-b border-slate-200 px-8 py-4">
        <div className="max-w-[1600px] mx-auto flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link to="/admin/exams" className="p-2 hover:bg-slate-100 rounded-xl transition-colors">
              <ArrowLeft size={20} className="text-slate-500" />
            </Link>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-xl font-bold text-slate-900 tracking-tight">Edit Exam</h1>
                <span className={clsx(
                  "px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest",
                  examData.status === 'published' ? "bg-emerald-100 text-emerald-600" : "bg-amber-100 text-amber-600"
                )}>
                  {examData.status}
                </span>
              </div>
              <p className="text-xs font-medium text-slate-400 mt-0.5">ID: {id}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <button 
              onClick={() => navigate(`/student/exams/${id}`)}
              className="px-4 py-2 text-slate-600 font-bold text-sm hover:bg-slate-100 rounded-xl transition-all flex items-center gap-2"
            >
              <Eye size={18} /> Preview
            </button>
            <button 
              onClick={handleSave}
              disabled={isSaving}
              className="px-6 py-2.5 bg-sky-500 text-white font-bold rounded-xl shadow-lg shadow-sky-500/20 hover:bg-sky-600 transition-all flex items-center gap-2 disabled:opacity-50"
            >
              {isSaving ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
              Save Changes
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-[1600px] mx-auto p-8 lg:p-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          
          {/* LEFT SIDE: Main Editor */}
          <div className="lg:col-span-8 space-y-10">
            
            {/* Exam Details Card */}
            <div className="bg-white rounded-[2.5rem] p-10 border border-slate-200 shadow-sm space-y-10">
              <div className="flex items-center gap-4 pb-6 border-b border-slate-100">
                <div className="w-12 h-12 bg-sky-50 text-sky-500 rounded-2xl flex items-center justify-center">
                  <FileText size={24} />
                </div>
                <div>
                  <h2 className="text-xl font-black text-slate-900">General Parameters</h2>
                  <p className="text-sm text-slate-400 font-medium">Define the core metadata for this assessment</p>
                </div>
              </div>

              <div className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="md:col-span-2 space-y-2">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Exam Title</label>
                    <input 
                      className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:border-sky-500 focus:bg-white focus:ring-4 focus:ring-sky-500/5 transition-all font-semibold text-slate-900" 
                      placeholder="e.g. Senior Frontend Architecture Evaluation"
                      value={examData.title}
                      onChange={e => setExamData({...examData, title: e.target.value})}
                    />
                  </div>
                  
                  <div className="md:col-span-2 space-y-2">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Description & Objectives</label>
                    <textarea 
                      className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:border-sky-500 focus:bg-white focus:ring-4 focus:ring-sky-500/5 transition-all font-medium text-slate-600 min-h-[120px] resize-none" 
                      placeholder="Provide candidates with context and rules..."
                      value={examData.description}
                      onChange={e => setExamData({...examData, description: e.target.value})}
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Duration (Minutes)</label>
                    <div className="relative">
                      <Clock className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                      <input 
                        type="number"
                        className="w-full pl-14 pr-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:border-sky-500 focus:bg-white focus:ring-4 focus:ring-sky-500/5 transition-all font-bold text-slate-900" 
                        placeholder="60"
                        value={examData.duration}
                        onChange={e => setExamData({...examData, duration: e.target.value})}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Passing Threshold (%)</label>
                    <div className="relative">
                      <Target className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                      <input 
                        type="number"
                        className="w-full pl-14 pr-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:border-sky-500 focus:bg-white focus:ring-4 focus:ring-sky-500/5 transition-all font-bold text-slate-900" 
                        placeholder="50"
                        value={examData.passingScore}
                        onChange={e => setExamData({...examData, passingScore: e.target.value})}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Question Builder Section */}
            <div className="space-y-6">
              <div className="flex items-center justify-between px-6">
                <h2 className="text-2xl font-black text-slate-900">Intelligence Bank <span className="text-sky-500 ml-2">({questions.length})</span></h2>
                <div className="flex items-center gap-2">
                  <button onClick={() => addQuestion('MCQ')} className="p-2.5 bg-white border border-slate-200 rounded-xl hover:border-sky-500 hover:text-sky-500 transition-all shadow-sm flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-slate-600">
                    <ListFilter size={16} /> + MCQ
                  </button>
                  <button onClick={() => addQuestion('Short')} className="p-2.5 bg-white border border-slate-200 rounded-xl hover:border-sky-500 hover:text-sky-500 transition-all shadow-sm flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-slate-600">
                    <FileText size={16} /> + Short
                  </button>
                  <button onClick={() => addQuestion('Coding')} className="p-2.5 bg-white border border-slate-200 rounded-xl hover:border-sky-500 hover:text-sky-500 transition-all shadow-sm flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-slate-600">
                    <Code2 size={16} /> + Coding
                  </button>
                </div>
              </div>

              <div className="space-y-6">
                <AnimatePresence>
                  {questions.map((q, idx) => (
                    <motion.div
                      layout
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      key={q.tempId}
                      className={clsx(
                        "bg-white rounded-[2rem] border transition-all duration-300 overflow-hidden shadow-sm hover:shadow-md",
                        expandedId === q.tempId ? "border-sky-200 ring-4 ring-sky-500/5" : "border-slate-100"
                      )}
                    >
                      {/* Question Header */}
                      <div 
                        className="px-8 py-6 flex items-center justify-between cursor-pointer group"
                        onClick={() => setExpandedId(expandedId === q.tempId ? null : q.tempId)}
                      >
                        <div className="flex items-center gap-6">
                          <div className="w-10 h-10 bg-slate-900 text-white rounded-xl flex items-center justify-center font-black text-sm">
                            {idx + 1}
                          </div>
                          <div>
                            <h3 className="font-bold text-slate-900 group-hover:text-sky-600 transition-colors line-clamp-1 max-w-md">
                              {q.content || <span className="text-slate-300 italic font-medium">Empty question content...</span>}
                            </h3>
                            <div className="flex items-center gap-3 mt-1">
                              <span className="px-2 py-0.5 bg-slate-100 text-slate-500 rounded-md text-[9px] font-black uppercase tracking-widest">
                                {q.type}
                              </span>
                              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                                {q.points} Points
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <button 
                            onClick={(e) => { e.stopPropagation(); removeQuestion(q.tempId); }}
                            className="p-2 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                          >
                            <Trash2 size={18} />
                          </button>
                          {expandedId === q.tempId ? <ChevronUp className="text-slate-400" /> : <ChevronDown className="text-slate-400" />}
                        </div>
                      </div>

                      {/* Question Editor (Expanded) */}
                      <AnimatePresence>
                        {expandedId === q.tempId && (
                          <motion.div
                            initial={{ height: 0 }}
                            animate={{ height: 'auto' }}
                            exit={{ height: 0 }}
                            className="overflow-hidden border-t border-slate-50 bg-slate-50/30"
                          >
                            <div className="p-10 space-y-8">
                              <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                                <div className="lg:col-span-3 space-y-2">
                                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Question Content</label>
                                  <textarea 
                                    className="w-full px-6 py-4 bg-white border border-slate-100 rounded-2xl outline-none focus:border-sky-500 focus:ring-4 focus:ring-sky-500/5 transition-all font-semibold text-slate-900 min-h-[100px] resize-none"
                                    value={q.content}
                                    onChange={e => updateQuestion(q.tempId, { content: e.target.value })}
                                    placeholder="e.g. Which of the following is a React Hook?"
                                  />
                                </div>
                                <div className="space-y-2">
                                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Points</label>
                                  <input 
                                    type="number"
                                    className="w-full px-6 py-4 bg-white border border-slate-100 rounded-2xl outline-none focus:border-sky-500 focus:ring-4 focus:ring-sky-500/5 transition-all font-bold text-slate-900"
                                    value={q.points}
                                    onChange={e => updateQuestion(q.tempId, { points: e.target.value })}
                                  />
                                  <div className="pt-2">
                                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Category</label>
                                    <input 
                                      className="w-full px-4 py-2 bg-white border border-slate-100 rounded-xl outline-none focus:border-sky-500 transition-all font-medium text-xs mt-1"
                                      value={q.category}
                                      onChange={e => updateQuestion(q.tempId, { category: e.target.value })}
                                      placeholder="e.g. React"
                                    />
                                  </div>
                                </div>
                              </div>

                              {/* MCQ Options */}
                              {q.type === 'MCQ' && (
                                <div className="space-y-4">
                                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Answer Options & Correct Key</label>
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {q.options.map((opt: string, optIdx: number) => (
                                      <div key={optIdx} className="flex items-center gap-3 group/opt">
                                        <div className="relative">
                                          <input 
                                            type="radio" 
                                            name={`correct-${q.tempId}`}
                                            checked={q.correctAnswers.includes(opt) && opt !== ''}
                                            onChange={() => updateQuestion(q.tempId, { correctAnswers: [opt] })}
                                            className="w-6 h-6 rounded-full border-slate-300 text-sky-500 focus:ring-sky-500 cursor-pointer"
                                          />
                                        </div>
                                        <input 
                                          className="flex-1 px-5 py-3.5 bg-white border border-slate-100 rounded-xl outline-none focus:border-sky-500 transition-all font-medium text-sm"
                                          value={opt}
                                          onChange={e => {
                                            const newOpts = [...q.options];
                                            newOpts[optIdx] = e.target.value;
                                            updateQuestion(q.tempId, { options: newOpts });
                                          }}
                                          placeholder={`Option ${optIdx + 1}`}
                                        />
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}

                              {/* Coding Editor */}
                              {q.type === 'Coding' && (
                                <div className="space-y-4">
                                  <div className="flex items-center justify-between">
                                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Initial Code / Solution Template</label>
                                    <select className="bg-white border border-slate-200 rounded-lg px-3 py-1 text-[10px] font-bold text-slate-500 outline-none">
                                      <option>JavaScript</option>
                                      <option>Python</option>
                                    </select>
                                  </div>
                                  <div className="h-64 rounded-2xl overflow-hidden border border-slate-200 shadow-inner">
                                    <Editor
                                      theme="vs-dark"
                                      language="javascript"
                                      value={q.correctAnswers[0] || ''}
                                      onChange={(val) => updateQuestion(q.tempId, { correctAnswers: [val] })}
                                      options={{
                                        fontSize: 13,
                                        minimap: { enabled: false },
                                        scrollBeyondLastLine: false,
                                      }}
                                    />
                                  </div>
                                </div>
                              )}

                              {/* Short Answer */}
                              {q.type === 'Short' && (
                                <div className="space-y-2">
                                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Expected Keywords (Validation Pattern)</label>
                                  <input 
                                    className="w-full px-6 py-4 bg-white border border-slate-100 rounded-2xl outline-none focus:border-sky-500 transition-all font-mono text-sm"
                                    value={q.correctAnswers[0] || ''}
                                    onChange={e => updateQuestion(q.tempId, { correctAnswers: [e.target.value] })}
                                    placeholder="Enter correct answer or keywords separated by comma..."
                                  />
                                </div>
                              )}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  ))}
                </AnimatePresence>
                
                <button 
                  onClick={() => addQuestion('MCQ')}
                  className="w-full py-10 border-2 border-dashed border-slate-200 rounded-[2rem] flex flex-col items-center justify-center gap-3 text-slate-400 hover:border-sky-500 hover:text-sky-500 hover:bg-sky-50/50 transition-all group"
                >
                  <Plus size={32} className="group-hover:scale-110 transition-transform" />
                  <span className="text-xs font-black uppercase tracking-widest">Append Intelligence Node</span>
                </button>
              </div>
            </div>
          </div>

          {/* RIGHT SIDE: Sidebar Panels */}
          <div className="lg:col-span-4 space-y-8 sticky top-32">
            
            {/* Live Preview & Status */}
            <div className="bg-white rounded-[2.5rem] p-8 border border-slate-200 shadow-sm space-y-8">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-black text-slate-900">Live Preview</h3>
                <span className="flex items-center gap-2 text-[10px] font-black text-emerald-500 uppercase tracking-widest">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" /> Live
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">Total Weight</p>
                  <p className="text-2xl font-black text-slate-900">{totalPoints} <span className="text-xs font-bold text-slate-400 ml-1">PTS</span></p>
                </div>
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">Complexity</p>
                  <p className={clsx(
                    "text-2xl font-black",
                    difficulty === 'Hard' ? "text-rose-500" : (difficulty === 'Medium' ? "text-amber-500" : "text-emerald-500")
                  )}>{difficulty}</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between text-xs font-bold text-slate-500 uppercase tracking-widest">
                  <span>Configuration Summary</span>
                  <Settings size={14} />
                </div>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl text-xs font-medium text-slate-600">
                    <span className="flex items-center gap-2"><Clock size={14} className="text-sky-500" /> Duration</span>
                    <span className="font-bold text-slate-900">{examData.duration}m</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl text-xs font-medium text-slate-600">
                    <span className="flex items-center gap-2"><Target size={14} className="text-sky-500" /> Passing Score</span>
                    <span className="font-bold text-slate-900">{examData.passingScore}%</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Live Sync Status */}
            <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white relative overflow-hidden group">
               <div className="absolute top-0 right-0 w-32 h-32 bg-sky-500/20 rounded-full blur-3xl -mr-16 -mt-16" />
               <div className="flex items-center gap-4 mb-6">
                 <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center">
                    <Database size={20} className="text-sky-400" />
                 </div>
                 <div>
                    <h3 className="text-sm font-bold">Cloud Synchronization</h3>
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Turso Platform Service</p>
                 </div>
               </div>
               <div className="space-y-4">
                  <div className="flex items-center justify-between px-1">
                     <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Status</span>
                     <span className="text-xs font-bold text-emerald-400 flex items-center gap-1">
                        <CheckCircle size={12} /> Connected
                     </span>
                  </div>
                  <div className="h-[1px] bg-white/10" />
                  <div className="flex items-center justify-between px-1 text-slate-400">
                     <span className="text-[10px] font-bold uppercase tracking-widest">Last Synced</span>
                     <span className="text-[10px] font-bold">{lastSynced ? lastSynced.toLocaleTimeString() : 'Waiting...'}</span>
                  </div>
               </div>
            </div>

            {/* Validation Panel */}
            <AnimatePresence>
              {validationErrors.length > 0 && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-rose-50 rounded-[2.5rem] p-8 border border-rose-100 space-y-6"
                >
                  <div className="flex items-center gap-3 text-rose-600">
                    <AlertCircle size={24} />
                    <h3 className="text-lg font-black tracking-tight">Integrity Check</h3>
                  </div>
                  <div className="space-y-3">
                    {validationErrors.map((err, i) => (
                      <div key={i} className="flex items-start gap-3 text-xs font-bold text-rose-500 leading-relaxed uppercase tracking-widest">
                        <div className="w-1.5 h-1.5 bg-rose-500 rounded-full mt-1.5 shrink-0" />
                        {err}
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

          </div>
        </div>
      </div>
    </div>
  );
};

export default EditExam;
