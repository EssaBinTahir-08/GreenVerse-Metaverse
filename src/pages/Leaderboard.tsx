import { Award, TrendingUp, Trophy, Medal, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";

const Leaderboard = () => {
    const [leaderboardData, setLeaderboardData] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [userRank, setUserRank] = useState<any>(null);

    useEffect(() => {
        const fetchLeaderboard = async () => {
            try {
                const response = await fetch("http://localhost:5001/api/nfts/leaderboard");
                if (response.ok) {
                    const data = await response.json();

                    // Identify current user
                    const userStr = localStorage.getItem("user");
                    if (userStr) {
                        const currentUser = JSON.parse(userStr);
                        const currentId = currentUser.user ? currentUser.user.id : currentUser.id;

                        // Map the data to add 'current' flag
                        const mappedData = data.map((u: any) => {
                            if (u.id === currentId) {
                                u.current = true;
                                setUserRank(u);
                            }
                            return u;
                        });
                        setLeaderboardData(mappedData);
                    } else {
                        setLeaderboardData(data);
                    }
                }
            } catch (error) {
                console.error("Failed to fetch leaderboard", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchLeaderboard();
    }, []);

    const topEarner = leaderboardData.length > 0 ? leaderboardData[0] : null;

    const getRankIcon = (rank: number) => {
        switch (rank) {
            case 1: return <Trophy className="w-6 h-6 text-yellow-400" />;
            case 2: return <Medal className="w-6 h-6 text-slate-300" />;
            case 3: return <Medal className="w-6 h-6 text-amber-700" />;
            default: return <span className="font-bold text-lg text-muted-foreground w-6 text-center">{rank}</span>;
        }
    };

    return (
        <div className="min-h-screen py-10 relative z-10 w-full max-w-5xl mx-auto px-6">

            <div className="mb-12 text-center">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-primary/30 bg-primary/10 text-primary font-medium text-sm mb-4 shadow-[var(--shadow-glow)]">
                    <Award className="w-4 h-4" />
                    <span>Global Rankings</span>
                </div>
                <h1 className="text-4xl md:text-5xl font-heading font-bold mb-4 gradient-text">
                    Sustainability Leaderboard
                </h1>
                <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                    See how your environmental impact compares to the rest of the GreenVerse community. Climb the ranks by minting more NFTs.
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
                <div className="glass-card p-8 flex flex-col items-center justify-center text-center">
                    <Trophy className="w-12 h-12 text-yellow-500 mb-4 animate-glow" />
                    <h3 className="text-xl font-bold text-foreground">Top Earner</h3>
                    {isLoading ? (
                        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground mt-4" />
                    ) : topEarner ? (
                        <>
                            <p className="text-3xl font-extrabold gradient-text mt-2">{topEarner.name}</p>
                            <p className="text-muted-foreground mt-1">{topEarner.score.toLocaleString()} Eco-Score</p>
                        </>
                    ) : (
                        <p className="text-muted-foreground mt-2">No data yet</p>
                    )}
                </div>

                <div className="glass-card p-8 flex flex-col items-center justify-center text-center lg:col-span-2 relative overflow-hidden">
                    <div className="absolute inset-0 bg-primary/5"></div>
                    <TrendingUp className="w-10 h-10 text-primary mb-4 relative z-10" />
                    <h3 className="text-xl font-bold text-foreground relative z-10">Your Standing</h3>
                    {isLoading ? (
                        <Loader2 className="w-6 h-6 animate-spin text-primary mt-4 relative z-10" />
                    ) : userRank ? (
                        <>
                            <p className="text-4xl font-extrabold text-foreground mt-2 relative z-10">Rank #{userRank.rank}</p>
                            <p className="text-success font-medium mt-1 relative z-10 text-lg">Active in the Top {Math.max(1, Math.round((userRank.rank / leaderboardData.length) * 100))}%!</p>
                        </>
                    ) : (
                        <>
                            <p className="text-2xl font-bold text-muted-foreground mt-2 relative z-10">Unranked</p>
                            <p className="text-muted-foreground mt-1 relative z-10 text-lg">Mint an NFT to join the leaderboard!</p>
                        </>
                    )}
                </div>
            </div>

            <div className="glass-card overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-white/10 bg-black/40 text-muted-foreground text-sm uppercase tracking-wider">
                                <th className="p-6 font-semibold w-24 text-center">Rank</th>
                                <th className="p-6 font-semibold">Eco-Citizen</th>
                                <th className="p-6 font-semibold text-right">NFT Trees</th>
                                <th className="p-6 font-semibold text-right">Eco-Score</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {isLoading ? (
                                <tr>
                                    <td colSpan={4} className="p-12 text-center text-muted-foreground">
                                        <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-primary" />
                                        Loading global rankings...
                                    </td>
                                </tr>
                            ) : leaderboardData.length > 0 ? (
                                leaderboardData.map((user, idx) => (
                                    <tr
                                        key={user.rank}
                                        className={`hover:bg-white/5 transition-colors ${user.current ? 'bg-primary/20 border-l-4 border-l-primary' : ''}`}
                                    >
                                        <td className="p-6 text-center flex justify-center items-center">
                                            {getRankIcon(user.rank)}
                                        </td>
                                        <td className="p-6">
                                            <span className={`font-bold text-lg ${user.current ? 'text-primary' : 'text-foreground'}`}>
                                                {user.name}
                                            </span>
                                            {user.current && <span className="ml-3 px-2 py-0.5 rounded text-[10px] uppercase font-bold bg-primary text-primary-foreground">You</span>}
                                        </td>
                                        <td className="p-6 text-right font-medium text-muted-foreground">
                                            {user.trees} 🌲
                                        </td>
                                        <td className="p-6 text-right font-extrabold text-xl text-success">
                                            {user.score.toLocaleString()}
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={4} className="p-12 text-center text-muted-foreground">
                                        No ranking data available yet. Be the first to mint a tree!
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

        </div>
    );
};

export default Leaderboard;
