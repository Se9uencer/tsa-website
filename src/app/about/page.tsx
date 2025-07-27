'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import Logo from '@/components/Logo';

const boxShadow = '0 0 10px 0 #3b82f6, 0 0 24px 0 #8b5cf6, 0 0 0 1px #232a3a';

const aboutContent = {
  pageTitle: 'About TSA',
  tsaDescription: 'TSA, short for Technology Student Association, is a CTSO (career and technical student organization) that aims to foster innovation in STEM fields. TSA hosts national-level competitions and conferences, encouraging students to apply technical skills to a scenario or real world problem.',
  chapterTitle: 'About the North Creek Chapter',
  chapterDescription: 'The North Creek TSA chapter is made of hundreds of students looking to use technology to create a real-world impact. The chapter competes at TSA’s state and national-level conferences, and it hosts a school-level contest to recognize the most talented students.',
  membersCount: '300+',
  membersLabel: 'North Creek\nTSA Members',
  missionPrefix: 'Our Mission? ',
  missionStatement: 'Giving everyone the opportunity to learn to live in a creative and technical world.'
};

const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sept", "Oct", "Nov", "Dec"];

export default function About() {
  const router = useRouter();
  const [timelineEvents, setTimelineEvents] = useState<{ date: string; title: string; description: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timelineWindow, setTimelineWindow] = useState(3); // default to 3 for desktop
  const [timelineStart, setTimelineStart] = useState(0);

  // Fetch timeline events from Supabase
  useEffect(() => {
    const fetchTimeline = async () => {
      setLoading(true);
      setError(null);
      const { data, error } = await supabase
        .from('aboutTimeline')
        .select('date, title, description')
        .order('date', { ascending: true });
      if (error) {
        setError('Failed to load timeline events.');
        setTimelineEvents([]);
      } else {
        setTimelineEvents(data || []);
        // Start at the last window by default
        setTimelineStart(Math.max(0, (data?.length || 0) - timelineWindow));
      }
      setLoading(false);
    };
    fetchTimeline();
  }, [timelineWindow]);

  // Responsive: update timelineWindow and timelineStart on resize
  useEffect(() => {
    function updateWindow() {
      let win = window.innerWidth < 768 ? 1 : 3;
      setTimelineWindow(win);
      setTimelineStart(prevStart => {
        // Adjust start to always show the last window
        return Math.max(0, timelineEvents.length - win);
      });
    }
    updateWindow();
    window.addEventListener('resize', updateWindow);
    return () => window.removeEventListener('resize', updateWindow);
  }, [timelineEvents.length]);

  const maxStart = Math.max(0, timelineEvents.length - timelineWindow);
  const visibleEvents = timelineEvents.slice(timelineStart, timelineStart + timelineWindow);

  useEffect(() => {
    const checkUser = async () => {
      const { data, error } = await supabase.auth.getUser();
      if (error || !data.user) {
        router.replace('/signin');
      }
    };
    checkUser();
  }, [router]);

  return (
    <div className="min-h-screen bg-[#0a101f] flex flex-col items-center py-12 pt-20 px-6 md:px-2 text-white">
      <h1 className="text-3xl md:text-4xl font-bold mb-14 mt-12">{aboutContent.pageTitle}</h1>
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 w-full max-w-4xl mb-8">
        {/* Logo Box */}
        <div className="rounded-2xl border border-[#232a3a] bg-[#181e29] flex items-center justify-center min-h-[180px] p-6 md:col-span-4" style={{ boxShadow }}>
          <Logo className="w-32 h-32" />
        </div>
        {/* TSA Description */}
        <div className="rounded-2xl border border-[#232a3a] bg-[#181e29] flex items-center p-6 min-h-[180px] md:col-span-8" style={{ boxShadow }}>
          <p className="text-base text-gray-200">
            {aboutContent.tsaDescription}
          </p>
        </div>
        {/* Chapter Description */}
        <div className="rounded-2xl border border-[#232a3a] bg-[#181e29] p-6 min-h-[180px] flex flex-col justify-center md:col-span-8" style={{ boxShadow }}>
          <h2 className="text-xl md:text-2xl font-bold mb-2 text-sky-300">{aboutContent.chapterTitle}</h2>
          <p className="text-base text-gray-200">
            {aboutContent.chapterDescription}
          </p>
        </div>
        {/* Members Box */}
        <div className="rounded-2xl border border-[#232a3a] bg-[#181e29] flex flex-col items-center justify-center min-h-[180px] p-6 md:col-span-4" style={{ boxShadow }}>
          <span className="text-5xl font-extrabold bg-gradient-to-r from-blue-500 to-violet-500 bg-clip-text w-fit text-transparent mb-2">{aboutContent.membersCount}</span>
          <span className="text-2xl font-bold text-center" style={{ whiteSpace: 'pre-line' }}>{aboutContent.membersLabel}</span>
        </div>
      </div>
      {/* Mission Statement */}
      <div className="rounded-2xl border border-[#232a3a] bg-[#181e29] w-full max-w-4xl p-8" style={{ boxShadow }}>
        <span className="text-xl md:text-2xl font-bold bg-gradient-to-r from-blue-500 to-violet-500 bg-clip-text w-fit text-transparent">{aboutContent.missionPrefix}</span>
        <span className="text-xl md:text-2xl font-bold text-sky-300">{aboutContent.missionStatement}</span>
      </div>

      {/* Timeline Heading */}
      <h2 className="text-2xl md:text-3xl font-bold text-white mt-20 mb-8 text-center w-full">North Creek TSA's Timeline</h2>

      {/* Timeline Bar and Cards (combined) */}
      <div className="w-full max-w-5xl mx-auto flex flex-col items-center">
        <div className="relative w-full flex items-center justify-center mb-6" style={{ minHeight: 120 }}>
          {/* Left Arrow */}
          <button
            className="z-10 bg-black rounded-full w-8 h-8 flex items-center justify-center text-white text-xl shadow hover:bg-gray-800 transition disabled:opacity-40 mr-2"
            onClick={() => setTimelineStart(s => Math.max(0, s - 1))}
            disabled={timelineStart === 0 || loading || timelineEvents.length === 0}
            aria-label="Previous events"
          >
            &#x25C0;
          </button>
          {/* Timeline Cards and Dynamic Line */}
          <div className="relative flex flex-row items-center gap-6 w-auto justify-center z-10">
            {/* Dynamic timeline line behind cards */}
            <div className="absolute left-0 right-0 top-1/2 h-1 bg-black z-0" style={{ transform: 'translateY(-50%)', width: '100%' }} />
            {/* Timeline Cards */}
            {loading ? (
              <div className="text-white text-lg">Loading timeline...</div>
            ) : error ? (
              <div className="text-red-400 text-lg">{error}</div>
            ) : visibleEvents.length === 0 ? (
              <div className="text-gray-400 text-lg">No timeline events found.</div>
            ) : (
              visibleEvents.map((event, idx) => (
                <div
                  key={timelineStart + idx}
                  className="rounded-2xl border border-[#232a3a] bg-[#181e29] shadow-lg w-full max-w-xs flex flex-col overflow-hidden relative z-10"
                  style={{ boxShadow, minWidth: '220px', width: '100%' }}
                >
                  <div className="p-4">
                    <div className="flex items-center justify-between mb-1 pr-2">
                      <div className="font-semibold text-white text-lg">{event.title}</div>
                      <span className="bg-blue-400 text-white px-3 py-1 rounded-md text-xs font-semibold shadow ml-2 whitespace-nowrap">
                        {/* Format date as 'Mon YYYY' */}
                        {(() => {
                          const splitDate = event.date.split("-");
                          return months[Number(splitDate[1])] + " " + splitDate[0]
                        })()}
                      </span>
                    </div>
                    <div className="text-gray-200 text-sm">{event.description}</div>
                  </div>
                </div>
              ))
            )}
          </div>
          {/* Right Arrow */}
          <button
            className="z-10 bg-black rounded-full w-8 h-8 flex items-center justify-center text-white text-xl shadow hover:bg-gray-800 transition disabled:opacity-40 ml-2"
            onClick={() => setTimelineStart(s => Math.min(maxStart, s + 1))}
            disabled={timelineStart >= maxStart || loading || timelineEvents.length === 0}
            aria-label="Next events"
          >
            &#x25B6;
          </button>
        </div>
      </div>
    </div>
  );
} 