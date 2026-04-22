import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import { 
  User, 
  Lock, 
  Shield, 
  Bell, 
  ChevronRight, 
  Save, 
  AlertCircle,
  Key
} from 'lucide-react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { clsx } from 'clsx';

const StudentSettings = () => {
  const { user } = useAuth();
  const [isUpdating, setIsUpdating] = useState(false);
  const [activeTab, setActiveTab] = useState<'profile' | 'security' | 'notifications'>('profile');

  // Form States
  const [name, setName] = useState(user?.name || '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdating(true);
    try {
      await api.put('/auth/profile', { name });
      // Update local context if necessary
      toast.success('Profile updated successfully');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update profile');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      return toast.error('Passwords do not match');
    }
    
    setIsUpdating(true);
    try {
      await api.put('/auth/profile', { 
        currentPassword, 
        newPassword 
      });
      toast.success('Password changed successfully');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to change password');
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-20">
      <header>
        <h1 className="text-4xl font-black text-slate-900 tracking-tight">Account Settings</h1>
        <p className="text-slate-500 font-medium mt-2 text-lg">Manage your profile, security, and notification preferences.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Navigation Sidebar */}
        <div className="lg:col-span-4 space-y-2">
          {[
            { id: 'profile', label: 'Profile Info', icon: User },
            { id: 'security', label: 'Security', icon: Shield },
            { id: 'notifications', label: 'Notifications', icon: Bell },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={clsx(
                "w-full flex items-center justify-between p-4 rounded-2xl transition-all font-bold text-sm",
                activeTab === tab.id 
                  ? "bg-slate-900 text-white shadow-xl shadow-slate-900/10" 
                  : "bg-white text-slate-500 hover:bg-slate-50 border border-slate-200"
              )}
            >
              <div className="flex items-center gap-3">
                <tab.icon size={18} />
                {tab.label}
              </div>
              <ChevronRight size={16} opacity={activeTab === tab.id ? 1 : 0.3} />
            </button>
          ))}
        </div>

        {/* Content Area */}
        <div className="lg:col-span-8">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden"
          >
            {activeTab === 'profile' && (
              <form onSubmit={handleUpdateProfile} className="p-8 space-y-6">
                <div className="flex items-center gap-4 mb-2">
                  <div className="w-12 h-12 bg-sky-50 rounded-xl flex items-center justify-center text-sky-600">
                    <User size={24} />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-slate-900">Personal Information</h3>
                    <p className="text-xs text-slate-400 font-medium">Update your public profile details</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Full Name</label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full px-5 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white focus:border-sky-500 transition-all font-medium"
                      placeholder="Your Name"
                    />
                  </div>
                  <div className="space-y-1.5 opacity-50">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Email Address (Read Only)</label>
                    <input
                      type="email"
                      value={user?.email}
                      disabled
                      className="w-full px-5 py-3 bg-slate-100 border border-slate-200 rounded-xl cursor-not-allowed font-medium"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isUpdating}
                  className="w-full py-4 bg-sky-500 hover:bg-sky-600 text-white rounded-2xl font-black text-sm tracking-wide transition-all flex items-center justify-center gap-2 shadow-lg shadow-sky-500/20 disabled:opacity-50"
                >
                  {isUpdating ? 'Saving...' : 'Update Profile'}
                  <Save size={18} />
                </button>
              </form>
            )}

            {activeTab === 'security' && (
              <form onSubmit={handleChangePassword} className="p-8 space-y-6">
                <div className="flex items-center gap-4 mb-2">
                  <div className="w-12 h-12 bg-rose-50 rounded-xl flex items-center justify-center text-rose-600">
                    <Lock size={24} />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-slate-900">Security Credentials</h3>
                    <p className="text-xs text-slate-400 font-medium">Keep your account secure with a strong password</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Current Password</label>
                    <input
                      type="password"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      className="w-full px-5 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white focus:border-sky-500 transition-all font-medium"
                      placeholder="••••••••"
                      required
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">New Password</label>
                    <input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full px-5 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white focus:border-sky-500 transition-all font-medium"
                      placeholder="Minimum 6 characters"
                      required
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Confirm New Password</label>
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full px-5 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white focus:border-sky-500 transition-all font-medium"
                      placeholder="Repeat new password"
                      required
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isUpdating}
                  className="w-full py-4 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl font-black text-sm tracking-wide transition-all flex items-center justify-center gap-2 shadow-lg shadow-slate-900/20 disabled:opacity-50"
                >
                  {isUpdating ? 'Changing Password...' : 'Change Password'}
                  <Key size={18} />
                </button>
              </form>
            )}

            {activeTab === 'notifications' && (
              <div className="p-8 space-y-6">
                 <div className="flex items-center gap-4 mb-2">
                  <div className="w-12 h-12 bg-amber-50 rounded-xl flex items-center justify-center text-amber-600">
                    <Bell size={24} />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-slate-900">Notifications</h3>
                    <p className="text-xs text-slate-400 font-medium">Control how you receive updates</p>
                  </div>
                </div>

                <div className="space-y-4">
                  {[
                    { title: 'Email Notifications', desc: 'Receive assessment results and news via email.' },
                    { title: 'Browser Alerts', desc: 'Real-time alerts for newly assigned exams.' },
                    { title: 'Weekly Digest', desc: 'Summary of your performance and platform rankings.' }
                  ].map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between p-5 bg-slate-50 rounded-2xl border border-slate-100">
                       <div className="max-w-[70%]">
                          <h4 className="text-sm font-bold text-slate-900">{item.title}</h4>
                          <p className="text-[11px] text-slate-400 font-medium mt-1 leading-relaxed">{item.desc}</p>
                       </div>
                       <div className="w-12 h-6 bg-emerald-500 rounded-full relative p-1 cursor-pointer">
                          <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full shadow-sm" />
                       </div>
                    </div>
                  ))}
                </div>

                <div className="p-4 bg-sky-50 rounded-2xl border border-sky-100 flex items-start gap-4">
                   <AlertCircle className="text-sky-500 shrink-0" size={20} />
                   <p className="text-[11px] text-sky-700 font-medium leading-relaxed">
                     Tip: Keeping all notifications on ensures you never miss a critical evaluation or ranking update.
                   </p>
                </div>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default StudentSettings;
