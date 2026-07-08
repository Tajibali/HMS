"use client";

import Link from "next/link";

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Space+Grotesk:wght@700&display=swap');

  .nf-body { font-family: 'Inter', sans-serif; }
  .nf-display { font-family: 'Space Grotesk', sans-serif; }

  @keyframes nf-float {
    0%, 100% { transform: translateY(0px); }
    50% { transform: translateY(-12px); }
  }
  @keyframes nf-fade-in {
    from { opacity: 0; transform: translateY(20px); }
    to   { opacity: 1; transform: translateY(0); }
  }

  .nf-float       { animation: nf-float 4s ease-in-out infinite; }
  .nf-fade-in     { animation: nf-fade-in 0.6s ease-out forwards; }
  .nf-fade-delay  { animation: nf-fade-in 0.6s ease-out 0.2s both; }
  .nf-fade-delay2 { animation: nf-fade-in 0.6s ease-out 0.4s both; }
`;

export default function NotFound() {
    return (
        <>
            <style>{styles}</style>

            <div className="nf-body min-h-screen bg-slate-950 text-white flex items-center justify-center px-6 relative overflow-hidden">

                {/* Background grid */}
                <div
                    className="absolute inset-0 pointer-events-none"
                    style={{
                        backgroundImage:
                            "linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)",
                        backgroundSize: "64px 64px",
                    }}
                />

                {/* Glow */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-violet-600/10 rounded-full blur-3xl pointer-events-none" />

                <main className="relative z-10 text-center max-w-lg mx-auto">

                    {/* 404 */}
                    <div className="nf-float nf-fade-in mb-6">
                        <span
                            className="nf-display text-[9rem] font-bold leading-none tracking-tight select-none"
                            style={{
                                WebkitBackgroundClip: "text",
                                WebkitTextFillColor: "transparent",
                                backgroundImage: "linear-gradient(to bottom, #ffffff, rgba(255,255,255,0.2))",
                                backgroundClip: "text",
                            }}
                        >
                            404
                        </span>
                    </div>

                    {/* Divider */}
                    <div className="nf-fade-delay flex items-center gap-3 mb-8">
                        <div className="flex-1 h-px bg-gradient-to-r from-transparent to-white/20" />
                        <div className="w-1.5 h-1.5 rounded-full bg-violet-400" />
                        <div className="flex-1 h-px bg-gradient-to-l from-transparent to-white/20" />
                    </div>

                    {/* Heading + description */}
                    <div className="nf-fade-delay mb-10">
                        <h1 className="text-2xl font-semibold text-white mb-3">Page not found</h1>
                        <p className="text-slate-400 leading-relaxed">
                            The page you&apos;re looking for has been moved, deleted, or never existed.
                            Let&apos;s get you somewhere useful.
                        </p>
                    </div>

                    {/* Buttons */}
                    <div className="nf-fade-delay2 flex flex-col sm:flex-row items-center justify-center gap-3">
                        <Link
                            href="/"
                            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-violet-600 hover:bg-violet-500 text-white text-sm font-medium transition-colors duration-150"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"
                                fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                                <polyline points="9 22 9 12 15 12 15 22" />
                            </svg>
                            Go home
                        </Link>

                        <Link
                            href="javascript:history.back()"
                            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg border border-white/10 hover:border-white/20 hover:bg-white/5 text-slate-300 text-sm font-medium transition-colors duration-150"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"
                                fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="m12 19-7-7 7-7" />
                                <path d="M19 12H5" />
                            </svg>
                            Go back
                        </Link>
                    </div>

                    {/* Footer */}
                    <p className="nf-fade-delay2 mt-12 text-xs text-slate-600">
                        Error 404 &nbsp;·&nbsp; If you think this is a mistake,{" "}
                        <a
                            href="mailto:support@example.com"
                            className="text-slate-400 hover:text-white underline underline-offset-2 transition-colors"
                        >
                            contact support
                        </a>
                        .
                    </p>

                </main>
            </div>
        </>
    );
}