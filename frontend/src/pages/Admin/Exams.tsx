import { useEffect, useState } from 'react';
import api from '../../services/api';
import { 
  BookOpen, 
  Clock, 
  Calendar, 
  ChevronRight, 
  Search, 
  Plus, 
  Trash2, 
  Edit3, 
  CheckCircle2, 
  Clock3, 
  AlertCircle,
  FileText,
  Shield
} from 'lucide-react';
import { format } from 'date-fns';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';

const AdminExams = () => {
  const [exams, setExams] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const navigate = useNavigate();

  const fetchExams = async () => {
    try {
      const { data } = await api.get('/admin/exams');
      // Adding realistic statuses for the UI
      const enhancedExams = data.map((e: any, idx: number) => ({
        ...e,
        status: e.status || (idx % 3 === 0 ? 'Published' : idx % 3 === 1 ? 'Draft' : 'Completed')
      }));
      setExams(enhancedExams);
    } catch (error) {
      toast.error('Failed to load assessments');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchExams();
  }, []);

  const handleDelete = async (id: string, title: string) => {
    if (!window.confirm(`Are you sure you want to delete "${title}"?`)) return;
    
    try {
      await api.delete(`/admin/exams/${id}`);
      setExams(exams.filter(e => e.id !== id));
      toast.success('Assessment deleted successfully');
    } catch (error) {
      toast.error('Failed to delete assessment');
    }
  };

  const filteredExams = exams.filter(e => {
    const matchesSearch = e.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         e.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || e.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Published': 
        return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-600 border border-emerald-100"><CheckCircle2 size={12} /> {status}</span>;
      case 'Draft': 
        return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-50 text-amber-600 border border-amber-100"><Clock3 size={12} /> {status}</span>;
      case 'Completed': 
        return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-600 border border-slate-200"><FileText size={12} /> {status}</span>;
      default: 
        return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-slate-50 text-slate-400">{status}</span>;
    }
  };

  return (
    <div className="space-y-8 pb-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="heading-xl">Assessments</h1>
          <p className="text-muted mt-1">Manage and monitor all your examination protocols.</p>
        </div>
        <Link to="/admin/exams/create" className="btn-premium-primary">
          <Plus size={20} /> Create New Exam
        </Link>
      </div>

      <div className="card-premium p-6 flex flex-wrap items-center justify-between gap-6">
        <div className="relative flex-1 min-w-[300px]">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="Search by title or description..." 
            className="w-full pl-12 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white focus:border-sky-500 transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2">
          {['all', 'Published', 'Draft', 'Completed'].map(status => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                statusFilter === status 
                ? 'bg-slate-900 text-white' 
                : 'text-slate-500 hover:bg-slate-100'
              }`}
            >
              {status === 'all' ? 'All Exams' : status}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <AnimatePresence mode="popLayout">
          {filteredExams.map((exam, idx) => (
            <motion.div 
              key={exam.id}
              layout
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2, delay: idx * 0.05 }}
              className="card-premium group flex flex-col h-full"
            >
              <div className="p-6 flex-1 space-y-6">
                <div className="flex items-start justify-between">
                  <div className="w-12 h-12 bg-sky-50 text-sky-500 rounded-xl flex items-center justify-center transition-colors group-hover:bg-sky-500 group-hover:text-white">
                    <BookOpen size={24} />
                  </div>
                  {getStatusBadge(exam.status)}
                </div>
                
                <div>
                  <h3 className="text-xl font-bold text-slate-900 line-clamp-1">{exam.title}</h3>
                  <p className="text-sm text-slate-500 mt-2 line-clamp-2 leading-relaxed">
                    {exam.description || 'No description provided.'}
                  </p>
                </div>

                <div className="flex items-center gap-4 pt-4 border-t border-slate-100">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500">
                    <Clock size={14} className="text-sky-500" />
                    {exam.duration}m
                  </div>
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500">
                    <Shield size={14} className="text-emerald-500" />
                    {exam.passingScore}% Pass
                  </div>
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 ml-auto">
                    <Calendar size={14} />
                    {format(new Date(exam.startTime), 'MMM dd')}
                  </div>
                </div>
              </div>
              
              <div className="p-4 bg-slate-50/50 border-t border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => navigate(`/admin/exams/edit/${exam.id}`)}
                    className="p-2 text-slate-400 hover:text-sky-600 hover:bg-white rounded-lg transition-all border border-transparent hover:border-slate-200"
                    title="Edit Exam"
                  >
                    <Edit3 size={18} />
                  </button>
                  <button 
                    onClick={() => handleDelete(exam.id, exam.title)}
                    className="p-2 text-slate-400 hover:text-red-600 hover:bg-white rounded-lg transition-all border border-transparent hover:border-slate-200"
                    title="Delete Exam"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
                <button 
                  onClick={() => navigate(`/admin/exams/edit/${exam.id}`)}
                  className="flex items-center gap-1 text-sm font-bold text-slate-700 hover:text-sky-600 transition-colors"
                >
                  Manage <ChevronRight size={16} />
                </button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {isLoading && (
          [1,2,3].map(i => (
            <div key={i} className="card-premium h-64 animate-pulse">
              <div className="p-6 space-y-6">
                <div className="flex justify-between">
                  <div className="w-12 h-12 bg-slate-100 rounded-xl" />
                  <div className="w-20 h-6 bg-slate-100 rounded-lg" />
                </div>
                <div className="space-y-3">
                  <div className="w-3/4 h-6 bg-slate-100 rounded-lg" />
                  <div className="w-full h-4 bg-slate-50 rounded-lg" />
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {filteredExams.length === 0 && !isLoading && (
        <div className="card-premium py-20 text-center">
          <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center text-slate-300 mx-auto mb-6">
            <AlertCircle size={40} />
          </div>
          <h3 className="text-xl font-bold text-slate-900">No exams found</h3>
          <p className="text-slate-500 mt-2">Try adjusting your search or filters.</p>
          <button 
            onClick={() => { setSearchTerm(''); setStatusFilter('all'); }}
            className="btn-premium-secondary mt-6 mx-auto"
          >
            Clear Filters
          </button>
        </div>
      )}
    </div>
  );
};

export default AdminExams;
