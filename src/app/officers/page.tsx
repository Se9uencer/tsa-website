"use client"
import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';

const officers = [
  {
    name: 'Videep Mannava',
    position: 'Director of Event Planning',
    favoriteEvent: 'Video Game Design',
    favoriteEventColor: 'text-sky-400',
    positionColor: 'text-purple-400',
    bio: `Hey there! I'm Videep Mannava, a sophomore at North Creek. I love technology and using it to create interesting products, including musical compositions, apps, and games. I often come off as goofy to many people, though I am keen on taking things seriously when I need to. My general interest in technology led to me joining TSA, as I took part in events like Music Production and Video Game Design with my friends. I dove straight into TSA, and soon enough, it became one of the most fun, memorable, and defining parts of my freshman year at North Creek.
In the future, I hope TSA can be a place for any North Creek student looking to make change using technology. Within TSA, anyone should be able to apply their technical knowledge into developing innovative projects that create a meaningful societal impact.`,
    image: '/file.svg',
  },
  {
    name: 'Someone Else',
    position: 'Director of Something',
    favoriteEvent: 'Tech',
    favoriteEventColor: 'text-sky-400',
    positionColor: 'text-purple-400',
    bio: `Hey there! I'm Someone Else, a junior at North Creek. I enjoy robotics, coding, and helping others learn about technology. My favorite event is Tech, where I get to collaborate and innovate.`,
    image: '/file.svg',
  },
  {
    name: 'Jane Doe',
    position: 'President',
    favoriteEvent: 'Debate',
    favoriteEventColor: 'text-sky-400',
    positionColor: 'text-purple-400',
    bio: `Hi! I'm Jane Doe, a senior passionate about leadership and public speaking. TSA has given me the opportunity to grow and help others succeed.`,
    image: '/file.svg',
  },
  {
    name: 'John Smith',
    position: 'Treasurer',
    favoriteEvent: 'Engineering',
    favoriteEventColor: 'text-sky-400',
    positionColor: 'text-purple-400',
    bio: `Hello! I'm John Smith, and I love all things math and engineering. TSA has been a great place to meet like-minded friends and build cool projects.`,
    image: '/file.svg',
  },
];

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

export default function Officers() {
  const [modalIndex, setModalIndex] = useState<number | null>(null);

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
              <Image src={officer.image} alt="Image of officer" width={120} height={120} className="w-28 h-28 object-contain" />
            </div>
            <div className="flex-1 flex flex-col justify-center">
              <div className="text-2xl font-bold text-white leading-tight">{officer.name}</div>
              <div className={`text-lg font-semibold mt-1 ${officer.positionColor}`}>{officer.position}</div>
              <div className="mt-4 text-lg font-medium text-white">Favorite Event: <span className={officer.favoriteEventColor}>{officer.favoriteEvent}</span></div>
              <div className="text-base text-white font-sm line-clamp-4 overflow-hidden">
                {getBioWithReadMore(officer.bio, () => setModalIndex(i))}
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="h-16" />

      {/* Modal */}
      {modalIndex !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
          <div
            className="bg-[#181e29] border rounded-3xl shadow-2xl p-8 max-w-lg w-full relative animate-fade-in border-[#232a3a]"
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
              <div className={`text-lg font-semibold mb-2 ${officers[modalIndex].positionColor}`}>{officers[modalIndex].position}</div>
              <div className="text-base text-white text-center whitespace-pre-line">{officers[modalIndex].bio}</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 