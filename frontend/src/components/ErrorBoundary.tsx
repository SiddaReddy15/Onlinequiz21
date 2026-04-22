import { Component, type ErrorInfo, type ReactNode } from 'react';
import { AlertTriangle, RefreshCcw, Home } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6">
          <div className="max-w-md w-full bg-white rounded-[2.5rem] shadow-2xl border border-slate-200 p-10 text-center space-y-6">
            <div className="w-20 h-20 bg-rose-50 rounded-full flex items-center justify-center mx-auto">
              <AlertTriangle className="text-rose-500" size={40} />
            </div>
            
            <div className="space-y-2">
              <h1 className="text-2xl font-black text-slate-900">Something went wrong</h1>
              <p className="text-slate-500 text-sm font-medium">
                We encountered an unexpected error while rendering this page.
              </p>
            </div>

            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 text-left overflow-hidden">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Error Details</p>
              <p className="text-xs font-mono text-rose-600 break-words line-clamp-3">
                {this.state.error?.message || 'Unknown runtime error'}
              </p>
            </div>

            <div className="flex flex-col gap-3">
              <button 
                onClick={() => window.location.reload()}
                className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black text-sm flex items-center justify-center gap-2 hover:bg-slate-800 transition-all"
              >
                <RefreshCcw size={18} /> Reload Portal
              </button>
              <button 
                onClick={() => window.location.href = '/'}
                className="w-full py-4 bg-white text-slate-600 border border-slate-200 rounded-2xl font-black text-sm flex items-center justify-center gap-2 hover:bg-slate-50 transition-all"
              >
                <Home size={18} /> Return Home
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
