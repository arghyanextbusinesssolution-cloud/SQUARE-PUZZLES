import { Clock, TrendingUp, Users } from 'lucide-react';

export function DailyStatsCard() {
    return (
        <div className="bg-gradient-to-br from-emerald-900/40 to-teal-900/40 backdrop-blur-md p-5 rounded-2xl border border-emerald-500/20 shadow-xl relative overflow-hidden group hover:border-emerald-500/40 transition-all duration-300">
            {/* Background glow effect */}
            <div className="absolute -right-10 -top-10 w-32 h-32 bg-emerald-500/20 rounded-full blur-3xl group-hover:bg-emerald-500/30 transition-all"></div>

            <div className="relative z-10">
                <div className="flex items-start justify-between mb-6">
                    <div>
                        <div className="text-emerald-400 text-xs font-bold uppercase tracking-wider mb-1">
                            Today's Challenge
                        </div>
                        <h2 className="text-2xl font-bold text-white">Daily Puzzle #428</h2>
                    </div>
                    <div className="bg-emerald-500/20 text-emerald-300 px-3 py-1 rounded-full text-xs font-bold border border-emerald-500/30">
                        MEDIUM
                    </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                    <div className="text-center">
                        <div className="flex flex-col items-center gap-1 mb-1 text-gray-400">
                            <Users size={16} />
                            <span className="text-[10px] uppercase tracking-wide">Solvers</span>
                        </div>
                        <div className="text-lg font-bold text-white">14.2k</div>
                    </div>

                    <div className="text-center border-l border-white/5">
                        <div className="flex flex-col items-center gap-1 mb-1 text-gray-400">
                            <Clock size={16} />
                            <span className="text-[10px] uppercase tracking-wide">Avg Time</span>
                        </div>
                        <div className="text-lg font-bold text-white">4:12</div>
                    </div>

                    <div className="text-center border-l border-white/5">
                        <div className="flex flex-col items-center gap-1 mb-1 text-gray-400">
                            <TrendingUp size={16} />
                            <span className="text-[10px] uppercase tracking-wide">Win Rate</span>
                        </div>
                        <div className="text-lg font-bold text-emerald-400">89%</div>
                    </div>
                </div>
            </div>

            {/* Progress bar visual */}
            <div className="mt-6">
                <div className="flex justify-between text-xs text-gray-500 mb-2">
                    <span>Global Progress</span>
                    <span>82% Solved</span>
                </div>
                <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 w-[82%] rounded-full shadow-[0_0_10px_rgba(16,185,129,0.5)]"></div>
                </div>
            </div>
        </div>
    );
}
