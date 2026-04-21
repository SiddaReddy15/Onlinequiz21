import { useEffect, useState } from 'react';
import api from '../../services/api';
import { 
  Users, 
  Search, 
  MoreVertical, 
  Mail, 
  Calendar, 
  UserPlus,
  Filter,
  X,
  Lock,
  User
} from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';

const AdminStudents = () => {
  const [students, setStudents] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: ''
  });

  const fetchStudents = async () => {
    try {
      const { data } = await api.get('/admin/students');
      setStudents(data);
    } catch (error) {
      toast.error('Failed to load student registry');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  const handleCreateStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.password) {
      return toast.error('All fields are required');
    }

    setIsSubmitting(true);
    try {
      await api.post('/admin/students', formData);
      toast.success('Student added successfully!');
      setIsModalOpen(false);
      setFormData({ name: '', email: '', password: '' });
      fetchStudents();
    } catch (error) {
      toast.error('Failed to create student account');
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredStudents = students.filter(s => 
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8 pb-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="heading-xl">Student Registry</h1>
          <p className="text-muted mt-1">Manage and monitor all enrolled candidates.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="btn-premium-primary"
        >
          <UserPlus size={20} /> Add Student
        </button>
      </div>

      <div className="card-premium p-6 flex flex-wrap items-center justify-between gap-6">
        <div className="relative flex-1 min-w-[300px]">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="Search by name or email..." 
            className="w-full pl-12 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white focus:border-sky-500 transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-3">
          <button className="btn-premium-secondary text-sm">
            <Filter size={16} /> Filters
          </button>
          <button className="btn-premium-secondary text-sm">
            Export CSV
          </button>
        </div>
      </div>

      <div className="card-premium overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50">
                <th className="p-4 px-8 text-xs font-bold text-slate-500 uppercase tracking-widest border-b border-slate-100">Student</th>
                <th className="p-4 px-8 text-xs font-bold text-slate-500 uppercase tracking-widest border-b border-slate-100">Email</th>
                <th className="p-4 px-8 text-xs font-bold text-slate-500 uppercase tracking-widest border-b border-slate-100">Joined Date</th>
                <th className="p-4 px-8 text-xs font-bold text-slate-500 uppercase tracking-widest border-b border-slate-100">Status</th>
                <th className="p-4 px-8 text-xs font-bold text-slate-500 uppercase tracking-widest border-b border-slate-100 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                [1,2,3,4,5].map(i => (
                  <tr key={i}>
                    <td colSpan={5} className="p-6 px-8"><div className="h-4 bg-slate-100 rounded-lg animate-pulse"></div></td>
                  </tr>
                ))
              ) : filteredStudents.length > 0 ? (
                filteredStudents.map((student) => (
                  <tr key={student.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="p-4 px-8">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-sky-50 text-sky-600 rounded-xl flex items-center justify-center font-bold">
                          {student.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-bold text-slate-900">{student.name}</p>
                          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Candidate</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 px-8 text-slate-600 font-medium">{student.email}</td>
                    <td className="p-4 px-8 text-slate-500 text-sm">
                      <div className="flex items-center gap-2">
                        <Calendar size={14} />
                        {format(new Date(student.createdAt), 'MMM dd, yyyy')}
                      </div>
                    </td>
                    <td className="p-4 px-8">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-600 border border-emerald-100">
                        Active
                      </span>
                    </td>
                    <td className="p-4 px-8 text-right">
                      <button className="p-2 text-slate-400 hover:text-slate-600 hover:bg-white rounded-lg transition-all">
                        <MoreVertical size={18} />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="p-20 text-center text-slate-400">
                    <Users size={48} className="mx-auto mb-4 opacity-20" />
                    <p className="text-lg font-medium">No students found</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Student Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" 
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden"
            >
              <div className="p-8 border-b border-slate-100 flex items-center justify-between">
                <div>
                  <h2 className="heading-lg">Add New Student</h2>
                  <p className="text-muted">Create a candidate profile manually.</p>
                </div>
                <button 
                  onClick={() => setIsModalOpen(false)}
                  className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-xl transition-all"
                >
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleCreateStudent} className="p-8 space-y-6">
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 block">Full Name</label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input 
                      type="text" 
                      className="input-premium pl-12" 
                      placeholder="John Doe"
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 block">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input 
                      type="email" 
                      className="input-premium pl-12" 
                      placeholder="john@example.com"
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 block">Access Password</label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input 
                      type="password" 
                      className="input-premium pl-12" 
                      placeholder="••••••••"
                      value={formData.password}
                      onChange={(e) => setFormData({...formData, password: e.target.value})}
                    />
                  </div>
                </div>

                <div className="pt-4 flex gap-4">
                  <button 
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="btn-premium-secondary flex-1"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    disabled={isSubmitting}
                    className="btn-premium-primary flex-1"
                  >
                    {isSubmitting ? 'Creating...' : 'Create Account'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminStudents;
