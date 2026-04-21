import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  LayoutDashboard, 
  BookOpen, 
  PlusCircle, 
  BarChart3, 
  LogOut, 
  Users,
  GraduationCap,
  Settings,
  ChevronRight,
  ShieldCheck,
  Zap,
  Activity,
  Layers
} from 'lucide-react';
import { clsx } from 'clsx';

const Sidebar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const adminLinks = [
    { to: '/admin', icon: LayoutDashboard, label: 'Overview' },
    { to: '/admin/exams', icon: BookOpen, label: 'Exams' },
    { to: '/admin/students', icon: Users, label: 'Students' },
    { to: '/admin/results', icon: BarChart3, label: 'Analytics' },
    { to: '/admin/settings', icon: Settings, label: 'Settings' },
  ];

  const studentLinks = [
    { to: '/student', icon: LayoutDashboard, label: 'My Dashboard' },
    { to: '/student/results', icon: Activity, label: 'Attempt History' },
    { to: '/student/leaderboard', icon: BarChart3, label: 'Leaderboard' },
  ];

  const links = user?.role === 'admin' ? adminLinks : studentLinks;

  return (
    <aside className="w-64 bg-white border-r border-slate-200 flex flex-col h-screen sticky top-0 z-[100]">
      <div className="h-20 flex items-center gap-3 px-6">
        <div className="w-10 h-10 bg-sky-500 rounded-xl flex items-center justify-center text-white shadow-lg shadow-sky-200">
          <GraduationCap size={24} />
        </div>
        <span className="font-extrabold text-xl text-slate-900 tracking-tight">QuizPro</span>
      </div>

      <div className="flex-1 px-4 py-6 space-y-8 overflow-y-auto">
        <div>
          <p className="px-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">Main Menu</p>
          <nav className="space-y-1">
            {links.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) =>
                  clsx(
                    'group flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium transition-all duration-200',
                    isActive 
                      ? 'bg-sky-50 text-sky-600 shadow-sm' 
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  )
                }
              >
                <link.icon size={20} className="transition-colors" />
                <span className="flex-1">{link.label}</span>
                {/* <ChevronRight size={14} className="opacity-0 group-hover:opacity-100 transition-opacity" /> */}
              </NavLink>
            ))}
          </nav>
        </div>

        {user?.role === 'admin' && (
          <div>
            <p className="px-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">Actions</p>
            <NavLink
              to="/admin/exams/create"
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-all duration-200"
            >
              <PlusCircle size={20} />
              <span>Create Exam</span>
            </NavLink>
          </div>
        )}
      </div>

      <div className="p-4 border-t border-slate-100">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl font-medium text-red-600 hover:bg-red-50 transition-all duration-200"
        >
          <LogOut size={20} />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
