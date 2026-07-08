"use client";

const styles = `
  @keyframes ld-spin {
    to { transform: rotate(360deg); }
  }
  @keyframes ld-pulse {
    0%, 100% { opacity: 1; transform: scale(1); }
    50% { opacity: 0.4; transform: scale(0.8); }
  }
  @keyframes ld-fade-in {
    from { opacity: 0; transform: translateY(10px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes ld-bar {
    0%   { left: -40%; width: 40%; }
    50%  { left: 30%;  width: 60%; }
    100% { left: 110%; width: 40%; }
  }

  .ld-spin     { animation: ld-spin 1s linear infinite; }
  .ld-fade-in  { animation: ld-fade-in 0.5s ease-out forwards; }
  .ld-dot-1    { animation: ld-pulse 1.2s ease-in-out 0s infinite; }
  .ld-dot-2    { animation: ld-pulse 1.2s ease-in-out 0.2s infinite; }
  .ld-dot-3    { animation: ld-pulse 1.2s ease-in-out 0.4s infinite; }

  .ld-bar-inner {
    position: absolute;
    height: 100%;
    background: linear-gradient(90deg, transparent, #7c3aed, #a78bfa, transparent);
    border-radius: 9999px;
    animation: ld-bar 1.6s ease-in-out infinite;
  }
`;

export default function Loading() {
    return (
        <>
            <style>{styles}</style>

            <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center px-6 relative overflow-hidden">

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
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-violet-600/10 rounded-full blur-3xl pointer-events-none" />

                <main className="relative z-10 flex flex-col items-center gap-10 ld-fade-in">

                    {/* Spinner ring */}
                    <div className="relative w-20 h-20">
                        <div className="absolute inset-0 rounded-full border-2 border-white/5" />
                        <div
                            className="ld-spin absolute inset-0 rounded-full border-2 border-transparent"
                            style={{ borderTopColor: "#7c3aed", borderRightColor: "#a78bfa" }}
                        />
                        <div className="absolute inset-0 flex items-center justify-center">
                            <div className="ld-dot-1 w-2 h-2 rounded-full bg-violet-400" />
                        </div>
                    </div>

                    {/* Text + dots */}
                    <div className="flex flex-col items-center gap-4">
                        <p className="text-slate-300 text-sm font-medium tracking-widest uppercase">
                            Loading
                        </p>
                        <div className="flex items-center gap-2">
                            <div className="ld-dot-1 w-1.5 h-1.5 rounded-full bg-violet-500" />
                            <div className="ld-dot-2 w-1.5 h-1.5 rounded-full bg-violet-400" />
                            <div className="ld-dot-3 w-1.5 h-1.5 rounded-full bg-violet-300" />
                        </div>
                    </div>

                    {/* Progress bar */}
                    <div className="w-48 h-0.5 bg-white/5 rounded-full relative overflow-hidden">
                        <div className="ld-bar-inner" style={{ width: "40%" }} />
                    </div>

                </main>
            </div>
        </>
    );
}