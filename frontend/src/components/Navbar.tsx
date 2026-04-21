import { Search, Bell, User, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { user, logout } = useAuth();

  return (
    <header className="h-20 bg-white border-b border-slate-200 flex items-center justify-between px-8 sticky top-0 z-50">
      <div className="flex items-center gap-4 flex-1 max-w-xl">
        <div className="relative w-full group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-sky-500 transition-colors" size={18} />
          <input 
            type="text" 
            placeholder="Search assessments, students..." 
            className="w-full pl-12 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white focus:border-sky-500 transition-all"
          />
        </div>
      </div>

      <div className="flex items-center gap-6">
        <button className="relative p-2 text-slate-500 hover:bg-slate-100 rounded-full transition-colors">
          <Bell size={20} />
          <span className="absolute top-2 right-2 w-2 h-2 bg-sky-500 rounded-full border-2 border-white"></span>
        </button>

        <div className="h-8 w-[1px] bg-slate-200"></div>

        <div className="flex items-center gap-4">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-bold text-slate-900 leading-none">{user?.name}</p>
            <p className="text-xs text-slate-500 mt-1 capitalize">{user?.role} Portal</p>
          </div>
          <div className="w-10 h-10 bg-sky-100 rounded-full flex items-center justify-center text-sky-600 font-bold border border-sky-200">
            {user?.name?.charAt(0).toUpperCase()}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
