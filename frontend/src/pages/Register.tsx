import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import api from '../services/api';
import { toast } from 'react-hot-toast';
import { 
  GraduationCap, 
  Mail, 
  Lock, 
  User, 
  Loader2, 
  Eye, 
  EyeOff, 
  ArrowRight,
  ShieldCheck,
  Globe,
  Check
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { clsx } from 'clsx';

// Validation Schema
const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
  confirmPassword: z.string(),
  agreeTerms: z.boolean().refine(val => val === true, 'You must agree to the terms'),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type RegisterFormValues = z.infer<typeof registerSchema>;

const Register = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      agreeTerms: false,
    }
  });

  const password = watch('password', '');

  const getPasswordStrength = (pass: string) => {
    if (!pass) return null;
    let score = 0;
    if (pass.length >= 8) score++;
    if (/[A-Z]/.test(pass)) score++;
    if (/[0-9]/.test(pass)) score++;
    if (/[^A-Za-z0-9]/.test(pass)) score++;
    
    if (score <= 1) return { label: 'Weak', color: 'bg-rose-500', width: 'w-1/4' };
    if (score === 2) return { label: 'Medium', color: 'bg-amber-500', width: 'w-2/4' };
    if (score >= 3) return { label: 'Strong', color: 'bg-emerald-500', width: 'w-full' };
    return null;
  };

  const strength = getPasswordStrength(password);

  const onSubmit = async (values: RegisterFormValues) => {
    setIsLoading(true);
    const loadingToast = toast.loading('Creating your account...');
    try {
      await api.post('/auth/register', {
        name: values.name,
        email: values.email,
        password: values.password,
      });
      toast.success('Account created successfully! Please sign in.', { id: loadingToast });
      navigate('/login');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Registration failed. Email might already exist.', { id: loadingToast });
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
              Start Your <br />
              <span className="text-sky-400">Exam Journey.</span>
            </h2>
            <p className="mt-6 text-slate-400 text-lg max-w-md leading-relaxed">
              Create your account and begin assessments instantly. 
              Join a community of thousands of students mastering their skills.
            </p>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="space-y-4"
          >
             {[
               "Instant access to 500+ assessments",
               "Real-time performance analytics",
               "Verified certifications for top scorers"
             ].map((text, i) => (
               <div key={i} className="flex items-center gap-3 text-slate-300 font-medium">
                  <div className="w-5 h-5 bg-sky-500/20 text-sky-400 rounded-full flex items-center justify-center">
                    <Check size={12} strokeWidth={4} />
                  </div>
                  {text}
               </div>
             ))}
          </motion.div>
        </div>

        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="relative z-10 flex items-center gap-6"
        >
          <div className="flex items-center gap-2 text-slate-500 text-xs font-bold uppercase tracking-widest">
            <ShieldCheck size={16} className="text-sky-500" /> Secure Encryption
          </div>
          <div className="h-4 w-[1px] bg-slate-800" />
          <div className="text-slate-500 text-xs font-bold uppercase tracking-widest">
            Data Privacy Focused
          </div>
        </motion.div>
      </div>

      {/* Right Side: Register Form */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center items-center p-8 md:p-12 lg:p-20 bg-slate-50 overflow-y-auto">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="max-w-[480px] w-full bg-white p-8 md:p-12 rounded-[2.5rem] shadow-xl shadow-slate-200/50 border border-slate-100"
        >
          <div className="mb-8 text-center lg:text-left">
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">Create Account</h1>
            <p className="text-slate-500 mt-2 font-medium">Secure Registration for Online Exams</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div className="space-y-4">
              {/* Full Name */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Full Name</label>
                <div className="relative group">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-sky-500 transition-colors" size={18} />
                  <input
                    {...register('name')}
                    type="text"
                    className={clsx(
                      "w-full pl-12 pr-4 py-3 bg-slate-50 border rounded-2xl outline-none transition-all font-medium",
                      errors.name ? "border-rose-300 focus:border-rose-500" : "border-slate-100 focus:border-sky-500 focus:bg-white focus:ring-4 focus:ring-sky-500/5"
                    )}
                    placeholder="John Doe"
                  />
                </div>
                <AnimatePresence>
                  {errors.name && (
                    <motion.p 
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="text-xs font-bold text-rose-500 ml-1"
                    >
                      {errors.name.message}
                    </motion.p>
                  )}
                </AnimatePresence>
              </div>

              {/* Email Address */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Email Address</label>
                <div className="relative group">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-sky-500 transition-colors" size={18} />
                  <input
                    {...register('email')}
                    type="email"
                    className={clsx(
                      "w-full pl-12 pr-4 py-3 bg-slate-50 border rounded-2xl outline-none transition-all font-medium",
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

              {/* Password */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Password</label>
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-sky-500 transition-colors" size={18} />
                  <input
                    {...register('password')}
                    type={showPassword ? 'text' : 'password'}
                    className={clsx(
                      "w-full pl-12 pr-12 py-3 bg-slate-50 border rounded-2xl outline-none transition-all font-medium",
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
                
                {/* Strength Indicator */}
                <AnimatePresence>
                  {strength && (
                    <motion.div 
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="space-y-1.5 mt-2"
                    >
                      <div className="flex justify-between items-center px-1">
                        <span className="text-[10px] font-bold text-slate-400 uppercase">Strength</span>
                        <span className={clsx("text-[10px] font-black uppercase", strength.color.replace('bg-', 'text-'))}>
                          {strength.label}
                        </span>
                      </div>
                      <div className="h-1 w-full bg-slate-100 rounded-full overflow-hidden">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: strength.width.split('-')[1] === 'full' ? '100%' : (strength.width.split('-')[1] === '1/4' ? '25%' : '50%') }}
                          className={clsx("h-full transition-all duration-500", strength.color)}
                        />
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

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

              {/* Confirm Password */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Confirm Password</label>
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-sky-500 transition-colors" size={18} />
                  <input
                    {...register('confirmPassword')}
                    type={showPassword ? 'text' : 'password'}
                    className={clsx(
                      "w-full pl-12 pr-4 py-3 bg-slate-50 border rounded-2xl outline-none transition-all font-medium",
                      errors.confirmPassword ? "border-rose-300 focus:border-rose-500" : "border-slate-100 focus:border-sky-500 focus:bg-white focus:ring-4 focus:ring-sky-500/5"
                    )}
                    placeholder="••••••••"
                  />
                </div>
                <AnimatePresence>
                  {errors.confirmPassword && (
                    <motion.p 
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="text-xs font-bold text-rose-500 ml-1"
                    >
                      {errors.confirmPassword.message}
                    </motion.p>
                  )}
                </AnimatePresence>
              </div>
            </div>

            <div className="space-y-4 pt-2">
              <div className="flex items-start gap-3 px-1">
                <input
                  {...register('agreeTerms')}
                  type="checkbox"
                  id="agreeTerms"
                  className="mt-1 w-4 h-4 rounded border-slate-300 text-sky-500 focus:ring-sky-500 cursor-pointer"
                />
                <label htmlFor="agreeTerms" className="text-xs font-semibold text-slate-500 leading-relaxed cursor-pointer select-none">
                  I agree to the <Link to="/terms" className="text-sky-600 hover:underline">Terms of Service</Link> and <Link to="/privacy" className="text-sky-600 hover:underline">Privacy Policy</Link>
                </label>
              </div>
              <AnimatePresence>
                {errors.agreeTerms && (
                  <motion.p 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-[10px] font-bold text-rose-500 ml-1"
                  >
                    {errors.agreeTerms.message}
                  </motion.p>
                )}
              </AnimatePresence>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full h-14 bg-sky-500 text-white font-black rounded-2xl shadow-lg shadow-sky-500/20 hover:bg-sky-600 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-lg"
            >
              {isLoading ? (
                <Loader2 className="animate-spin" size={24} />
              ) : (
                <>Create Account <ArrowRight size={20} /></>
              )}
            </button>

            <div className="relative py-2">
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
              Sign up with Google
            </button>
          </form>

          <p className="mt-8 text-center text-slate-500 font-medium">
            Already have an account?{' '}
            <Link to="/login" className="text-sky-600 font-black hover:underline underline-offset-4">
              Sign In
            </Link>
          </p>
        </motion.div>
        
        <p className="mt-8 text-slate-400 text-[10px] font-bold uppercase tracking-[0.2em] text-center">
          © 2026 QuizPro Infrastructure. All Rights Reserved.
        </p>
      </div>
    </div>
  );
};

export default Register;
