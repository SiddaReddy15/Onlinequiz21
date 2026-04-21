import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { toast } from 'react-hot-toast';
import { 
  GraduationCap, 
  Mail, 
  Lock, 
  Loader2, 
  Eye, 
  EyeOff, 
  ArrowRight,
  ShieldCheck,
  Globe
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { clsx } from 'clsx';

// Validation Schema
const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  rememberMe: z.boolean().optional(),
});

type LoginFormValues = z.infer<typeof loginSchema>;

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      rememberMe: false,
    }
  });

  const onSubmit = async (values: LoginFormValues) => {
    setIsLoading(true);
    const loadingToast = toast.loading('Authenticating...');
    try {
      const { data } = await api.post('/auth/login', { 
        email: values.email, 
        password: values.password 
      });
      login(data.token, data.user);
      toast.success(`Welcome back, ${data.user.name.split(' ')[0]}!`, { id: loadingToast });
      navigate(data.user.role === 'admin' ? '/admin' : '/student');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Invalid credentials. Please try again.', { id: loadingToast });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex overflow-hidden font-['Inter']">
      {/* Left Side: Branding & Illustration */}
      <div className="hidden lg:flex lg:w-1/2 bg-slate-900 relative p-16 flex-col justify-between overflow-hidden">
        {/* Abstract Background Patterns */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-[-10%] right-[-10%] w-[80%] h-[80%] bg-sky-500/20 rounded-full blur-[120px] animate-pulse" />
          <div className="absolute bottom-[-10%] left-[-10%] w-[60%] h-[60%] bg-indigo-500/10 rounded-full blur-[100px]" />
          <div 
            className="absolute inset-0 opacity-[0.03]" 
            style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '40px 40px' }} 
          />
        </div>

        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="relative z-10"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-sky-500 rounded-xl flex items-center justify-center text-white shadow-lg shadow-sky-500/20">
              <GraduationCap size={24} />
            </div>
            <span className="text-2xl font-black text-white tracking-tight">QuizPro</span>
          </div>
        </motion.div>

        <div className="relative z-10 space-y-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
          >
            <h2 className="text-5xl font-extrabold text-white leading-tight">
              Empower Your <br />
              <span className="text-sky-400">Learning Journey.</span>
            </h2>
            <p className="mt-6 text-slate-400 text-lg max-w-md leading-relaxed">
              Experience the next generation of online assessments with real-time feedback, 
              coding integration, and comprehensive analytics.
            </p>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="flex items-center gap-8 pt-10"
          >
             <div className="flex -space-x-3">
               {[1,2,3,4].map(i => (
                 <div key={i} className="w-10 h-10 rounded-full border-2 border-slate-900 bg-slate-800 flex items-center justify-center text-[10px] font-bold text-slate-400">
                    JD
                 </div>
               ))}
               <div className="w-10 h-10 rounded-full border-2 border-slate-900 bg-sky-500 flex items-center justify-center text-[10px] font-bold text-white">
                  +2k
               </div>
             </div>
             <p className="text-sm text-slate-400 font-medium">Joined by 2,000+ students globally</p>
          </motion.div>
        </div>

        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="relative z-10 flex items-center gap-6"
        >
          <div className="flex items-center gap-2 text-slate-500 text-xs font-bold uppercase tracking-widest">
            <ShieldCheck size={16} className="text-sky-500" /> Enterprise Grade Security
          </div>
          <div className="h-4 w-[1px] bg-slate-800" />
          <div className="text-slate-500 text-xs font-bold uppercase tracking-widest">
            Uptime 99.9%
          </div>
        </motion.div>
      </div>

      {/* Right Side: Login Form */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center items-center p-8 md:p-20 bg-slate-50">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="max-w-[420px] w-full bg-white p-10 md:p-12 rounded-[2.5rem] shadow-xl shadow-slate-200/50 border border-slate-100"
        >
          <div className="mb-10">
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">Sign In</h1>
            <p className="text-slate-500 mt-2 font-medium">Secure Access to Your Exams</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-5">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Email Address</label>
                <div className="relative group">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-sky-500 transition-colors" size={18} />
                  <input
                    {...register('email')}
                    type="email"
                    className={clsx(
                      "w-full pl-12 pr-4 py-3.5 bg-slate-50 border rounded-2xl outline-none transition-all font-medium",
                      errors.email ? "border-rose-300 focus:border-rose-500" : "border-slate-100 focus:border-sky-500 focus:bg-white focus:ring-4 focus:ring-sky-500/5"
                    )}
                    placeholder="name@example.com"
                  />
                </div>
                <AnimatePresence>
                  {errors.email && (
                    <motion.p 
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="text-xs font-bold text-rose-500 ml-1"
                    >
                      {errors.email.message}
                    </motion.p>
                  )}
                </AnimatePresence>
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between px-1">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Password</label>
                  <Link to="/forgot-password" size="sm" className="text-xs font-bold text-sky-600 hover:text-sky-700 transition-colors">
                    Forgot?
                  </Link>
                </div>
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-sky-500 transition-colors" size={18} />
                  <input
                    {...register('password')}
                    type={showPassword ? 'text' : 'password'}
                    className={clsx(
                      "w-full pl-12 pr-12 py-3.5 bg-slate-50 border rounded-2xl outline-none transition-all font-medium",
                      errors.password ? "border-rose-300 focus:border-rose-500" : "border-slate-100 focus:border-sky-500 focus:bg-white focus:ring-4 focus:ring-sky-500/5"
                    )}
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                <AnimatePresence>
                  {errors.password && (
                    <motion.p 
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="text-xs font-bold text-rose-500 ml-1"
                    >
                      {errors.password.message}
                    </motion.p>
                  )}
                </AnimatePresence>
              </div>
            </div>

            <div className="flex items-center gap-2 px-1">
              <input
                {...register('rememberMe')}
                type="checkbox"
                id="rememberMe"
                className="w-4 h-4 rounded border-slate-300 text-sky-500 focus:ring-sky-500 cursor-pointer"
              />
              <label htmlFor="rememberMe" className="text-sm font-semibold text-slate-500 cursor-pointer select-none">
                Remember me for 30 days
              </label>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full h-14 bg-sky-500 text-white font-black rounded-2xl shadow-lg shadow-sky-500/20 hover:bg-sky-600 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-lg"
            >
              {isLoading ? (
                <Loader2 className="animate-spin" size={24} />
              ) : (
                <>Sign In <ArrowRight size={20} /></>
              )}
            </button>

            <div className="relative py-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-100"></div>
              </div>
              <div className="relative flex justify-center text-xs font-bold uppercase tracking-widest">
                <span className="bg-white px-4 text-slate-400">Or continue with</span>
              </div>
            </div>

            <button
              type="button"
              className="w-full h-14 bg-white border border-slate-200 text-slate-700 font-bold rounded-2xl hover:bg-slate-50 transition-all flex items-center justify-center gap-3 shadow-sm"
            >
              <Globe size={20} className="text-sky-500" />
              Sign in with Google
            </button>
          </form>

          <p className="mt-10 text-center text-slate-500 font-medium">
            Don't have an account?{' '}
            <Link to="/register" className="text-sky-600 font-black hover:underline underline-offset-4">
              Create Account
            </Link>
          </p>
        </motion.div>
        
        <p className="mt-12 text-slate-400 text-[10px] font-bold uppercase tracking-[0.2em] text-center">
          © 2026 QuizPro Infrastructure. All Rights Reserved.
        </p>
      </div>
    </div>
  );
};

export default Login;
