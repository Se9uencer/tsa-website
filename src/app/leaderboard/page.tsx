import Link from 'next/link';
export default function Leaderboard() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-3xl font-bold text-white bg-[#0a101f]">
      Leaderboard Page (Coming Soon)
      <Link href="/dashboard" className="mt-8 px-6 py-2 rounded-lg bg-blue-600 text-white text-lg font-semibold hover:bg-blue-700 transition">Back</Link>
    </div>
  );
} 