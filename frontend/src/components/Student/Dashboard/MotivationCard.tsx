import { motion } from 'framer-motion';
import { Lightbulb, ArrowUpRight, Sparkles } from 'lucide-react';

export const MotivationCard = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-br from-sky-500 to-indigo-600 p-8 rounded-[2.5rem] text-white relative overflow-hidden shadow-xl"
    >
      <div className="relative z-10 flex flex-col h-full">
        <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center mb-6">
          <Lightbulb size={24} className="text-sky-100" />
        </div>
        
        <h3 className="text-2xl font-black leading-tight tracking-tight mb-4">
          Success is not final, failure is not fatal.
        </h3>
        
        <p className="text-sky-100/80 text-sm font-medium leading-relaxed mb-8">
          It is the courage to continue that counts. Your recent progress in <span className="text-white font-bold">SQL Analytics</span> is impressive! Keep pushing the boundaries.
        </p>

        <button className="mt-auto group flex items-center gap-2 text-white font-black text-xs uppercase tracking-widest hover:gap-3 transition-all">
          Explore Insights
          <ArrowUpRight size={16} className="group-hover:rotate-45 transition-transform" />
        </button>
      </div>

      {/* Decorative background effects */}
      <Sparkles className="absolute top-8 right-8 text-white/10" size={120} />
      <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-white/10 blur-3xl rounded-full" />
    </motion.div>
  );
};
