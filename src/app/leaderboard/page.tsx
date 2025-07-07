'use client';
import React, { useEffect, useState } from "react";
import { useRouter } from 'next/navigation';
import { supabase } from "@/lib/supabaseClient";

const tierColors: Record<string, string> = {
  Gold: "bg-yellow-500/20 border-yellow-400 text-yellow-300",
  Silver: "bg-slate-200/20 border-slate-300 text-slate-200",
  Bronze: "bg-yellow-900/30 border-yellow-700 text-yellow-400",
};

export default function Leaderboard() {
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [friends, setFriends] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  // For demo, assume current user id is available (replace with real auth logic)
  const currentUserId = "user-id-demo";

  useEffect(() => {
    const checkUser = async () => {
      const { data, error } = await supabase.auth.getUser();
      if (error || !data.user) {
        router.replace('/signin');
      }
    };
    checkUser();
  }, [router]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      // Fetch all profiles ordered by points desc
      const { data, error } = await supabase
        .from("profiles")
        .select("id, full_name, points")
        .order("points", { ascending: false });
      if (error) {
        setError("Failed to load leaderboard.");
        setLoading(false);
        return;
      }
      // Assign rank and tier
      const leaderboardData = (data || []).map((user: any, idx: number) => ({
        ...user,
        rank: idx + 1,
        tier: idx === 0 ? "Gold" : idx === 1 ? "Silver" : "Bronze",
      }));
      setLeaderboard(leaderboardData);
      // For demo, "friends" are users whose id is not the current user and whose rank is odd (mock logic)
      const friendsData = leaderboardData.filter(
        (u: any) => u.id !== currentUserId && u.rank % 2 === 1
      ).slice(0, 5);
      // Add current user to friends list if not present
      const currentUser = leaderboardData.find((u: any) => u.id === currentUserId);
      if (currentUser && !friendsData.some((f: any) => f.id === currentUserId)) {
        friendsData.push(currentUser);
      }
      setFriends(friendsData);
      setLoading(false);
    };
    fetchData();
  }, []);

  // Find current user info
  const currentUser = leaderboard.find((u) => u.id === currentUserId);
  const top20 = leaderboard.slice(0, 20);

  return (
    <div className="flex flex-col lg:flex-row gap-8 max-w-7xl mx-auto mt-24 px-4">
      {/* Main Leaderboard */}
      <div className="flex-1 p-8 bg-[#181e29] rounded-2xl shadow-lg border border-[#232a3a] min-w-0">
        <h1 className="text-5xl font-extrabold text-blue-200 mb-2 text-center">Leaderboard</h1>
        {loading ? (
          <div className="text-center text-lg text-gray-400 my-8">Loading...</div>
        ) : error ? (
          <div className="text-center text-lg text-red-400 my-8">{error}</div>
        ) : (
          <>
            <p className="text-center text-lg text-white mb-6">
              {currentUser ? (
                <>
                  You are in <span className="font-bold text-blue-400">{currentUser.rank}th place</span> with <span className="font-bold text-blue-400">{currentUser.points}</span> points.
                </>
              ) : (
                <>Sign in to see your rank!</>
              )}
            </p>
            <div className="flex justify-center gap-4 mb-6">
              <button className="px-4 py-2 rounded-lg font-semibold border border-yellow-400 bg-yellow-500/20 text-yellow-300">Gold</button>
              <button className="px-4 py-2 rounded-lg font-semibold border border-slate-300 bg-slate-200/20 text-slate-200">Silver</button>
              <button className="px-4 py-2 rounded-lg font-semibold border border-yellow-700 bg-yellow-900/30 text-yellow-400">Bronze</button>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full text-white text-lg">
                <thead>
                  <tr className="border-b border-[#232a3a]">
                    <th className="py-3 px-4 text-left">Rank</th>
                    <th className="py-3 px-4 text-left">Name</th>
                    <th className="py-3 px-4 text-left">Points</th>
                    <th className="py-3 px-4 text-left">Tier</th>
                  </tr>
                </thead>
                <tbody>
                  {top20.map((row) => (
                    <tr key={row.id} className="border-b border-[#232a3a]">
                      <td className="py-2 px-4">{row.rank}</td>
                      <td className="py-2 px-4">{row.full_name}</td>
                      <td className="py-2 px-4">{row.points}</td>
                      <td className="py-2 px-4">
                        <span className={`px-3 py-1 rounded-lg border font-semibold text-base ${tierColors[row.tier]}`}>{row.tier}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {leaderboard.length > 20 && (
                <div className="mt-4 text-center text-gray-400 text-sm">
                  Only the top 20 users are shown. Keep competing to make it onto the leaderboard!
                </div>
              )}
            </div>
          </>
        )}
      </div>
      {/* Friends Leaderboard */}
      <div className="w-full lg:w-80 flex-shrink-0 p-6 bg-[#181e29] rounded-2xl shadow-lg border border-[#232a3a] h-fit">
        <h2 className="text-2xl font-bold text-blue-200 mb-4 text-center">Friends Dashboard</h2>
        {loading ? (
          <div className="text-center text-lg text-gray-400 my-8">Loading...</div>
        ) : error ? (
          <div className="text-center text-lg text-red-400 my-8">{error}</div>
        ) : (
          <div className="max-h-80 overflow-y-auto">
            <ul className="flex flex-col gap-4">
              {friends
                .sort((a, b) => b.points - a.points)
                .map((friend, idx) => (
                  <li
                    key={friend.id}
                    className={`flex items-center gap-4 p-3 rounded-xl border border-[#232a3a] bg-[#232a3a]/30 ${friend.id === currentUserId ? 'ring-2 ring-blue-400' : ''}`}
                  >
                    <div className="w-10 h-10 flex items-center justify-center rounded-full bg-blue-900 text-blue-300 font-bold text-xl border border-blue-700">
                      {friend.full_name ? friend.full_name[0] : '?'}
                    </div>
                    <div className="flex-1">
                      <div className={`font-semibold ${friend.id === currentUserId ? 'text-blue-400' : 'text-white'}`}>{friend.full_name}</div>
                      <div className="text-sm text-gray-400">{friend.points} pts</div>
                    </div>
                    {idx === 0 && <span className="ml-2 px-2 py-1 rounded bg-yellow-500/20 text-yellow-300 text-xs font-bold border border-yellow-400">Top Friend</span>}
                    {friend.id === currentUserId && <span className="ml-2 px-2 py-1 rounded bg-blue-500/20 text-blue-300 text-xs font-bold border border-blue-400">You</span>}
                  </li>
                ))}
            </ul>
          </div>
        )}
        <div className="mt-6 text-center text-sm text-gray-400">Compare your progress with your friends!</div>
        <button className="mt-4 w-full py-2 rounded-lg bg-gradient-to-r from-blue-500 to-violet-500 text-white font-semibold shadow hover:from-blue-600 hover:to-violet-600 transition">Add Friends</button>
      </div>
    </div>
  );
} 