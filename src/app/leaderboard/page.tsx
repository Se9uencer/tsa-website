'use client';
import React, { useEffect, useState } from "react";
import { useRouter } from 'next/navigation';
import { supabase } from "@/lib/supabaseClient";

const tierColors: Record<string, string> = {
  Gold: "bg-yellow-500/20 border-yellow-400 text-yellow-300",
  Silver: "bg-slate-200/20 border-slate-300 text-slate-200",
  Bronze: "bg-yellow-900/30 border-yellow-700 text-yellow-400",
};

function UserPopup({ user, onClose }: { user: any, onClose: () => void }) {
  if (!user) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 animate-fade-in">
      <div className="bg-[#181e29] rounded-2xl shadow-2xl border border-[#232a3a] p-8 w-full max-w-md relative">
        <button
          className="absolute top-4 right-4 text-gray-400 hover:text-white text-2xl font-bold focus:outline-none"
          onClick={onClose}
          aria-label="Close"
        >
          &times;
        </button>
        <div className="flex flex-col items-center gap-4">
          <div className="w-20 h-20 rounded-full bg-blue-900 text-blue-300 font-bold text-3xl flex items-center justify-center border border-blue-700">
            {user.full_name ? user.full_name[0] : '?'}
          </div>
          <div className="text-2xl font-bold text-white">{user.full_name || 'Unknown'}</div>
          <div className="text-lg text-gray-300">{user.points ?? 0} points</div>
          <div className="text-lg font-semibold">
            <span className={`px-3 py-1 rounded-lg border font-semibold text-base ${tierColors[user.tier]}`}>{user.tier}</span>
          </div>
          <div className="w-full mt-4">
            <div className="text-lg font-bold text-blue-200 mb-2">Events Competing In</div>
            {Array.isArray(user.events) && user.events.length > 0 ? (
              <ul className="list-disc list-inside text-white">
                {user.events.map((event: any, idx: number) => (
                  <li key={idx}>{typeof event === 'string' ? event : event.name || JSON.stringify(event)}</li>
                ))}
              </ul>
            ) : (
              <div className="text-gray-400 italic">No events listed.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function AddFriendPopup({ allUsers, onClose, onAdd }: { allUsers: any[], onClose: () => void, onAdd: (userId: string) => void }) {
  const [search, setSearch] = useState("");
  const filteredUsers = allUsers.filter((u) => u.full_name?.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 animate-fade-in">
      <div className="bg-[#181e29] rounded-2xl shadow-2xl border border-[#232a3a] p-6 w-full max-w-lg relative">
        <button
          className="absolute top-4 right-4 text-gray-400 hover:text-white text-2xl font-bold focus:outline-none"
          onClick={onClose}
          aria-label="Close"
        >
          &times;
        </button>
        <h2 className="text-xl font-bold text-white mb-4 text-center">Add Friends</h2>
        <input
          type="text"
          placeholder="Search users..."
          className="w-full px-4 py-2 mb-4 rounded-lg bg-[#232a3a] text-white border border-[#2e3a4e]"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <div className="max-h-64 overflow-y-auto">
          {filteredUsers.map((user) => (
            <div key={user.id} className="flex justify-between items-center p-2 hover:bg-[#2a3245] rounded">
              <span className="text-white">{user.full_name}</span>
              <button
                onClick={() => onAdd(user.id)}
                className="px-3 py-1 rounded bg-blue-600 text-white hover:bg-blue-700 text-sm"
              >
                Add
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function Leaderboard() {
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [friends, setFriends] = useState<any[]>([]);
  const [allUsers, setAllUsers] = useState<any[]>([]);
  const [showAddPopup, setShowAddPopup] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [selectedUser, setSelectedUser] = useState<any | null>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchUser = async () => {
      const { data, error } = await supabase.auth.getUser();
      if (error || !data.user) {
        router.replace('/signin');
      } else {
        setCurrentUserId(data.user.id);
      }
    };
    fetchUser();
  }, [router]);

  useEffect(() => {
    if (!currentUserId) return;
    const fetchData = async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("id, full_name, points, events")
        .order("points", { ascending: false });

      if (!data || error) return;

      const leaderboardData = data.map((user: any, idx: number) => ({
        ...user,
        rank: idx + 1,
        tier: idx === 0 ? "Gold" : idx === 1 ? "Silver" : "Bronze",
      }));

      setLeaderboard(leaderboardData);
      setAllUsers(leaderboardData);

      const currentUser = leaderboardData.find((u) => u.id === currentUserId);
      const friendsData = leaderboardData.filter((u) => u.id !== currentUserId).slice(0, 5);
      if (currentUser && !friendsData.some((f) => f.id === currentUserId)) friendsData.push(currentUser);
      setFriends(friendsData);
    };
    fetchData();
  }, [currentUserId]);

  const handleAddFriend = (userId: string) => {
    const userToAdd = allUsers.find((u) => u.id === userId);
    if (userToAdd && !friends.find((f) => f.id === userId)) {
      setFriends((prev) => [...prev, userToAdd]);
    }
    setShowAddPopup(false);
  };

  const currentUser = leaderboard.find((u) => u.id === currentUserId);
  const top20 = leaderboard;

  return (
    <div className="flex flex-col lg:flex-row gap-8 max-w-7xl mx-auto mt-24 px-4">
      {selectedUser && <UserPopup user={selectedUser} onClose={() => setSelectedUser(null)} />}
      {showAddPopup && <AddFriendPopup allUsers={allUsers} onClose={() => setShowAddPopup(false)} onAdd={handleAddFriend} />}

      <div className="flex-1 p-8 bg-[#181e29] rounded-2xl shadow-lg border border-[#232a3a]">
        <h1 className="text-5xl font-extrabold text-blue-200 mb-2 text-center">Leaderboard</h1>
        <div className="overflow-x-auto max-h-[500px] overflow-y-auto">
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
                  <td className="py-2 px-4">
                    <button className="text-blue-400 hover:underline" onClick={() => setSelectedUser(row)}>{row.full_name || 'Unknown'}</button>
                  </td>
                  <td className="py-2 px-4">{row.points ?? 0}</td>
                  <td className="py-2 px-4">
                    <span className={`px-3 py-1 rounded-lg border font-semibold text-base ${tierColors[row.tier]}`}>{row.tier}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="w-full lg:w-80 flex-shrink-0 p-6 bg-[#181e29] rounded-2xl shadow-lg border border-[#232a3a] h-fit">
        <h2 className="text-2xl font-bold text-blue-200 mb-4 text-center">Friends Dashboard</h2>
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
                    <div className={`font-semibold ${friend.id === currentUserId ? 'text-blue-400' : 'text-white'}`}>{friend.full_name || 'Unknown'}</div>
                    <div className="text-sm text-gray-400">{friend.points ?? 0} pts</div>
                  </div>
                  {idx === 0 && <span className="ml-2 px-2 py-1 rounded bg-yellow-500/20 text-yellow-300 text-xs font-bold border border-yellow-400">Top Friend</span>}
                  {friend.id === currentUserId && <span className="ml-2 px-2 py-1 rounded bg-blue-500/20 text-blue-300 text-xs font-bold border border-blue-400">You</span>}
                </li>
              ))}
          </ul>
        </div>
        <div className="mt-6 text-center text-sm text-gray-400">Compare your progress with your friends!</div>
        <button
          onClick={() => setShowAddPopup(true)}
          className="mt-4 w-full py-2 rounded-lg bg-gradient-to-r from-blue-500 to-violet-500 text-white font-semibold shadow hover:from-blue-600 hover:to-violet-600 transition"
        >
          Add Friends
        </button>
      </div>
    </div>
  );
}
