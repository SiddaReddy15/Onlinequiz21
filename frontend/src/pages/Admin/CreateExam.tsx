import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { toast } from 'react-hot-toast';
import * as XLSX from 'xlsx';
import { 
  Plus, 
  ArrowLeft, 
  ArrowRight, 
  CheckCircle2, 
  Layout, 
  Zap, 
  Upload, 
  Code2,
  ListTodo,
  FileQuestion,
  ChevronDown,
  X,
  Settings
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const CreateExam = () => {
  const [step, setStep] = useState(1);
  const [isSaving, setIsSaving] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  
  const [examData, setExamData] = useState({
    title: '',
    description: '',
    duration: '',
    passingScore: '50',
    startTime: '',
    endTime: '',
  });

  const [questions, setQuestions] = useState<any[]>([]);

  const addQuestion = (type: 'MCQ' | 'Short' | 'Coding' = 'MCQ') => {
    const newQuestion = {
      id: crypto.randomUUID(),
      type,
      category: 'General',
      content: '',
      options: type === 'MCQ' ? ['', '', '', ''] : [],
      correctAnswers: [],
      points: '10',
      constraints: type === 'Coding' 
        ? { timeLimit: '1', memoryLimit: '256', languages: ['Python', 'Javascript'] } 
        : { negativeMarking: '0', multipleCorrect: false },
      explanation: ''
    };
    setQuestions([...questions, newQuestion]);
    setShowDropdown(false);
    toast.success(`${type} question added`);
  };

  const removeQuestion = (id: string) => {
    setQuestions(questions.filter(q => q.id !== id));
  };

  const handleQuestionChange = (id: string, field: string, value: any) => {
    setQuestions(questions.map(q => q.id === id ? { ...q, [field]: value } : q));
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = new Uint8Array(event.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);

        const importedQuestions = jsonData.map((row: any) => {
          const type = row.Type || 'MCQ';
          const options = type === 'MCQ' ? [row.Option1, row.Option2, row.Option3, row.Option4].filter(o => o !== undefined) : [];
          const correctAnswers = row.CorrectAnswer ? row.CorrectAnswer.toString().split(',').map((s: string) => s.trim()) : [];

          return {
            id: crypto.randomUUID(),
            type,
            category: row.Category || 'General',
            content: row.Question || '',
            options,
            correctAnswers,
            points: row.Points?.toString() || '10',
            explanation: row.Explanation || ''
          };
        });

        setQuestions([...questions, ...importedQuestions]);
        toast.success(`Successfully imported ${importedQuestions.length} questions`);
      } catch (error) {
        toast.error('Error parsing Excel file. Please use the correct format.');
      }
    };
    reader.readAsArrayBuffer(file);
    // Clear the input
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const validateStep1 = () => {
    if (!examData.title) return toast.error('Exam title is required');
    if (!examData.duration || parseInt(examData.duration) <= 0) return toast.error('Valid duration is required');
    if (!examData.startTime || !examData.endTime) return toast.error('Start and end times are required');
    setStep(2);
  };

  const handleSubmit = async () => {
    if (questions.length === 0) return toast.error('Add at least one question before publishing');
    
    setIsSaving(true);
    const loadingToast = toast.loading('Publishing assessment...');
    try {
      const { data: exam } = await api.post('/admin/exams', examData);
      await api.post('/admin/questions', { examId: exam.id, questions });
      toast.success('Assessment published successfully!', { id: loadingToast });
      navigate('/admin/exams');
    } catch (error) {
      toast.error('Failed to publish assessment', { id: loadingToast });
    } finally {
      setIsSaving(false);
    }
  };

  const steps = [
    { id: 1, name: 'Exam Details', icon: Layout },
    { id: 2, name: 'Add Questions', icon: FileQuestion },
    { id: 3, name: 'Review & Publish', icon: Zap },
  ];

  return (
    <div className="max-w-4xl mx-auto pb-20">
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleFileUpload} 
        accept=".xlsx, .xls" 
        className="hidden" 
      />

      <div className="flex items-center justify-between mb-10">
        <button 
          onClick={() => navigate(-1)} 
          className="btn-premium-ghost px-2"
        >
          <ArrowLeft size={20} /> Back
        </button>
        <div className="flex items-center gap-2">
          {steps.map((s, i) => (
            <div key={s.id} className="flex items-center">
              <div 
                className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all ${
                  step === s.id 
                  ? 'bg-sky-500 text-white shadow-lg shadow-sky-200' 
                  : step > s.id 
                    ? 'bg-emerald-50 text-emerald-600' 
                    : 'text-slate-400 bg-slate-50'
                }`}
              >
                <s.icon size={16} />
                <span className="text-xs font-bold whitespace-nowrap">{s.name}</span>
              </div>
              {i < steps.length - 1 && (
                <div className={`w-8 h-[2px] mx-2 ${step > s.id ? 'bg-emerald-200' : 'bg-slate-100'}`} />
              )}
            </div>
          ))}
        </div>
      </div>

      <AnimatePresence mode="wait">
        {step === 1 && (
          <motion.div
            key="step1"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-8"
          >
            <div className="card-premium p-8 space-y-6">
              <h2 className="heading-lg">Primary Details</h2>
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 block">Exam Title</label>
                  <input 
                    type="text"
                    className="input-premium" 
                    placeholder="e.g. Advanced System Architecture" 
                    value={examData.title}
                    onChange={(e) => setExamData({...examData, title: e.target.value})}
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 block">Description</label>
                  <textarea 
                    className="input-premium min-h-[120px]" 
                    placeholder="Describe the assessment objectives..."
                    value={examData.description}
                    onChange={(e) => setExamData({...examData, description: e.target.value})}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 block">Duration (Minutes)</label>
                  <input 
                    type="number" 
                    className="input-premium" 
                    placeholder="60"
                    value={examData.duration}
                    onChange={(e) => setExamData({...examData, duration: e.target.value})}
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 block">Passing Score (%)</label>
                  <input 
                    type="number" 
                    className="input-premium" 
                    placeholder="50"
                    value={examData.passingScore}
                    onChange={(e) => setExamData({...examData, passingScore: e.target.value})}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 block">Start Date & Time</label>
                  <input 
                    type="datetime-local" 
                    className="input-premium" 
                    value={examData.startTime}
                    onChange={(e) => setExamData({...examData, startTime: e.target.value})}
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 block">End Date & Time</label>
                  <input 
                    type="datetime-local" 
                    className="input-premium" 
                    value={examData.endTime}
                    onChange={(e) => setExamData({...examData, endTime: e.target.value})}
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end">
              <button 
                onClick={validateStep1}
                className="btn-premium-primary"
              >
                Add Questions <ArrowRight size={20} />
              </button>
            </div>
          </motion.div>
        )}

        {step === 2 && (
          <motion.div
            key="step2"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-8"
          >
            <div className="flex flex-wrap items-center justify-between gap-4">
              <h2 className="heading-lg">Assessment Logic Bank</h2>
              <div className="flex items-center gap-3">
                <button 
                  onClick={() => fileInputRef.current?.click()}
                  className="btn-premium-secondary text-sm"
                >
                  <Upload size={16} /> Bulk Import (.xlsx)
                </button>
                <div className="relative" ref={dropdownRef}>
                  <button 
                    onClick={() => setShowDropdown(!showDropdown)}
                    className="btn-premium-primary text-sm flex items-center gap-2"
                  >
                    <Plus size={16} /> Add Question <ChevronDown size={14} className={`transition-transform ${showDropdown ? 'rotate-180' : ''}`} />
                  </button>
                  <AnimatePresence>
                    {showDropdown && (
                      <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        className="absolute right-0 top-full mt-2 w-48 bg-white border border-slate-200 rounded-xl shadow-xl z-50 overflow-hidden"
                      >
                        <button onClick={() => addQuestion('MCQ')} className="w-full px-4 py-3 text-left text-sm hover:bg-slate-50 flex items-center gap-2 font-medium text-slate-700">
                          <ListTodo size={16} className="text-sky-500" /> Multiple Choice
                        </button>
                        <button onClick={() => addQuestion('Coding')} className="w-full px-4 py-3 text-left text-sm hover:bg-slate-50 flex items-center gap-2 font-medium border-t border-slate-100 text-slate-700">
                          <Code2 size={16} className="text-emerald-500" /> Coding Quest
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              {questions.map((q) => (
                <div key={q.id} className="card-premium p-8 relative">
                  <button 
                    onClick={() => removeQuestion(q.id)}
                    className="absolute top-6 right-6 p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                  >
                    <X size={20} />
                  </button>

                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-10 h-10 bg-slate-900 text-white rounded-lg flex items-center justify-center font-bold">
                      {questions.indexOf(q) + 1}
                    </div>
                    <div className={`px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-widest ${
                      q.type === 'MCQ' ? 'bg-sky-50 text-sky-600' : q.type === 'Short' ? 'bg-violet-50 text-violet-600' : 'bg-emerald-50 text-emerald-600'
                    }`}>
                      {q.type} Question
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div>
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 block">Question Content</label>
                      <textarea 
                        className="input-premium min-h-[100px]" 
                        placeholder="Type your question here..."
                        value={q.content}
                        onChange={(e) => handleQuestionChange(q.id, 'content', e.target.value)}
                      />
                    </div>

                    {q.type === 'MCQ' && (
                      <div className="space-y-6">
                        <div className="space-y-4">
                          <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Options (Select the correct one{q.constraints?.multipleCorrect && 's'})</label>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {q.options.map((opt: string, optIdx: number) => (
                              <div key={optIdx} className="flex items-center gap-3">
                                <input 
                                  type={q.constraints?.multipleCorrect ? "checkbox" : "radio"}
                                  name={`correct-${q.id}`}
                                  checked={q.correctAnswers.includes(opt) && opt !== ''}
                                  onChange={() => {
                                    if (q.constraints?.multipleCorrect) {
                                      const current = q.correctAnswers;
                                      const next = current.includes(opt) 
                                        ? current.filter((a: string) => a !== opt)
                                        : [...current, opt];
                                      handleQuestionChange(q.id, 'correctAnswers', next);
                                    } else {
                                      handleQuestionChange(q.id, 'correctAnswers', [opt]);
                                    }
                                  }}
                                  className={`w-5 h-5 text-sky-500 border-slate-300 focus:ring-sky-500 ${q.constraints?.multipleCorrect ? 'rounded' : 'rounded-full'}`}
                                />
                                <input 
                                  type="text"
                                  className="input-premium flex-1" 
                                  placeholder={`Option ${optIdx + 1}`}
                                  value={opt}
                                  onChange={(e) => {
                                    const newOpts = [...q.options];
                                    newOpts[optIdx] = e.target.value;
                                    handleQuestionChange(q.id, 'options', newOpts);
                                  }}
                                />
                              </div>
                            ))}
                          </div>
                        </div>

                        <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100 space-y-4">
                          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                            <Settings size={14} className="text-sky-500" /> Question Constraints
                          </p>
                          <div className="flex flex-wrap items-center gap-6">
                            <label className="flex items-center gap-3 cursor-pointer group">
                              <div 
                                onClick={() => handleQuestionChange(q.id, 'constraints', { ...q.constraints, multipleCorrect: !q.constraints?.multipleCorrect })}
                                className={`w-10 h-5 rounded-full transition-all relative ${q.constraints?.multipleCorrect ? 'bg-sky-500' : 'bg-slate-300'}`}
                              >
                                <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${q.constraints?.multipleCorrect ? 'left-6' : 'left-1'}`} />
                              </div>
                              <span className="text-sm font-medium text-slate-700 group-hover:text-slate-900">Multiple Correct Answers</span>
                            </label>

                            <div className="flex items-center gap-3">
                              <span className="text-sm font-medium text-slate-700">Negative Marking:</span>
                              <input 
                                type="number" 
                                className="w-20 px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sky-500/20"
                                placeholder="0"
                                value={q.constraints?.negativeMarking}
                                onChange={(e) => handleQuestionChange(q.id, 'constraints', { ...q.constraints, negativeMarking: e.target.value })}
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {q.type !== 'MCQ' && (
                      <div>
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 block">
                          {q.type === 'Coding' ? 'Expected Output / Sample Result' : 'Expected Answer (Correct Pattern)'}
                        </label>
                        <input 
                          type="text"
                          className="input-premium font-mono" 
                          placeholder={q.type === 'Coding' ? "e.g. 'Hello World' or [1, 2, 3]" : "What is the expected result?"}
                          value={q.correctAnswers[0] || ''}
                          onChange={(e) => handleQuestionChange(q.id, 'correctAnswers', [e.target.value])}
                        />
                      </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 block">Question Category (Topic)</label>
                        <input 
                          type="text"
                          className="input-premium" 
                          placeholder="e.g. Python, React, SQL..."
                          value={q.category}
                          onChange={(e) => handleQuestionChange(q.id, 'category', e.target.value)}
                        />
                      </div>
                      <div>
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 block">Points Weightage</label>
                        <input 
                          type="number"
                          className="input-premium" 
                          value={q.points}
                          onChange={(e) => handleQuestionChange(q.id, 'points', e.target.value)}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              {questions.length === 0 && (
                <div className="text-center py-20 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
                  <FileQuestion size={48} className="mx-auto text-slate-300 mb-4" />
                  <p className="text-slate-500 font-medium">No questions added yet. Use the buttons above to start building.</p>
                </div>
              )}
            </div>

            <div className="flex justify-between gap-4">
              <button onClick={() => setStep(1)} className="btn-premium-secondary">
                <ArrowLeft size={20} /> Exam Details
              </button>
              <button 
                onClick={() => questions.length > 0 ? setStep(3) : toast.error('Add at least one question')} 
                className="btn-premium-primary"
              >
                Review Assessment <ArrowRight size={20} />
              </button>
            </div>
          </motion.div>
        )}

        {step === 3 && (
          <motion.div
            key="step3"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="space-y-8"
          >
            <div className="card-premium p-12 text-center space-y-8">
              <div className="w-20 h-20 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mx-auto shadow-inner">
                <CheckCircle2 size={48} />
              </div>
              <div className="space-y-2">
                <h2 className="heading-xl">Ready for Publication</h2>
                <p className="text-muted max-w-lg mx-auto">
                  Please review the summary below. Once published, the exam will be accessible to students according to the scheduled timeframe.
                </p>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-8 py-8 border-y border-slate-100 max-w-2xl mx-auto">
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Questions</p>
                  <p className="text-2xl font-bold text-slate-900">{questions.length}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Duration</p>
                  <p className="text-2xl font-bold text-slate-900">{examData.duration}m</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Pass Score</p>
                  <p className="text-2xl font-bold text-slate-900">{examData.passingScore}%</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Security</p>
                  <p className="text-2xl font-bold text-slate-900">High</p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <button 
                  onClick={() => setStep(2)} 
                  className="btn-premium-secondary w-full sm:w-auto px-10"
                >
                  Edit Questions
                </button>
                <button 
                  onClick={handleSubmit}
                  disabled={isSaving}
                  className="btn-premium-primary w-full sm:w-auto px-10"
                >
                  {isSaving ? 'Publishing...' : 'Publish Assessment'} <Zap size={20} />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CreateExam;
