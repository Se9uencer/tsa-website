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
  const [clubRegistrationComplete, setClubRegistrationComplete] = useState<boolean>(false);
  const [eventRegistrationComplete, setEventRegistrationComplete] = useState<boolean>(false);

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
        .select('schoolEmail, events')
        .eq('id', userData.user.id)
        .single();
      if (!profileError && profile) {
        setClubRegistrationComplete(!!profile.schoolEmail);
        const eventsArr = Array.isArray(profile.events) ? profile.events : (profile.events ? [profile.events] : []);
        setEventRegistrationComplete(eventsArr.length > 0);
        setEventCount(eventsArr.length);
      }

      // 3. Get registration deadlines
      const { data: deadlines, error: deadlinesError } = await supabase
        .from('registrationDeadlines')
        .select('deadline, date');
      if (!deadlinesError && deadlines) {
        deadlines.forEach((row: { deadline: string; date: string }) => {
          // Parse as PST (America/Los_Angeles) and fix off-by-2 issue
          const localDate = new Date(row.date + 'T00:00:00-08:00');
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

  // Determine which form to show
  let formSrc = '';
  if (!clubRegistrationComplete) {
    formSrc = 'one';
  } else if (clubRegistrationComplete && !eventRegistrationComplete) {
    formSrc = 'two';
  }

  // Add a blue-purple dot component
  function LiveDot() {
    return (
      <span className="inline-block w-4 h-4 rounded-full bg-gradient-to-r from-blue-500 to-violet-500 mr-2 align-middle" />
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#0a101f] py-16 pt-20 px-4">
      <h1 className="text-4xl font-bold text-white mt-8 mb-8">Register</h1>
      <div className="flex-1 flex flex-col md:flex-row items-center w-full justify-center gap-8 md:gap-0">
        {/* Registration Progress Box */}
        <div className="w-full max-w-[90vw] md:max-w-[25vw] md:min-h-[70vh] md:mr-8 mb-8 md:mb-0">
          <div className="rounded-2xl flex-1 md:h-[70vh] border border-[#232a3a] shadow-lg bg-[#181e29] px-8 py-8 w-full flex flex-col items-center" style={{ boxShadow: '0 0 10px 0 #3b82f6, 0 0 24px 0 #8b5cf6, 0 0 0 1px #232a3a' }}>
            <h2 className="text-3xl font-bold text-white mb-8 text-center">Registration Progress</h2>
            {/* Club Registration Status */}
            <div className="flex items-center w-full mb-1">
              {clubRegistrationComplete ? (
                <FaCheckCircle className="text-green-500 text-2xl mr-2" />
              ) : clubRegistrationOpen ? (
                <LiveDot />
              ) : now < (clubRegistrationOpenDate ?? now) ? (
                <span className="w-4 h-4 mr-2" />
              ) : (
                <FaTimesCircle className="text-red-500 text-2xl mr-2" />
              )}
              <span className={`${now < (clubRegistrationOpenDate ?? now) ? 'text-gray-400' : 'text-white'} text-2xl font-semibold`}>Club Registration</span>
            </div>
            <div className="text-lg mb-8 pl-6 w-full">
              {clubRegistrationOpen ? (
                <span className="bg-gradient-to-r from-blue-500 to-violet-500 bg-clip-text w-fit text-transparent font-semibold">closes&nbsp;
                  <span className="font-bold">{formatDate(clubRegistrationCloseDate)}</span>
                </span>
              ) : (
                <span className="text-gray-400 italic">opens {formatDate(clubRegistrationOpenDate)}</span>
              )}
            </div>
            {/* Event Registration Status */}
            <div className="flex items-center w-full mb-1">
              {eventRegistrationOpen && eventCount < 4 ? (
                <LiveDot />
              ) : ((!eventRegistrationOpen && eventRegistrationComplete) || eventCount >= 4) ? (
                <FaCheckCircle className="text-green-500 text-2xl mr-2" />
              ) : now < (eventRegistrationOpenDate ?? now) ? (
                <span className="w-4 h-4 mr-2" />
              ) : (
                <FaTimesCircle className="text-red-500 text-2xl mr-2" />
              )}
              <span className={`${now < (eventRegistrationOpenDate ?? now) ? 'text-gray-400' : 'text-white'} text-2xl font-semibold`}>Event Registration</span>
            </div>
            <div className="text-lg pl-6 mb-4 w-full">
              {eventRegistrationOpen ? (
                <span className="bg-gradient-to-r from-blue-500 to-violet-500 bg-clip-text w-fit text-transparent font-semibold">Closes {formatDate(eventRegistrationCloseDate)}</span>
              ) : (
                <span className="text-gray-400 italic">opens {formatDate(eventRegistrationOpenDate)}</span>
              )}
            </div>
            {/* Event count summary */}
            <div className="mt-auto text-lg text-center bg-gradient-to-r from-blue-500 to-violet-500 bg-clip-text text-transparent font-semibold pt-4">
              You are currently registered for <span className="font-extrabold">{eventCount}/4</span> events.
            </div>
          </div>
        </div>
        {/* Registration Form or Error */}
        <div className="w-full max-w-3xl">
          {/* Show club registration form if not complete and open */}
          {userUuid && !clubRegistrationComplete && clubRegistrationOpen && (
            <iframe
              src={`https://tally.so/embed/3ERONo?alignLeft=1&hideTitle=1&transparentBackground=1&dynamicHeight=1&uuid=${userUuid}`}
              className="w-full flex-1 min-h-[70vh] rounded-xl border border-[#232a3a] shadow-lg px-4 py-2 md:py-4"
              style={{ background: '#181e29', boxShadow: '0 0 10px 0 #3b82f6, 0 0 24px 0 #8b5cf6, 0 0 0 1px #232a3a' }}
              allowFullScreen
            >
              Loading…
            </iframe>
          )}
          {/* Show event registration form if club registration is complete, event registration is open, and user has less than 4 events */}
          {userUuid && clubRegistrationComplete && eventRegistrationOpen && eventCount < 4 && (
            <iframe
              src={`https://tally.so/embed/nGGPAe?alignLeft=1&hideTitle=1&transparentBackground=1&dynamicHeight=1&uuid=${userUuid}`}
              className="w-full flex-1 min-h-[70vh] rounded-xl border border-[#232a3a] shadow-lg px-4 py-2 md:py-4"
              style={{ background: '#181e29', boxShadow: '0 0 10px 0 #3b82f6, 0 0 24px 0 #8b5cf6, 0 0 0 1px #232a3a' }}
              allowFullScreen
            >
              Loading…
            </iframe>
          )}
          {/* Show missed window message for club registration */}
          {userUuid && !clubRegistrationComplete && !clubRegistrationOpen && now > (clubRegistrationCloseDate ?? now) && (
            <div className="w-full max-w-2xl flex-1 min-h-[70vh] rounded-xl border border-[#232a3a] shadow-lg px-8 py-2 md:py-4 text-center bg-[#181e29]"
              style={{ background: '#181e29', boxShadow: '0 0 10px 0 #3b82f6, 0 0 24px 0 #8b5cf6, 0 0 0 1px #232a3a' }}>
              <div className="bg-gradient-to-r from-red-500 to-pink-500 bg-clip-text text-transparent text-3xl mt-8 font-bold">
                You've missed your window to fill out the normal registration.
              </div>
              <div className="text-gray-400 text-xl mt-2 font-semibold italic">
                Please contact an officer if you believe this is a mistake.
              </div>
            </div>
          )}
          {/* Show missed window message for event registration */}
          {userUuid && clubRegistrationComplete && eventCount < 4 && !eventRegistrationOpen && now > (eventRegistrationCloseDate ?? now) && (
            <div className="w-full max-w-2xl flex-1 min-h-[70vh] rounded-xl border border-[#232a3a] shadow-lg px-8 py-2 md:py-4 text-center bg-[#181e29]"
              style={{ background: '#181e29', boxShadow: '0 0 10px 0 #3b82f6, 0 0 24px 0 #8b5cf6, 0 0 0 1px #232a3a' }}>
              <div className="bg-gradient-to-r from-red-500 to-pink-500 bg-clip-text text-transparent text-3xl mt-8 font-bold">
                You've missed your window to fill out the event registration.
              </div>
              <div className="text-gray-400 text-xl mt-2 font-semibold italic">
                Please contact an officer if you believe this is a mistake.
              </div>
            </div>
          )}
          {/* Show 'You're all caught up' if no forms are available to fill out, but NOT if event registration is open and user has < 4 events, and NOT if missed window is being shown */}
          {(
            userUuid && (
              (
                (clubRegistrationComplete && (eventRegistrationComplete || !eventRegistrationOpen || eventCount < 4 === false)) ||
                (!clubRegistrationComplete && !clubRegistrationOpen)
              ) &&
              // Don't show if event registration is open and user has < 4 events
              !(eventRegistrationOpen && eventCount < 4) &&
              // Don't show if missed window for club registration
              !(userUuid && !clubRegistrationComplete && !clubRegistrationOpen && now > (clubRegistrationCloseDate ?? now)) &&
              // Don't show if missed window for event registration
              !(userUuid && clubRegistrationComplete && eventCount < 4 && !eventRegistrationOpen && now > (eventRegistrationCloseDate ?? now))
            )
          ) && (
            <div className="w-full max-w-2xl flex-1 min-h-[70vh] rounded-xl border border-[#232a3a] shadow-lg px-8 py-2 md:py-4 text-center bg-[#181e29]"
              style={{ background: '#181e29', boxShadow: '0 0 10px 0 #3b82f6, 0 0 24px 0 #8b5cf6, 0 0 0 1px #232a3a' }}>
              <div className="bg-gradient-to-r from-blue-500 to-violet-500 bg-clip-text text-transparent text-3xl mt-8 font-bold">
                You're all caught up with registration!
              </div>
              <div className="text-gray-400 text-xl mt-2 font-semibold italic">
                Please review this <a className="bg-gradient-to-r text-blue-400 hover:text-blue-500 duration-200" href={
                  clubRegistrationComplete && !eventRegistrationComplete && !eventRegistrationOpen ? 'https://docs.google.com/spreadsheets/d/1-Vr_UGlpelt1eNDaZHjf9GU6F_oiEKqNqJEi2kPOv2I/edit?usp=drive_link' :
                  'https://docs.google.com/spreadsheets/d/1TVDFLZBMgkTF0BKPGhmLP_FbUePj-CfKaJu9Avp7bPw/edit?usp=drive_link'
                } target="_blank" rel="noopener noreferrer">
                  {clubRegistrationComplete && !eventRegistrationComplete && !eventRegistrationOpen ? 'spreadsheet' :
                   'event registration spreadsheet'}
                </a> and make sure all of your information is correct. If something is wrong, contact us.
              </div>
            </div>
          )}
          {!userUuid && (
            <div className="text-white text-lg mt-8">Failed to connect to backend - try again later.</div>
          )}
        </div>
      </div>
    </div>
  );
} 

// https://tally.so/embed/3ERONo?alignLeft=1&hideTitle=1&transparentBackground=1&dynamicHeight=1&uuid=${userUuid}