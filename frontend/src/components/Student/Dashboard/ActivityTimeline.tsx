import { format } from 'date-fns';
import { Layout, Award, Target, ChevronRight, CheckCircle2 } from 'lucide-react';
import { clsx } from 'clsx';

interface Activity {
  id: string;
  type: 'exam' | 'badge' | 'milestone';
  title: string;
  timestamp: string;
  score?: number;
}

interface ActivityTimelineProps {
  activities: Activity[];
}

export const ActivityTimeline = ({ activities }: ActivityTimelineProps) => {
  return (
    <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm flex flex-col h-full">
      <div className="flex items-center justify-between mb-8">
        <h3 className="text-xl font-black text-slate-900 tracking-tight">Recent Journey</h3>
        <button className="p-2 text-slate-400 hover:text-sky-500 transition-colors">
          <ChevronRight size={20} />
        </button>
      </div>

      <div className="flex-1 space-y-8 relative">
        {/* Timeline Line */}
        <div className="absolute left-[19px] top-2 bottom-2 w-0.5 bg-slate-100" />

        {activities.map((activity) => (
          <div key={activity.id} className="relative pl-12">
            {/* Timeline Dot */}
            <div className={clsx(
              "absolute left-0 top-1 w-10 h-10 rounded-2xl flex items-center justify-center border-4 border-white shadow-sm z-10",
              activity.type === 'exam' && "bg-sky-50 text-sky-600",
              activity.type === 'badge' && "bg-amber-50 text-amber-600",
              activity.type === 'milestone' && "bg-emerald-50 text-emerald-600",
            )}>
              {activity.type === 'exam' && <Layout size={16} />}
              {activity.type === 'badge' && <Award size={16} />}
              {activity.type === 'milestone' && <Target size={16} />}
            </div>

            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1.5">
                {format(new Date(activity.timestamp), 'MMM dd, yyyy')}
              </p>
              <h4 className="text-sm font-bold text-slate-900 leading-tight">
                {activity.title}
              </h4>
              {activity.score !== undefined && (
                <div className="flex items-center gap-2 mt-1.5">
                  <div className="h-1 w-24 bg-slate-100 rounded-full overflow-hidden">
                    <div 
                      className={clsx("h-full rounded-full", activity.score >= 70 ? "bg-emerald-500" : "bg-sky-500")}
                      style={{ width: `${activity.score}%` }}
                    />
                  </div>
                  <span className="text-[10px] font-black text-slate-600">{activity.score}%</span>
                  {activity.score >= 70 && <CheckCircle2 size={12} className="text-emerald-500" />}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      <button className="w-full mt-8 py-3.5 bg-slate-50 text-slate-600 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-slate-100 hover:text-slate-900 transition-all border border-slate-200/50">
        View Full History
      </button>
    </div>
  );
};
