import { Search, Bell, Settings } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import toast from 'react-hot-toast';

const Navbar = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (search.trim()) {
      toast.success(`Searching for: ${search}`);
      // In a real app, navigate to /search?q=...
    }
  };

  return (
    <header className="h-20 bg-white border-b border-slate-200 flex items-center justify-between px-8 sticky top-0 z-50">
      <div className="flex items-center gap-4 flex-1 max-w-xl">
        <form onSubmit={handleSearch} className="relative w-full group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-sky-500 transition-colors" size={18} />
          <input 
            type="text" 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search assessments, categories..." 
            className="w-full pl-12 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white focus:border-sky-500 transition-all font-medium text-sm"
          />
        </form>
      </div>

      <div className="flex items-center gap-4">
        <button 
          onClick={() => toast('No new notifications', { icon: '🔔' })}
          className="relative p-2.5 text-slate-500 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl transition-all shadow-sm"
        >
          <Bell size={20} />
          <span className="absolute top-2 right-2 w-2 h-2 bg-rose-500 rounded-full border-2 border-white"></span>
        </button>

        <button 
          onClick={() => user?.role === 'admin' ? navigate('/admin/settings') : toast.error('Profile settings coming soon')}
          className="p-2.5 text-slate-900 bg-white border-2 border-slate-900 hover:bg-slate-900 hover:text-white rounded-xl transition-all shadow-sm"
        >
          <Settings size={20} />
        </button>

        <div className="h-8 w-[1px] bg-slate-200 mx-2"></div>

        <div className="flex items-center gap-4 group cursor-pointer" onClick={() => toast.success(`Viewing ${user?.name}'s profile`)}>
          <div className="text-right hidden sm:block">
            <p className="text-sm font-black text-slate-900 leading-none">{user?.name}</p>
            <p className="text-[10px] font-black text-slate-400 mt-1 uppercase tracking-widest">{user?.role} Portal</p>
          </div>
          <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center text-white font-bold shadow-lg group-hover:scale-105 transition-transform">
            {user?.name?.charAt(0).toUpperCase()}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
