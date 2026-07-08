'use client';

interface LoadingStateProps {
  isLoading: boolean;
  error?: string | null;
  success?: string | null;
  children: React.ReactNode;
  loadingText?: string;
}

export default function LoadingState({
  isLoading,
  error,
  success,
  children,
  loadingText = 'Processing...',
}: LoadingStateProps) {
  return (
    <div className="relative">
      {/* Loading Overlay */}
      {isLoading && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-gradient-to-br from-slate-900 to-slate-800 border border-white/10 rounded-2xl p-8 shadow-2xl">
            <div className="flex flex-col items-center gap-4">
              <div className="w-12 h-12 border-4 border-teal-400/20 border-t-teal-400 rounded-full animate-spin" />
              <p className="text-white font-medium">{loadingText}</p>
              <p className="text-xs text-white/50">Please wait...</p>
            </div>
          </div>
        </div>
      )}

      {/* Content */}
      <div className={isLoading ? 'opacity-50 pointer-events-none' : ''}>
        {children}
      </div>

      {/* Error Message */}
      {error && (
        <div className="fixed bottom-6 right-6 bg-red-500/90 border border-red-400/50 rounded-lg px-6 py-4 text-white text-sm max-w-md backdrop-blur-sm z-50 animate-slide-in">
          <div className="flex items-start gap-3">
            <span className="text-lg">❌</span>
            <div>
              <p className="font-medium">Error</p>
              <p className="text-red-100">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Success Message */}
      {success && (
        <div className="fixed bottom-6 right-6 bg-emerald-500/90 border border-emerald-400/50 rounded-lg px-6 py-4 text-white text-sm max-w-md backdrop-blur-sm z-50 animate-slide-in">
          <div className="flex items-start gap-3">
            <span className="text-lg">✅</span>
            <div>
              <p className="font-medium">Success</p>
              <p className="text-emerald-100">{success}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
