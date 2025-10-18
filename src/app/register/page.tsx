"use client"
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import { FaCheckCircle, FaTimesCircle } from 'react-icons/fa';

export default function Register() {
  const router = useRouter();
  const [userUuid, setUserUuid] = useState<string | null>(null);
  const [checked, setChecked] = useState(false);

  // Registration deadline state
  const [clubRegistrationOpenDate, setClubRegistrationOpenDate] = useState<Date | null>(null);
  const [clubRegistrationCloseDate, setClubRegistrationCloseDate] = useState<Date | null>(null);
  const [eventRegistrationOpenDate, setEventRegistrationOpenDate] = useState<Date | null>(null);
  const [eventRegistrationCloseDate, setEventRegistrationCloseDate] = useState<Date | null>(null);

  // Completion status state
  // Remove clubRegistrationComplete and related logic
  // Add state for events list
  const [eventsList, setEventsList] = useState<string[]>([]);
  // Add state for event count
  const [eventCount, setEventCount] = useState<number>(0);

  // Registration open/close logic
  const now = new Date();
  const clubRegistrationOpen = clubRegistrationOpenDate && clubRegistrationCloseDate && now >= clubRegistrationOpenDate && now <= clubRegistrationCloseDate;
  const eventRegistrationOpen = eventRegistrationOpenDate && eventRegistrationCloseDate && now >= eventRegistrationOpenDate && now <= eventRegistrationCloseDate;

  // Date formatting helper (show correct day in PST)
  function formatDate(date: Date | null) {
    if (!date) return '';
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      timeZone: 'America/Los_Angeles',
    });
  }

  useEffect(() => {
    const fetchData = async () => {
      // 1. Get user
      const { data: userData, error: userError } = await supabase.auth.getUser();
      if (userError || !userData.user) {
        router.replace('/signin');
        setChecked(true);
        return;
      }
      setUserUuid(userData.user.id);

      // 2. Get profile
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('events')
        .eq('id', userData.user.id)
        .single();
      if (!profileError && profile) {
        const eventsArr = Array.isArray(profile.events) ? profile.events : (profile.events ? [profile.events] : []);
        setEventsList(eventsArr);
        setEventCount(eventsArr.length);
      }

      // 3. Get registration deadlines
      const { data: deadlines, error: deadlinesError } = await supabase
        .from('registrationDeadlines')
        .select('deadline, date');
      if (!deadlinesError && deadlines) {
        deadlines.forEach((row: { deadline: string; date: string }) => {
          const localDate = new Date(row.date + 'T00:00:00-07:00'); // 7 = PDT
          if (row.deadline === 'Club Registration Open') setClubRegistrationOpenDate(localDate);
          if (row.deadline === 'Club Registration Close') setClubRegistrationCloseDate(localDate);
          if (row.deadline === 'Event Registration Open') setEventRegistrationOpenDate(localDate);
          if (row.deadline === 'Event Registration Close') setEventRegistrationCloseDate(localDate);
        });
      }
      setChecked(true);
    };
    fetchData();
  }, [router]);

  if (!checked) {
    return null; // or a loading spinner if you want
  }

  // Only show left box during event registration
  // Show event list in left box during event registration
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#0a101f] py-16 pt-20 px-4">
      <h1 className="text-4xl font-bold text-white mt-8 mb-8 text-center">{ 
      !clubRegistrationOpen && !eventRegistrationOpen ? "Registration is now closed." : (!eventRegistrationOpen ? "Club registration is" : "Event registration is")
      }{(clubRegistrationOpen || eventRegistrationOpen) && <span className='bg-gradient-to-r from-blue-500 to-violet-500 bg-clip-text text-transparent'> open!</span>}</h1>
      <div className="flex-1 flex flex-col md:flex-row items-center w-full justify-center gap-8 md:gap-0">
        {/* Left-side event list box during event registration */}
        {eventRegistrationOpen && (
          <div className="w-full max-w-[90vw] md:max-w-[25vw] md:min-h-[70vh] md:mr-8 mb-8 md:mb-0">
            <div className="rounded-2xl flex-1 md:h-[70vh] border border-[#232a3a] shadow-lg bg-[#181e29] px-8 py-8 w-full flex flex-col items-center custom-scrollbar overflow-y-auto" style={{ boxShadow: '0 0 10px 0 #3b82f6, 0 0 24px 0 #8b5cf6, 0 0 0 1px #232a3a' }}>
              <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-500 to-violet-500 bg-clip-text text-transparent mb-4 text-center">Your Events</h2>
              {eventsList.length === 0 ? (
                <div className="text-gray-400 text-lg">You have not signed up for any events yet.</div>
              ) : (
                <ul className="text-gray-200 font-semibold text-lg w-full list-disc pl-6">
                  {eventsList.map((event, idx) => (
                    <li key={idx}>{event}</li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        )}
        <div className="w-full max-w-3xl">
          {/* If event registration is open, show only one box with header and tally form */}
          {eventRegistrationOpen && (
            eventCount >= 4 ? (
              <div className="w-full flex-1 min-h-[70vh] rounded-xl border border-[#232a3a] shadow-lg px-8 py-2 md:py-4 text-center bg-[#181e29] custom-scrollbar overflow-y-auto"
                style={{ background: '#181e29', boxShadow: '0 0 10px 0 #3b82f6, 0 0 24px 0 #8b5cf6, 0 0 0 1px #232a3a' }}>
                <div className="bg-gradient-to-r from-blue-500 to-violet-500 bg-clip-text text-transparent text-2xl mt-8 font-bold">
                  You have already signed up for 4 events, which is the maximum amount you can do in TSA.
                </div>
                <div className="text-gray-200 text-xl mt-4 px-8">
                  In the meantime, please check <a href='https://docs.google.com/spreadsheets/d/1TVDFLZBMgkTF0BKPGhmLP_FbUePj-CfKaJu9Avp7bPw/edit?usp=sharing' target="_blank" rel="noopener noreferrer" className='text-blue-400'>this spreadsheet</a> and make sure everything you submitted is accurate.
                </div>
              </div>
            ) : (
              <iframe
                src={`https://tally.so/embed/nGGPAe?alignLeft=1&hideTitle=1&transparentBackground=1&dynamicHeight=1`}
                className="w-full flex-1 min-h-[70vh] rounded-xl border border-[#232a3a] shadow-lg px-8 py-2 md:py-4 text-center bg-[#181e29] custom-scrollbar overflow-y-auto"
                style={{ background: '#181e29', boxShadow: '0 0 10px 0 #3b82f6, 0 0 24px 0 #8b5cf6, 0 0 0 1px #232a3a' }}
                allowFullScreen
              >
                Loading…
              </iframe>
            )
          )}
          {/* If club registration is open, show a single box */}
          {clubRegistrationOpen && !eventRegistrationOpen && (
            <div className="w-full flex-1 min-h-[70vh] rounded-xl border border-[#232a3a] shadow-lg px-8 py-2 md:py-4 text-center bg-[#181e29]"
              style={{ background: '#181e29', boxShadow: '0 0 10px 0 #3b82f6, 0 0 24px 0 #8b5cf6, 0 0 0 1px #232a3a' }}>
              <div className="text-gray-200 text-2xl mt-8 font-bold px-8">
                Register for TSA using the form below.
              </div>

              <iframe
                src={`https://tally.so/embed/3ERONo?alignLeft=1&hideTitle=1&transparentBackground=1&dynamicHeight=1`}
                className="w-full flex-1 min-h-[70vh] rounded-xl border border-[#232a3a] shadow-lg mt-6 px-8 py-2 md:py-4 text-center bg-[#181e29] custom-scrollbar overflow-y-auto"
                allowFullScreen
              >
                Loading…
              </iframe>

            </div>
          )}

        </div>
      </div>
    </div>
  );
} 