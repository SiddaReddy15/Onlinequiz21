import { motion } from 'framer-motion';
import { Zap, Brain, Code, Database, ChevronRight } from 'lucide-react';
import { clsx } from 'clsx';

interface Skill {
  name: string;
  score: number;
  totalQuestions: number;
  correctAnswers: number;
}

interface SkillsBreakdownProps {
  skills: Skill[];
}

export const SkillsBreakdown = ({ skills }: SkillsBreakdownProps) => {
  const getIcon = (name: string) => {
    const n = name.toLowerCase();
    if (n.includes('code') || n.includes('react') || n.includes('js')) return <Code size={18} />;
    if (n.includes('data') || n.includes('sql')) return <Database size={18} />;
    if (n.includes('logic') || n.includes('math')) return <Brain size={18} />;
    return <Zap size={18} />;
  };

  const getColor = (score: number) => {
    if (score >= 80) return 'text-emerald-600 bg-emerald-50 bar-emerald-500';
    if (score >= 60) return 'text-sky-600 bg-sky-50 bar-sky-500';
    if (score >= 40) return 'text-amber-600 bg-amber-50 bar-amber-500';
    return 'text-rose-600 bg-rose-50 bar-rose-500';
  };

  return (
    <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h3 className="text-xl font-black text-slate-900 tracking-tight">Skill Matrix</h3>
          <p className="text-slate-500 text-xs font-medium mt-1">Topic-wise proficiency level</p>
        </div>
        <button className="p-2 text-slate-400 hover:text-sky-500 hover:bg-slate-50 rounded-xl transition-all">
          <ChevronRight size={20} />
        </button>
      </div>

      <div className="space-y-6">
        {skills.map((skill, index) => {
          const colorClasses = getColor(skill.score);
          const [textC, bgC, barC] = colorClasses.split(' ');
          
          return (
            <div key={skill.name} className="group cursor-default">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  <div className={clsx("p-2 rounded-xl border border-transparent transition-all group-hover:scale-110", bgC, textC)}>
                    {getIcon(skill.name)}
                  </div>
                  <span className="text-sm font-bold text-slate-700">{skill.name}</span>
                </div>
                <div className="text-right">
                  <span className={clsx("text-xs font-black", textC)}>{skill.score}%</span>
                </div>
              </div>
              
              <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden relative">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${skill.score}%` }}
                  transition={{ duration: 1, delay: index * 0.1, ease: "easeOut" }}
                  className={clsx("h-full rounded-full shadow-[0_0_8px_rgba(0,0,0,0.05)]", barC.replace('bar-', 'bg-'))}
                />
              </div>
              
              <div className="flex justify-between mt-1.5 px-0.5">
                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">
                  {skill.correctAnswers} / {skill.totalQuestions} Points
                </p>
                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">
                  {skill.score >= 80 ? 'Master' : skill.score >= 60 ? 'Advanced' : 'Learning'}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      <button className="w-full mt-8 py-3.5 bg-slate-50 text-slate-600 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-slate-100 hover:text-slate-900 transition-all border border-slate-200/50">
        Analyze All Skills
      </button>
    </div>
  );
};
