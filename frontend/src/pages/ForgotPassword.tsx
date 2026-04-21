import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { toast } from 'react-hot-toast';
import { 
  Mail, 
  Loader2, 
  ArrowLeft,
  CheckCircle2
} from 'lucide-react';
import { motion } from 'framer-motion';

const forgotPasswordSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
});

type ForgotPasswordValues = z.infer<typeof forgotPasswordSchema>;

const ForgotPassword = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordValues>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const onSubmit = async (values: ForgotPasswordValues) => {
    setIsLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    setIsSubmitted(true);
    setIsLoading(false);
    toast.success('Reset link sent to your email');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center p-6 font-['Inter']">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-[420px] w-full bg-white p-10 md:p-12 rounded-[2.5rem] shadow-xl shadow-slate-200/50 border border-slate-100"
      >
        {!isSubmitted ? (
          <>
            <div className="mb-10">
              <Link to="/login" className="inline-flex items-center gap-2 text-sky-600 font-bold text-sm mb-6 hover:gap-3 transition-all">
                <ArrowLeft size={18} /> Back to Login
              </Link>
              <h1 className="text-3xl font-black text-slate-900 tracking-tight">Forgot Password</h1>
              <p className="text-slate-500 mt-2 font-medium">Enter your email and we'll send you a link to reset your password.</p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Email Address</label>
                <div className="relative group">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-sky-500 transition-colors" size={18} />
                  <input
                    {...register('email')}
                    type="email"
                    className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:border-sky-500 focus:bg-white focus:ring-4 focus:ring-sky-500/5 transition-all font-medium"
                    placeholder="name@example.com"
                  />
                </div>
                {errors.email && (
                  <p className="text-xs font-bold text-rose-500 ml-1">{errors.email.message}</p>
                )}
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full h-14 bg-sky-500 text-white font-black rounded-2xl shadow-lg shadow-sky-500/20 hover:bg-sky-600 active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-2 text-lg"
              >
                {isLoading ? <Loader2 className="animate-spin" size={24} /> : 'Send Reset Link'}
              </button>
            </form>
          </>
        ) : (
          <div className="text-center">
            <div className="w-20 h-20 bg-emerald-50 text-emerald-500 rounded-3xl flex items-center justify-center mx-auto mb-8">
              <CheckCircle2 size={40} />
            </div>
            <h2 className="text-2xl font-black text-slate-900 mb-4">Check your email</h2>
            <p className="text-slate-500 font-medium mb-10 leading-relaxed">
              We've sent a password reset link to your email address. Please follow the instructions to reset your password.
            </p>
            <Link to="/login" className="block w-full py-4 bg-slate-900 text-white font-bold rounded-2xl hover:bg-slate-800 transition-all">
              Return to Login
            </Link>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default ForgotPassword;
