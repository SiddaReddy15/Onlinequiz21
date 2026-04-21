import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import { toast } from 'react-hot-toast';
import { 
  User, 
  Save,
  UserCircle,
  KeyRound,
  Settings as SettingsIcon,
  ChevronRight
} from 'lucide-react';
import { motion } from 'framer-motion';

const AdminSettings = () => {
  const { user, login } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
  const [isSaving, setIsSaving] = useState(false);
  
  const [formData, setFormData] = useState({
    name: user?.name || '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.newPassword && formData.newPassword !== formData.confirmPassword) {
      return toast.error('Passwords do not match');
    }

    setIsSaving(true);
    try {
      const { data } = await api.put('/auth/profile', {
        name: formData.name,
        currentPassword: formData.currentPassword,
        newPassword: formData.newPassword
      });
      
      // Update local auth context
      login(localStorage.getItem('token')!, data.user);
      
      toast.success('Profile updated successfully');
      setFormData({ ...formData, currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update profile');
    } finally {
      setIsSaving(false);
    }
  };

  const tabs = [
    { id: 'profile', name: 'Profile Settings', icon: UserCircle },
    { id: 'security', name: 'Security', icon: KeyRound },
    { id: 'system', name: 'System Config', icon: SettingsIcon },
  ];

  return (
    <div className="max-w-5xl mx-auto pb-10">
      <div className="mb-10">
        <h1 className="heading-xl">Account Settings</h1>
        <p className="text-muted mt-1">Manage your administrative profile and portal configuration.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar Tabs */}
        <div className="lg:col-span-1 space-y-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all ${
                activeTab === tab.id 
                ? 'bg-sky-500 text-white shadow-lg shadow-sky-100' 
                : 'text-slate-500 hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center gap-3">
                <tab.icon size={18} />
                <span className="text-sm font-bold">{tab.name}</span>
              </div>
              <ChevronRight size={14} className={activeTab === tab.id ? 'opacity-100' : 'opacity-0'} />
            </button>
          ))}
        </div>

        {/* Content Area */}
        <div className="lg:col-span-3">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="card-premium p-8"
          >
            {activeTab === 'profile' && (
              <form onSubmit={handleUpdateProfile} className="space-y-6">
                <div className="flex items-center gap-6 mb-8">
                  <div className="w-20 h-20 bg-sky-50 text-sky-500 rounded-2xl flex items-center justify-center border-2 border-sky-100 shadow-inner">
                    <User size={40} />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-900">{user?.name}</h3>
                    <p className="text-sm text-slate-500">Administrator • {user?.email}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 block">Display Name</label>
                    <input 
                      type="text" 
                      className="input-premium text-sm" 
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 block">Email Address</label>
                    <input 
                      type="email" 
                      className="input-premium text-sm bg-slate-50 cursor-not-allowed" 
                      value={user?.email}
                      disabled
                    />
                  </div>
                </div>

                <div className="pt-6 border-t border-slate-100 flex justify-end">
                  <button 
                    disabled={isSaving}
                    className="btn-premium-primary"
                  >
                    <Save size={18} /> {isSaving ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </form>
            )}            {activeTab === 'security' && (
              <form onSubmit={handleUpdateProfile} className="space-y-6">
                <div className="space-y-6">
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 block">Current Password</label>
                    <input 
                      type="password" 
                      className="input-premium text-sm" 
                      placeholder="Required to make changes"
                      value={formData.currentPassword}
                      onChange={(e) => setFormData({...formData, currentPassword: e.target.value})}
                    />
                  </div>
 
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 block">New Password</label>
                      <input 
                        type="password" 
                        className="input-premium text-sm" 
                        placeholder="Min. 6 characters"
                        value={formData.newPassword}
                        onChange={(e) => setFormData({...formData, newPassword: e.target.value})}
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 block">Confirm Password</label>
                      <input 
                        type="password" 
                        className="input-premium text-sm" 
                        placeholder="Repeat new password"
                        value={formData.confirmPassword}
                        onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-6 border-t border-slate-100 flex justify-end">
                  <button 
                    disabled={isSaving}
                    className="btn-premium-primary"
                  >
                    <Save size={18} /> {isSaving ? 'Update Password' : 'Update Password'}
                  </button>
                </div>
              </form>
            )}

            {activeTab === 'system' && (
              <div className="space-y-8">
                <div className="p-6 bg-amber-50 rounded-2xl border border-amber-100">
                  <h4 className="font-bold text-amber-800 flex items-center gap-2 mb-2">
                    <SettingsIcon size={18} /> Global Configurations
                  </h4>
                  <p className="text-sm text-amber-700/80">These settings affect all assessments and users within the portal.</p>
                </div>

                <div className="space-y-6">
                  <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                    <div>
                      <p className="font-bold text-slate-900">Proctoring Mode</p>
                      <p className="text-xs text-slate-500">Enable advanced browser monitoring for students.</p>
                    </div>
                    <div className="w-12 h-6 bg-sky-500 rounded-full relative p-1 cursor-pointer">
                      <div className="w-4 h-4 bg-white rounded-full absolute right-1"></div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                    <div>
                      <p className="font-bold text-slate-900">Email Notifications</p>
                      <p className="text-xs text-slate-500">Send automated reports to students upon submission.</p>
                    </div>
                    <div className="w-12 h-6 bg-slate-200 rounded-full relative p-1 cursor-not-allowed opacity-50">
                      <div className="w-4 h-4 bg-white rounded-full absolute left-1 shadow-sm"></div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default AdminSettings;
