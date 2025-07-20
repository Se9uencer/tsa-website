"use client"
import Image from 'next/image';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';

// Helper to truncate bio after about 3 lines, then add '... read more' on the 4th line
function getBioWithReadMore(bio: string, onClick: () => void) {
  return (
    <div className="mt-4 text-base text-white font-normal">
      <div className="line-clamp-3 overflow-hidden">
        {bio}
      </div>
      <div>
        <span
          className="text-sky-400 font-semibold italic cursor-pointer"
          onClick={onClick}
        >
          Read more &gt;
        </span>
      </div>
    </div>
  )
}

interface Officer {
  name: string;
  position: string;
  favoriteEvent: string;
  bio: string;
  image: string; // public URL
}

export default function Officers() {
  const router = useRouter();
  const [modalIndex, setModalIndex] = useState<number | null>(null);
  const [officers, setOfficers] = useState<Officer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
    const fetchOfficers = async () => {
      setLoading(true);
      setError(null);
      const { data, error } = await supabase
        .from('officers')
        .select('name, position, favoriteEvent, bio');
      if (error) {
        setError('Failed to load officers.');
        setLoading(false);
        return;
      }
      // For each officer, get the signed image URL from the private bucket
      const officersWithImages: Officer[] = await Promise.all(
        (data || []).map(async (officer: any) => {
          const firstName = officer.name.split(' ')[0].toLowerCase();
          // Get a signed URL for 1 hour
          const { data: imgData, error: imgError } = await supabase.storage
            .from('officer-photos')
            .createSignedUrl(`${firstName}.jpg`, 3600);
          return {
            ...officer,
            image: imgData?.signedUrl || '/file.svg', // fallback if not found
          };
        })
      );
      setOfficers(officersWithImages);
      setLoading(false);
    };
    fetchOfficers();
  }, []);

  if (loading) {
    return <div className="flex justify-center items-center min-h-screen text-white text-2xl">Loading...</div>;
  }
  if (error) {
    return <div className="flex justify-center items-center min-h-screen text-red-400 text-2xl">{error}</div>;
  }

  return (
    <div className="min-h-screen bg-[#0a101f] px-4 flex flex-col items-center">
      <div className="h-16" />
      <h1 className="text-4xl md:text-4xl font-bold text-white mt-15 mb-15 text-center">Meet the North Creek TSA Board!</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10 w-full max-w-6xl">
        {officers.map((officer, i) => (
          <div
            key={i}
            className="flex flex-col md:flex-row bg-[#181e29] border rounded-3xl shadow-xl overflow-hidden p-6 gap-6 items-center border-[#232a3a] h-72 min-h-72 max-h-72"
            style={{ boxShadow: '0 0 10px 0 #3b82f6, 0 0 24px 0 #8b5cf6, 0 0 0 1px #232a3a' }}
          >
            <div className="flex-shrink-0 flex items-center justify-center w-40 h-40 bg-[#232a3a] rounded-2xl border border-[#232a3a]/50">
              <Image src={officer.image} alt="Image of officer" width={120} height={120} className="w-[90%] h-[90%] object-contain rounded-xl" />
            </div>
            <div className="flex-1 flex flex-col justify-center">
              <div className="text-2xl font-bold text-white leading-tight">{officer.name}</div>
              <div className={"text-lg font-semibold mt-1 text-purple-400"}>{officer.position}</div>
              <div className="mt-4 text-lg font-medium text-white">Favorite Event: <span className="text-sky-400">{officer.favoriteEvent}</span></div>
              <div className="text-base text-white font-sm line-clamp-4 overflow-hidden">
                {getBioWithReadMore(officer.bio, () => setModalIndex(i))}
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="h-16" />

      {/* Modal */}
      {modalIndex !== null && officers[modalIndex] && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
          <div
            className="bg-[#181e29] border rounded-3xl shadow-2xl p-4 md:p-8 my-8 max-w-lg w-full relative animate-fade-in border-[#232a3a] max-h-[90vh] overflow-y-auto custom-scrollbar"
            style={{ boxShadow: '0 0 10px 0 #3b82f6, 0 0 24px 0 #8b5cf6, 0 0 0 1px #232a3a' }}
          >
            <button
              className="absolute top-4 right-4 text-gray-400 hover:text-white text-3xl font-bold focus:outline-none"
              onClick={() => setModalIndex(null)}
              aria-label="Close"
            >
              &times;
            </button>
            <div className="flex flex-col items-center">
              <Image src={officers[modalIndex].image} alt="Profile" width={100} height={100} className="w-24 h-24 object-contain mb-4 border border-[#232a3a]/50" />
              <div className="text-2xl font-bold text-white mb-1">{officers[modalIndex].name}</div>
              <div className={"text-lg font-semibold mb-2 text-purple-400"}>{officers[modalIndex].position}</div>
              <div className="text-base text-white text-center whitespace-pre-line">{officers[modalIndex].bio}</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 