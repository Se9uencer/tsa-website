'use client';
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

// Tier styling colors
const tierColors: Record<string, string> = {
  Gold: "bg-yellow-500/20 border-yellow-400 text-yellow-300",
  Silver: "bg-slate-200/20 border-slate-300 text-slate-200",
  Bronze: "bg-yellow-900/30 border-yellow-700 text-yellow-400",
};

// Determine tier based on points
function getTier(points: number) {
  if (points >= 150) return "Gold";
  if (points >= 50) return "Silver";
  return "Bronze";
}

// User popup modal
function UserPopup({ user, onClose }: { user: any; onClose: () => void }) {
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
            {user.full_name ? user.full_name[0] : "?"}
          </div>
          <div className="text-2xl font-bold text-white">{user.full_name || "Unknown"}</div>
          <div className="text-lg text-gray-300">{user.points ?? 0} points</div>
          <div className="text-lg font-semibold">
            <span
              className={`px-3 py-1 rounded-lg border font-semibold text-base ${tierColors[getTier(
                user.points ?? 0
              )]}`}
            >
              {getTier(user.points ?? 0)}
            </span>
          </div>
          <div className="w-full mt-4">
            <div className="text-lg font-bold text-blue-200 mb-2">Events Competing In</div>
            {Array.isArray(user.events) && user.events.length > 0 ? (
              <ul className="list-disc list-inside text-white max-h-48 overflow-y-auto">
                {user.events.map((event: any, idx: number) => (
                  <li key={idx}>{typeof event === "string" ? event : event.name || JSON.stringify(event)}</li>
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

// Add friend popup modal
function AddFriendPopup({
  allUsers,
  onClose,
  onAdd,
  currentUserId,
  friends,
}: {
  allUsers: any[];
  onClose: () => void;
  onAdd: (userId: string) => void;
  currentUserId: string | null;
  friends: any[];
}) {
  const [search, setSearch] = useState("");
  const filteredUsers = allUsers.filter(
    (u) =>
      u.full_name?.toLowerCase().includes(search.toLowerCase()) &&
      u.id !== currentUserId &&
      !friends.some((f) => f.id === u.id)
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 animate-fade-in">
      <div className="bg-[#181e29] rounded-2xl shadow-2xl border border-[#232a3a] p-6 w-full max-w-lg relative">
        <button
          className="absolute top-4 right-4 text-gray-400 hover:text-white text-2xl font-bold focus:outline-none cursor-pointer"
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
        <div className="max-h-64 overflow-y-auto custom-scrollbar">
          {filteredUsers.map((user) => (
            <div key={user.id} className="flex justify-between items-center p-2 hover:bg-[#2a3245] rounded">
              <span className="text-white">{user.full_name}</span>
              <button
                onClick={() => onAdd(user.id)}
                className="px-3 py-1 rounded text-sm cursor-pointer bg-gradient-to-r from-blue-500 to-violet-500 text-white font-semibold shadow hover:from-blue-600 hover:to-violet-600 transition"
              >
                Add
              </button>
            </div>
          ))}
          {filteredUsers.length === 0 && (
            <div className="text-gray-400 text-center py-4 italic">No users found.</div>
          )}
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
  const [filterTier, setFilterTier] = useState<string | null>(null);
  const router = useRouter();

  // Get current user ID
  useEffect(() => {
    const fetchUser = async () => {
      const { data, error } = await supabase.auth.getUser();
      if (error || !data.user) {
        router.replace("/signin");
      } else {
        setCurrentUserId(data.user.id);
      }
    };
    fetchUser();
  }, [router]);

  // Fetch leaderboard and all users
  useEffect(() => {
    if (!currentUserId) return;
    const fetchData = async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("id, full_name, points, events")
        .order("points", { ascending: false });

      if (!data || error) return;

      // Assign tier based on points
      const leaderboardData = data.map((user: any, idx: number) => ({
        ...user,
        rank: idx + 1,
      }));

      setLeaderboard(leaderboardData);
      setAllUsers(leaderboardData);
    };
    fetchData();
  }, [currentUserId]);

  // Fetch friends from Supabase
  useEffect(() => {
    if (!currentUserId) return;

    const fetchFriends = async () => {
      const { data: friendEntries, error } = await supabase
        .from("friends")
        .select("friend_id")
        .eq("user_id", currentUserId);

      if (error || !friendEntries) return;

      const friendIds = friendEntries.map((f) => f.friend_id);
      if (friendIds.length === 0) {
        setFriends([]);
        return;
      }

      const { data: friendProfiles, error: profileError } = await supabase
        .from("profiles")
        .select("id, full_name, points")
        .in("id", friendIds);

      if (!profileError && friendProfiles) {
        setFriends(friendProfiles);
      }
    };

    fetchFriends();
  }, [currentUserId]);

  // Handle adding a friend
  const handleAddFriend = async (friendId: string) => {
    if (!currentUserId) return;

    const { error } = await supabase.from("friends").insert({ user_id: currentUserId, friend_id: friendId });

    if (!error) {
      const userToAdd = allUsers.find((u) => u.id === friendId);
      if (userToAdd) setFriends((prev) => [...prev, userToAdd]);
    }

    setShowAddPopup(false);
  };

  // Handle removing a friend
  const handleRemoveFriend = async (friendId: string) => {
    if (!currentUserId) return;

    const { error } = await supabase
      .from("friends")
      .delete()
      .eq("user_id", currentUserId)
      .eq("friend_id", friendId);

    if (!error) {
      setFriends((prev) => prev.filter((f) => f.id !== friendId));
    }
  };

  // Filter leaderboard by tier if filter is set
  const filteredLeaderboard = filterTier
    ? leaderboard.filter((user) => getTier(user.points ?? 0) === filterTier)
    : leaderboard;

  return (
    <div className="w-[100%] bg-[#0e111a]">
      <div
        className="flex flex-col lg:flex-row gap-8 max-w-7xl mx-auto mt-16 py-16 px-4 min-h-screen"
        style={{ backgroundColor: "#0e111a" }}
      >
        {selectedUser && <UserPopup user={selectedUser} onClose={() => setSelectedUser(null)} />}
        {showAddPopup && (
          <AddFriendPopup
            allUsers={allUsers}
            onClose={() => setShowAddPopup(false)}
            onAdd={handleAddFriend}
            currentUserId={currentUserId}
            friends={friends}
          />
        )}

        {/* Leaderboard Panel */}
        <div
          className="flex-1 p-8 rounded-2xl shadow-lg border border-[#232a3a] flex flex-col"
          style={{ backgroundColor: "#181e29", boxShadow: "0 0 10px 0 #3b82f6, 0 0 24px 0 #8b5cf6, 0 0 0 1px #232a3a" }}
        >
          <h1 className="text-5xl font-extrabold text-blue-200 mb-4 text-center">Leaderboard</h1>

          {/* Tier Filter Buttons */}
          <div className="flex justify-center gap-4 mb-6">
            {["Gold", "Silver", "Bronze"].map((tier) => (
              <button
                key={tier}
                className={`px-4 py-2 rounded-lg border font-semibold text-base cursor-pointer
                  ${tierColors[tier]}
                  ${filterTier === tier ? "ring-2 ring-blue-400" : "hover:ring-1 hover:ring-blue-300"}
                `}
                onClick={() => setFilterTier(filterTier === tier ? null : tier)}
              >
                {tier}
              </button>
            ))}
          </div>

          <div className="overflow-x-auto max-h-[400px] overflow-y-auto custom-scrollbar rounded-lg border border-[#232a3a] bg-[#232a3a]/20">
            <table className="min-w-full text-white text-lg">
              <thead>
                <tr className="border-b border-[#232a3a] sticky top-0 bg-[#181e29]">
                  <th className="py-3 px-4 text-left">Rank</th>
                  <th className="py-3 px-4 text-left">Name</th>
                  <th className="py-3 px-4 text-left">Points</th>
                  <th className="py-3 px-4 text-left">Tier</th>
                </tr>
              </thead>
              <tbody>
                {filteredLeaderboard.map((row, idx) => (
                  <tr key={row.id} className="border-b border-[#232a3a] hover:bg-[#2a3245] cursor-pointer">
                    <td className="py-2 px-4">{idx + 1}</td>
                    <td className="py-2 px-4">
                      <button
                        className="text-blue-400 hover:underline"
                        onClick={() => setSelectedUser(row)}
                      >
                        {row.full_name || "Unknown"}
                      </button>
                    </td>
                    <td className="py-2 px-4">{row.points ?? 0}</td>
                    <td className="py-2 px-4">
                      <span
                        className={`px-3 py-1 rounded-lg border font-semibold text-base ${tierColors[getTier(row.points ?? 0)]}`}
                      >
                        {getTier(row.points ?? 0)}
                      </span>
                    </td>
                  </tr>
                ))}
                {filteredLeaderboard.length === 0 && (
                  <tr>
                    <td colSpan={4} className="text-center py-6 text-gray-400">
                      No users in this tier.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Friends Dashboard */}
        <div
          className="w-full lg:w-80 flex-shrink-0 p-6 rounded-2xl shadow-lg border border-[#232a3a] flex flex-col"
          style={{ backgroundColor: "#181e29", boxShadow: "0 0 10px 0 #3b82f6, 0 0 24px 0 #8b5cf6, 0 0 0 1px #232a3a" }}
        >
          <h2 className="text-2xl font-bold text-blue-200 mb-4 text-center">Friends Dashboard</h2>
          <div className="max-h-[400px] overflow-y-auto custom-scrollbar">
            <ul className="flex flex-col gap-4">
              {friends
                .sort((a, b) => (b.points ?? 0) - (a.points ?? 0))
                .map((friend) => (
                  <li
                    key={friend.id}
                    className={`flex items-center gap-4 p-3 rounded-xl border border-[#232a3a] bg-[#232a3a]/30`}
                  >
                    <div className="w-10 h-10 flex items-center justify-center rounded-full bg-blue-900 text-blue-300 font-bold text-xl border border-blue-700">
                      {friend.full_name ? friend.full_name[0] : "?"}
                    </div>
                    <div className="flex-1">
                      <div className="font-semibold text-white">{friend.full_name || "Unknown"}</div>
                      <div className="text-sm text-gray-400">{friend.points ?? 0} pts</div>
                    </div>
                    <button
                      onClick={() => handleRemoveFriend(friend.id)}
                      className="px-3 py-1 rounded bg-red-700 text-white hover:bg-red-800 transition text-sm cursor-pointer"
                      title="Remove Friend"
                    >
                      Remove
                    </button>
                  </li>
                ))}
              {friends.length === 0 && (
                <li className="text-gray-400 italic text-center py-6">You have no friends added.</li>
              )}
            </ul>
          </div>
          <div className="mt-6 text-center text-sm text-gray-400">Compare your progress with your friends!</div>
          <button
            onClick={() => setShowAddPopup(true)}
            className="mt-4 w-full py-2 rounded-lg bg-gradient-to-r from-blue-500 to-violet-500 text-white font-semibold shadow hover:from-blue-600 hover:to-violet-600 transition cursor-pointer"
          >
            Add Friends
          </button>
        </div>
      </div>
    </div>
  );
}
