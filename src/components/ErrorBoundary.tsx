import { Component, type ErrorInfo, type ReactNode } from 'react';
import { AlertTriangle, RotateCcw, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error in Workshop Flow:', error, errorInfo);
  }

  private handleResetStorage = () => {
    try {
      localStorage.removeItem('barefoot-native-store-v4');
    } catch {
      // Ignore storage errors
    }
    window.location.reload();
  };

  private handleReload = () => {
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#0b0f19] text-[#f1f5f9] flex items-center justify-center p-6 select-none font-sans">
          <div className="w-full max-w-sm rounded-3xl bg-[#131b2e] border border-white/10 p-6 shadow-2xl text-center space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-red-500/15 border border-red-500/30 text-red-400 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-7 h-7" />
            </div>

            <div className="space-y-1.5">
              <h2 className="font-display text-xl font-bold tracking-tight">
                Engine Safeguard Activated
              </h2>
              <p className="text-xs text-[#94a3b8] leading-relaxed">
                An unexpected state occurred. The app protected your core financial records and paused rendering.
              </p>
            </div>

            {this.state.error && (
              <div className="p-3 rounded-xl bg-black/40 border border-white/5 text-[11px] font-mono text-left text-red-300 max-h-24 overflow-y-auto">
                {this.state.error.message || 'Unknown runtime error'}
              </div>
            )}

            <div className="space-y-2 pt-2">
              <button
                type="button"
                onClick={this.handleReload}
                className="w-full py-3 rounded-xl bg-[#ff5a36] hover:bg-[#e04825] active:scale-98 text-white font-display font-bold text-xs flex items-center justify-center gap-2 shadow-ember cursor-pointer"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Reload Workshop</span>
              </button>

              <button
                type="button"
                onClick={this.handleResetStorage}
                className="w-full py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-[#94a3b8] hover:text-white text-xs font-mono font-medium flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset Corrupt Cache & Restart</span>
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
