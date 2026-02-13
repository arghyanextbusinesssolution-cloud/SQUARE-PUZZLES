import { Trophy, Medal, User } from 'lucide-react';

const TOP_PLAYERS = [
    { name: 'WordMaster99', score: 2450, avatar: '👑' },
    { name: 'PuzzleQueen', score: 2380, avatar: '⭐' },
    { name: 'LexiconLad', score: 2100, avatar: '🤓' },
];

export function LeaderboardPreview() {
    return (
        <div className="glass-card p-4 rounded-xl border border-white/10 w-full max-w-sm transform hover:scale-105 transition-all duration-300">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-white font-bold flex items-center gap-2">
                    <Trophy className="w-5 h-5 text-yellow-400" />
                    <span className="bg-clip-text text-transparent bg-gradient-to-r from-yellow-400 to-orange-500">
                        Top Solvers
                    </span>
                </h3>
                <span className="text-xs text-gray-400 bg-white/5 px-2 py-1 rounded-full">
                    Today
                </span>
            </div>

            <div className="space-y-3">
                {TOP_PLAYERS.map((player, index) => (
                    <div key={index} className="flex items-center gap-3 bg-white/5 p-2 rounded-lg border border-white/5 hover:bg-white/10 transition-colors">
                        <div className="w-8 h-8 rounded-full bg-indigo-500/20 flex items-center justify-center border border-indigo-500/30 text-lg">
                            {player.avatar}
                        </div>
                        <div className="flex-1">
                            <div className="text-sm font-semibold text-gray-200">{player.name}</div>
                            <div className="text-xs text-indigo-300">{player.score} pts</div>
                        </div>
                        <div className="flex items-center gap-1">
                            {index === 0 && <Medal className="w-4 h-4 text-yellow-500" />}
                            {index === 1 && <Medal className="w-4 h-4 text-gray-400" />}
                            {index === 2 && <Medal className="w-4 h-4 text-orange-700" />}
                            <span className="text-xs font-mono font-bold text-gray-500">#{index + 1}</span>
                        </div>
                    </div>
                ))}
            </div>

            <div className="mt-4 text-center">
                <button className="text-xs text-gray-400 hover:text-white transition-colors hover:underline">
                    View Full Leaderboard
                </button>
            </div>
        </div>
    );
}
