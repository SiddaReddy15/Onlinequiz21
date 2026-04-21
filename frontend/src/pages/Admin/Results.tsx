import { useEffect, useState } from 'react';
import api from '../../services/api';
import { 
  BarChart3, 
  Search, 
  Download, 
  ArrowUpRight, 
  PieChart as PieIcon, 
  TrendingUp,
  Trophy,
  Filter,
  CheckCircle2,
  Clock,
  ChevronDown,
  X
} from 'lucide-react';
import { format, differenceInMinutes } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  PieChart, 
  Pie, 
  Cell 
} from 'recharts';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { toast } from 'react-hot-toast';

const AdminResults = () => {
  const [results, setResults] = useState<any[]>([]);
  const [analytics, setAnalytics] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [view, setView] = useState<'all' | 'leaderboard'>('all');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [resultsRes, analyticsRes] = await Promise.all([
          api.get('/admin/results'),
          api.get('/admin/analytics')
        ]);
        setResults(resultsRes.data);
        setAnalytics(analyticsRes.data);
      } catch (error) {
        console.error('Failed to fetch data');
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleExportPDF = () => {
    if (results.length === 0) return toast.error('No results to export');

    const doc = new jsPDF();
    const tableColumn = ["Student", "Assessment", "Score", "Completion Time", "Status"];
    const tableRows: any[] = [];

    results.forEach(res => {
      const resultData = [
        res.studentName,
        res.examTitle,
        `${res.score}%`,
        format(new Date(res.submittedAt), 'MMM dd, HH:mm'),
        res.score >= 50 ? 'Qualified' : 'Failed'
      ];
      tableRows.push(resultData);
    });

    // Add header
    doc.setFontSize(20);
    doc.text("Assessment Performance Report", 14, 22);
    doc.setFontSize(11);
    doc.setTextColor(100);
    doc.text(`Generated on: ${format(new Date(), 'PPP p')}`, 14, 30);
    doc.text(`Total Submissions: ${results.length}`, 14, 35);
    
    // Add table
    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 45,
      theme: 'grid',
      headStyles: { fillColor: [14, 165, 233], textColor: [255, 255, 255], fontStyle: 'bold' },
      styles: { fontSize: 9 },
      alternateRowStyles: { fillColor: [248, 250, 252] }
    });

    doc.save(`ExamPro_Report_${format(new Date(), 'yyyy-MM-dd')}.pdf`);
    toast.success('Report downloaded successfully');
  };

  const sortedResults = [...results].sort((a, b) => {
    // 1. Higher score first
    if (b.score !== a.score) return b.score - a.score;
    
    // 2. Faster submission time (if available)
    // For this demo, we'll assume earlier submittedAt means earlier start or faster completion
    // if both have same score, we look at the date
    return new Date(a.submittedAt).getTime() - new Date(b.submittedAt).getTime();
  });

  const filteredResults = (view === 'leaderboard' ? sortedResults : results).filter(r => 
    r.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.examTitle.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const COLORS = ['#0ea5e9', '#6366f1', '#10b981', '#f43f5e'];
  
  const scoreData = [
    { name: '90%+', value: results.filter(r => r.score >= 90).length },
    { name: '70-89%', value: results.filter(r => r.score >= 70 && r.score < 90).length },
    { name: '50-69%', value: results.filter(r => r.score >= 50 && r.score < 70).length },
    { name: '< 50%', value: results.filter(r => r.score < 50).length },
  ].filter(d => d.value > 0);

  return (
    <div className="space-y-8 pb-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="heading-xl">Results & Analytics</h1>
          <p className="text-muted mt-1">Deep dive into student performance and assessment efficacy.</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={handleExportPDF}
            className="btn-premium-secondary"
          >
            <Download size={18} /> Export Report
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="card-premium p-8 lg:col-span-1">
          <h3 className="heading-lg mb-6 flex items-center gap-2">
            <PieIcon size={20} className="text-sky-500" /> Score Distribution
          </h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={scoreData.length > 0 ? scoreData : [{name: 'No Data', value: 1}]}
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {scoreData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                  {scoreData.length === 0 && <Cell fill="#f1f5f9" />}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 space-y-2">
            {scoreData.map((d, i) => (
              <div key={i} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2 text-slate-600">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[i] }} />
                  {d.name}
                </div>
                <span className="font-bold text-slate-900">{d.value}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="card-premium p-8 lg:col-span-2">
          <h3 className="heading-lg mb-6 flex items-center gap-2">
            <TrendingUp size={20} className="text-sky-500" /> Accuracy Analysis
          </h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={analytics?.accuracyData?.length > 0 ? analytics.accuracyData : [
                { name: 'No Data', acc: 0 },
              ]}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 12}} />
                <YAxis axisLine={false} tickLine={false} tick={{fontSize: 12}} />
                <Tooltip />
                <Bar dataKey="acc" fill="#0ea5e9" radius={[4, 4, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="card-premium overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2 p-1 bg-slate-50 rounded-xl">
            <button 
              onClick={() => setView('all')}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                view === 'all' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-500'
              }`}
            >
              All Results
            </button>
            <button 
              onClick={() => setView('leaderboard')}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                view === 'leaderboard' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-500'
              }`}
            >
              <Trophy size={14} className={view === 'leaderboard' ? 'text-amber-500' : ''} />
              Leaderboard
            </button>
          </div>

          <div className="relative flex-1 max-w-xs">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input 
              type="text" 
              placeholder="Search candidate..." 
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white focus:border-sky-500 transition-all text-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50">
                <th className="p-4 px-8 text-xs font-bold text-slate-500 uppercase tracking-widest border-b border-slate-100">
                  {view === 'leaderboard' ? 'Rank' : 'Student'}
                </th>
                <th className="p-4 px-8 text-xs font-bold text-slate-500 uppercase tracking-widest border-b border-slate-100">Assessment</th>
                <th className="p-4 px-8 text-xs font-bold text-slate-500 uppercase tracking-widest border-b border-slate-100">Score</th>
                <th className="p-4 px-8 text-xs font-bold text-slate-500 uppercase tracking-widest border-b border-slate-100">Completion Time</th>
                <th className="p-4 px-8 text-xs font-bold text-slate-500 uppercase tracking-widest border-b border-slate-100">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredResults.map((res, idx) => (
                <tr key={res.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="p-4 px-8">
                    <div className="flex items-center gap-4">
                      {view === 'leaderboard' && (
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm ${
                          idx === 0 ? 'bg-amber-100 text-amber-600' : idx === 1 ? 'bg-slate-200 text-slate-600' : idx === 2 ? 'bg-orange-100 text-orange-600' : 'text-slate-400'
                        }`}>
                          {idx + 1}
                        </div>
                      )}
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-sky-50 text-sky-600 rounded-full flex items-center justify-center font-bold text-xs">
                          {res.studentName.charAt(0)}
                        </div>
                        <span className="font-semibold text-slate-900">{res.studentName}</span>
                      </div>
                    </div>
                  </td>
                  <td className="p-4 px-8 text-slate-600 font-medium">{res.examTitle}</td>
                  <td className="p-4 px-8">
                    <div className="flex items-center gap-2">
                      <span className="text-lg font-bold text-slate-900">{res.score}%</span>
                      <div className="w-16 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div 
                          className={`h-full rounded-full ${res.score >= 50 ? 'bg-emerald-500' : 'bg-red-500'}`} 
                          style={{ width: `${res.score}%` }}
                        />
                      </div>
                    </div>
                  </td>
                  <td className="p-4 px-8 text-slate-500 text-sm">
                    <div className="flex items-center gap-2">
                      <Clock size={14} />
                      {format(new Date(res.submittedAt), 'MMM dd, HH:mm')}
                    </div>
                  </td>
                  <td className="p-4 px-8">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                      res.score >= 50 ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'
                    }`}>
                      {res.score >= 50 ? <CheckCircle2 size={12} /> : <X size={12} />}
                      {res.score >= 50 ? 'Qualified' : 'Failed'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminResults;
