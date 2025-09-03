'use client';
import { useState, useEffect } from 'react';
import { ChevronLeftIcon, ChevronRightIcon, PlusIcon, XMarkIcon } from '@heroicons/react/24/solid';
import { supabase } from '@/lib/supabaseClient';
import { useSearchParams } from 'next/navigation';


interface Event {
  id: string;
  event: string;
  date: string; // ISO string
  type: string; // Now any string
  urgency: 'low' | 'medium' | 'high';
  description?: string;
  location: string; // Required location field
  // reminderTime: number; // minutes before event
}

const eventTypes: Record<string, { label: string; color: string }> = {
  meeting: { label: 'Club Meeting', color: 'from-blue-500 to-blue-600' },
  due_date: { label: 'Project Due Date', color: 'from-red-500 to-red-600' },
  conference: { label: 'Conference', color: 'from-purple-500 to-purple-600' },
  workshop: { label: 'Workshop', color: 'from-green-500 to-green-600' }
};

const urgencyColors = {
  low: 'border-green-400',
  medium: 'border-yellow-400',
  high: 'border-red-400'
};

// const notificationOptions = [
//   { value: 0, label: 'No reminder' },
//   { value: 15, label: '15 minutes before' },
//   { value: 30, label: '30 minutes before' },
//   { value: 60, label: '1 hour before (relative to event time)' },
//   { value: 1440, label: '1 day before' },
//   { value: 2880, label: '2 days before' },
//   { value: 10080, label: '1 week before' }
// ];

export default function Calendar() {
  const searchParams = useSearchParams();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState<Event[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEventDetailModal, setShowEventDetailModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [isAdmin, setIsAdmin] = useState(false);
  const [newEvent, setNewEvent] = useState({
    title: '',
    date: '',
    time: '12:00', // Default time
    type: 'meeting' as Event['type'],
    urgency: 'medium' as Event['urgency'],
    description: '',
    location: '', // Required location field
    // notifications: {
    //   reminderTime: 60
    // }
  });
  // const [emailNotifications, setEmailNotifications] = useState(true);

  // Check if user is admin
  useEffect(() => {
    const checkAdminStatus = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data: profiles, error } = await supabase
            .from('profiles')
            .select('admin')
            .eq('id', user.id)
            .single();
          
          if (error) {
            console.error('Error fetching profile:', error);
            setIsAdmin(false);
          } else {
            setIsAdmin(profiles?.admin === true);
          }
        } else {
          setIsAdmin(false);
        }
      } catch (error) {
        console.error('Error checking admin status:', error);
        setIsAdmin(false);
      }
    };

    checkAdminStatus();
  }, []);

  // Fetch user notification setting on mount
  // useEffect(() => {
  //   const fetchNotificationSetting = async () => {
  //     const { data: { user } } = await supabase.auth.getUser();
  //     if (!user) return;
  //     const { data, error } = await supabase
  //       .from('profiles')
  //       .select('settings')
  //       .eq('id', user.id)
  //       .single();
  //     if (!error && data && data.settings) {
  //       setEmailNotifications(data.settings.emailNotifications);
  //       if (!data.settings.emailNotifications) {
  //         // If notifications are disabled, set all reminders to 0
  //         setEvents(events => events.map(ev => ({ ...ev, reminderTime: 0 })));
  //       }
  //         // Do NOT reset reminders when enabling notifications
  //     }
  //   };
  //   fetchNotificationSetting();
  // }, []);

  // Load events from database
  const loadEvents = async () => {
    try {
      const { data, error } = await supabase
        .from('calendar')
        .select('*')
        .order('date', { ascending: true });

      if (error) {
        console.error('Error loading events:', error);
        return;
      }

      console.log('Raw data from Supabase:', data);
      
      // Transform database data to Event objects
      const loadedEvents: Event[] = data.map(item => ({
        id: item.id,
        event: item.event,
        date: item.date,
        type: item.type,
        urgency: item.urgency,
        description: item.description,
        location: item.location || 'TBD', // Include location, default to 'TBD' if missing
        // reminderTime: item.reminderTime
      }));

      console.log('Transformed events:', loadedEvents);
      setEvents(loadedEvents);
      

      // Check if there's an event ID in the URL (from dashboard)
      const eventId = searchParams.get('event');
      if (eventId) {
        const event = loadedEvents.find(e => e.id === eventId);
        if (event) {
          setSelectedEvent(event);
          setShowEventDetailModal(true);
        }
      }
    } catch (error) {
      console.error('Error loading events:', error);
    }
  };

  // Load events when component mounts
  useEffect(() => {
    loadEvents();
  }, [searchParams]);

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDayOfMonth = new Date(year, month, 1).getDay();
    
    const days = [];
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push({ day: null, key: `empty-${i}` });
    }
    
    // Add all days of the month
    for (let i = 1; i <= daysInMonth; i++) {
      days.push({ day: i, key: `${year}-${month}-${i}` });
    }
    
    return days;
  };

  const getEventsForDate = (day: number) => {
    const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    console.log(`Looking for events on ${dateStr}, total events: ${events.length}`);
    
    const dayEvents = events.filter(event => {
      // Convert UTC time from Supabase to PST/PDT for date comparison
      const eventDatePST = convertUTCToPST(event.date);
      // Use local date methods to get the date in PST/PDT without converting back to UTC
      const eventDateStr = `${eventDatePST.getFullYear()}-${String(eventDatePST.getMonth() + 1).padStart(2, '0')}-${String(eventDatePST.getDate()).padStart(2, '0')}`;
      const matches = eventDateStr === dateStr;
      if (matches) {
        console.log(`Found event: ${event.event} on ${eventDateStr}`);
      }
      return matches;
    });
    
    console.log(`Events for ${dateStr}:`, dayEvents);
    return dayEvents;
  };

  const isToday = (day: number) => {
    const today = new Date();
    return day === today.getDate() && 
           currentDate.getMonth() === today.getMonth() && 
           currentDate.getFullYear() === today.getFullYear();
  };

  const getEventTypeInfo = (event: Event) => {
    if (eventTypes[event.type]) {
      return eventTypes[event.type];
    }
    // Default for custom/unknown types
    return { label: event.type, color: 'from-indigo-500 to-indigo-600' };
  };

  // Convert UTC time from Supabase back to PST/PDT [NOT NEEDED - JUST RETURNS THE ORIGINAL DATE WHICH IS PST]
  const convertUTCToPST = (utcDateString: string) => {
    const utcDate = new Date(utcDateString);
    return utcDate;
    
    // // Get the timezone offset for the current date to determine if it's PST or PDT
    // const january = new Date(utcDate.getFullYear(), 0, 1);
    // const july = new Date(utcDate.getFullYear(), 6, 1);
    // const isPST = utcDate.getTimezoneOffset() > Math.min(january.getTimezoneOffset(), july.getTimezoneOffset());
    
    // // PST is UTC-8, PDT is UTC-7
    // const pstOffset = isPST ? 8 : 7;
    
    // // Convert from UTC to PST/PDT by subtracting the offset
    // const pstDate = new Date(utcDate.getTime() - (pstOffset * 60 * 60 * 1000));
    
    // return pstDate;
  };

  // const sendNotificationEmail = async (event: Event) => {
  //   if (!emailNotifications) return; // Don't send if disabled
  //   try {
  //     // Get current user
  //     const { data: { user } } = await supabase.auth.getUser();
  //     if (!user?.email) return;

  //     // Create email content using PST/PDT time
  //     const eventDate = convertUTCToPST(event.date).toLocaleString('en-US', {
  //       weekday: 'long',
  //       year: 'numeric',
  //       month: 'long',
  //       day: 'numeric',
  //       hour: '2-digit',
  //       minute: '2-digit',
  //       hour12: true
  //     });

  //     const subject = `Reminder: ${event.event}`;
  //     const body = `
  //       <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
  //       <h2 style="color: #3b82f6;">North Creek TSA Event Reminder</h2>
  //       <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
  //       <h3 style="color: #1e293b; margin-top: 0;">${event.event}</h3>
  //       <p style="color: #64748b; margin: 8px 0;"><strong>Date & Time:</strong> ${eventDate}</p>
  //       <p style="color: #64748b; margin: 8px 0;"><strong>Type:</strong> ${getEventTypeInfo(event).label}</p>
  //       <p style="color: #64748b; margin: 8px 0;"><strong>Location:</strong> ${event.location || 'TBD'}</p>
  //       <p style="color: #64748b; margin:8px 0;"><strong>Urgency:</strong> ${event.urgency}</p>
  //       ${event.description ? `<p style="color: #64748b; margin: 8px 0;"><strong>Description:</strong> ${event.description}</p>` : ''}
  //       </div>
  //       <p style="color: #64748b; font-size: 14px;">This is an automated reminder from the North Creek TSA Portal.</p>
  //       </div>
  //     `;

  //     // Send email via API route
  //     const response = await fetch('/api/send-notification', {
  //       method: 'POST',
  //       headers: {
  //       'Content-Type': 'application/json',
  //       },
  //       body: JSON.stringify({
  //       to: user.email,
  //       subject,
  //       body,
  //       eventId: event.id
  //       }),
  //     });

  //     const result = await response.json();

  //     if (!response.ok) {
  //       console.error('API Error Response:', result);
  //       throw new Error(result.error || 'Failed to send email');
  //     }

  //     console.log('Email sent successfully:', result);
      
  //     // Show success message (you can add a toast notification here)
  //       alert('Test email sent successfully!');
      
  //   } catch (error) {
  //     console.error('Error sending notification email:', error);
  //     alert('Failed to send email. Please try again.');
  //   }
  // };

  const handleAddEvent = async () => {
    if (!selectedDate || !newEvent.title) return;
    
    try {
      // Combine date and time into a timestamp
      const dateTimeString = `${selectedDate}T${newEvent.time || '12:00'}:00`;
      
      

      // Insert event into Supabase calendar table with proper timezone handling
      // The input datetime-local is in local timezone, we need to append the current timezone offset
      const inputDate = new Date(dateTimeString);
      
      // Determine if we're currently in PST (-08) or PDT (-07)
      const january = new Date(inputDate.getFullYear(), 0, 1);
      const july = new Date(inputDate.getFullYear(), 6, 1);
      const isPST = inputDate.getTimezoneOffset() > Math.min(january.getTimezoneOffset(), july.getTimezoneOffset());
      const timezoneOffset = isPST ? '-08' : '-07';
      
      // Format the date string with timezone offset for Supabase timestamptz
      const dateWithTimezone = dateTimeString + timezoneOffset + ':00';

      // Create event object for database
      const eventData = {
        event: newEvent.title,
        date: dateWithTimezone, // Combined date+time as timestamp
        type: newEvent.type,
        urgency: newEvent.urgency,
        description: newEvent.description || '',
        location: newEvent.location, // Include location
        // reminderTime: newEvent.notifications.reminderTime
      };

      console.log("Event data:", eventData);

      const { data, error } = await supabase
        .from('calendar')
        .insert([eventData])
        .select()
        .single();

      if (error) {
        console.error('Error adding event:', error, "with event:", eventData);
        return;
      }

      // Create event object for local state
      const event: Event = {
        id: data.id,
        event: data.event,
        date: data.date,
        type: data.type,
        urgency: data.urgency,
        description: data.description,
        location: data.location || 'TBD', // Include location
        // reminderTime: data.reminderTime
      };

      setEvents([...events, event]);
      setShowAddModal(false);
          setNewEvent({ 
      title: '', 
      date: '',
      time: '12:00',
      type: 'meeting', 
      urgency: 'medium', 
      description: '', 
      location: '', // Reset location
      // notifications: {
      //   reminderTime: 60
      // }
    });
      setSelectedDate('');
    } catch (error) {
      console.error('Error adding event:', error);
    }
  };

  const handleDateClick = (day: number) => {
    if (!isAdmin) return; // Only admins can add events
    const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    setSelectedDate(dateStr);
    setShowAddModal(true);
  };

  const handleEventClick = (event: Event) => {
    setSelectedEvent(event);
    setShowEventDetailModal(true);
  };

  const deleteEvent = async (eventId: string) => {
    try {
      // Delete event from Supabase calendar table
      const { error } = await supabase
        .from('calendar')
        .delete()
        .eq('id', eventId);

      if (error) {
        console.error('Error deleting event:', error);
        return;
      }

      // Update local state
      setEvents(events.filter(event => event.id !== eventId));
      if (selectedEvent?.id === eventId) {
        setShowEventDetailModal(false);
        setSelectedEvent(null);
      }
    } catch (error) {
      console.error('Error deleting event:', error);
    }
  };

  // const updateEventNotifications = async (eventId: string, reminderTime: number) => {
  //   try {
  //     // Update event reminder time in Supabase calendar table
  //     const { error } = await supabase
  //       .from('calendar')
  //       .update({
  //         reminderTime: reminderTime
  //       })
  //       .eq('id', eventId);

  //     if (error) {
  //       console.error('Error updating event reminder time:', error);
  //       return;
  //     }

  //     // Update local state
  //     const updatedEvents = events.map(event => 
  //       event.id === eventId 
  //         ? { ...event, reminderTime }
  //         : event
  //       );
  //       setEvents(updatedEvents);
      
  //     if (selectedEvent?.id === eventId) {
  //       setSelectedEvent({ ...selectedEvent, reminderTime });
  //     }
  //   } catch (error) {
  //       console.error('Error updating event reminder time:', error);
  //   }
  // };

  const days = getDaysInMonth(currentDate);
  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  
  // Debug: Log current events state
  console.log('Current events state:', events);

  return (
    <div className="min-h-screen bg-[#0a101f] text-white">
      {/* Spacer for nav */}
      <div className="h-24" />

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div
          className="bg-[#181e29] rounded-2xl p-6 shadow-lg border border-[#232a3a] mb-8 relative"
          style={{ boxShadow: '0 0 10px 0 #3b82f6, 0 0 24px 0 #8b5cf6, 0 0 0 1px #232a3a' }}
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold mb-2">TSA Calendar</h1>
              <p className="text-gray-400">Stay organized with all your TSA events and deadlines</p>
            </div>
            {isAdmin && (
              <button
                onClick={() => setShowAddModal(true)}
                className="px-6 py-3 rounded-xl bg-gradient-to-r from-blue-500 to-violet-500 text-white font-semibold shadow hover:from-blue-600 hover:to-violet-600 transition flex items-center gap-2 cursor-pointer"
              >
                <PlusIcon className="w-5 h-5" />
                Add Event
              </button>
            )}
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Calendar */}
          <div className="lg:col-span-2">
            <div
              className="bg-[#181e29] rounded-2xl p-6 shadow-lg border border-[#232a3a] relative"
              style={{ boxShadow: '0 0 10px 0 #3b82f6, 0 0 24px 0 #8b5cf6, 0 0 0 1px #232a3a' }}
            >
              {/* Calendar Header */}
              <div className="flex items-center justify-between mb-6">
                <button
                  onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1))}
                  className="p-2 rounded-lg bg-[#232a3a] hover:bg-blue-900/30 transition cursor-pointer"
                >
                  <ChevronLeftIcon className="w-5 h-5" />
                </button>
                <h2 className="text-2xl font-bold">
                  {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
                </h2>
                <button
                  onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1))}
                  className="p-2 rounded-lg bg-[#232a3a] hover:bg-blue-900/30 transition cursor-pointer"
                >
                  <ChevronRightIcon className="w-5 h-5" />
                </button>
              </div>

              {/* Calendar Grid */}
              <div className="grid grid-cols-7 gap-1 mb-4">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                  <div key={day} className="p-3 text-center text-sm font-semibold text-gray-400">
                    {day}
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-7 gap-1">
                {days.map(({ day, key }) => {
                  if (!day) {
                    return <div key={key} className="h-16" />;
                  }

                  const dayEvents = getEventsForDate(day);
                  const isCurrentDay = isToday(day);

                  return (
                    <div
                      key={key}
                      onClick={() => handleDateClick(day)}
                      className={`h-16 p-1 transition-all relative group ${
                        isAdmin ? 'cursor-pointer hover:bg-[#232a3a] rounded-lg' : ''
                      } ${
                        isCurrentDay ? 'ring-2 ring-blue-500 rounded-lg' : ''
                      }`}
                    >
                      <div className={`text-sm font-medium mb-1 ${
                        isCurrentDay ? 'text-blue-400' : 'text-white'
                      }`}>
                        {day}
                      </div>
                      
                      {/* Event indicators */}
                      <div className="flex flex-wrap gap-1">
                        {dayEvents.slice(0, 3).map((event, eventIndex) => {
                          const eventTypeInfo = getEventTypeInfo(event);
                          return (
                            <div
                              key={`${event.id}-${eventIndex}`}
                              className={`w-2 h-2 rounded-full bg-gradient-to-r ${eventTypeInfo.color} ${
                                urgencyColors[event.urgency]
                              } border-2 relative`}
                              title={`${event.event} (${eventTypeInfo.label})${event.location ? ` - ${event.location}` : ''}`}
                            >
                              {/* Reminder indicator */}
                              {/* {event.reminderTime > 0 && (
                                <div className="absolute -top-1 -right-1 w-1.5 h-1.5 bg-yellow-400 rounded-full" />
                              )} */}
                            </div>
                          );
                        })}
                        {dayEvents.length > 3 && (
                          <div className="w-2 h-2 rounded-full bg-gray-500 text-xs flex items-center justify-center">
                            +
                          </div>
                        )}
                      </div>

                      {/* Hover tooltip */}
                      {dayEvents.length > 0 && (
                        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-[#232a3a] rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity z-10 min-w-max">
                          <div className="text-sm font-medium mb-1">Events:</div>
                          {dayEvents.map(event => {
                            const eventTypeInfo = getEventTypeInfo(event);
                            const eventTimePST = convertUTCToPST(event.date).toLocaleTimeString('en-US', {
                              hour: '2-digit',
                              minute: '2-digit',
                              hour12: true
                            });
                            return (
                              <div key={event.id} className="text-xs text-gray-300">
                                • {event.event} ({eventTypeInfo.label}) at {eventTimePST}
                                {event.location && (
                                  <span className="text-blue-400 ml-1">📍 {event.location}</span>
                                )}
                                {/* {event.reminderTime > 0 && (
                                  <span className="text-yellow-400 ml-1">🔔</span>
                                )} */}
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Event Legend */}
          <div className="lg:col-span-1">
            <div
              className="bg-[#181e29] rounded-2xl p-6 shadow-lg border border-[#232a3a] relative"
              style={{ boxShadow: '0 0 10px 0 #3b82f6, 0 0 24px 0 #8b5cf6, 0 0 0 1px #232a3a' }}
            >
              <h3 className="text-xl font-semibold mb-4">Event Types</h3>
              <div className="space-y-3">
                {Object.entries(eventTypes).map(([key, value]) => (
                  <div key={key} className="flex items-center gap-3">
                    <div className={`w-4 h-4 rounded-full bg-gradient-to-r ${value.color}`} />
                    <span className="text-sm">{value.label}</span>
                  </div>
                ))}
              </div>

              <h3 className="text-xl font-semibold mb-4 mt-6">Urgency Levels</h3>
              <div className="space-y-3">
                {Object.entries(urgencyColors).map(([key, value]) => (
                  <div key={key} className="flex items-center gap-3">
                    <div className={`w-4 h-4 rounded-full border-2 ${value}`} />
                    <span className="text-sm capitalize">{key}</span>
                  </div>
                ))}
              </div>

              {/* <h3 className="text-xl font-semibold mb-4 mt-6">Notifications</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 rounded-full bg-yellow-400 relative">
                    <div className="absolute -top-1 -right-1 w-1.5 h-1.5 bg-yellow-400 rounded-full" />
                  </div>
                  <span className="text-sm">Email notifications enabled</span>
                </div>
              </div> */}


            </div>
          </div>
        </div>

        {/* Events Table */}
        <div className="mt-8">
          <div
            className="bg-[#181e29] rounded-2xl p-6 shadow-lg border border-[#232a3a] relative"
            style={{ boxShadow: '0 0 10px 0 #3b82f6, 0 0 24px 0 #8b5cf6, 0 0 0 1px #232a3a' }}
          >
            <h3 className="text-xl font-semibold mb-6">All Events</h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[#232a3a]">
                    <th className="text-left p-3 text-gray-400 font-medium">Date</th>
                    <th className="text-left p-3 text-gray-400 font-medium">Event</th>
                    <th className="text-left p-3 text-gray-400 font-medium">Type</th>
                    <th className="text-left p-3 text-gray-400 font-medium">Location</th>
                    <th className="text-left p-3 text-gray-400 font-medium">Urgency</th>
                    {/* <th className="text-left p-3 text-gray-400 font-medium">Notifications</th> */}
                    <th className="text-left p-3 text-gray-400 font-medium">Description</th>
                    {isAdmin && (
                      <th className="text-left p-3 text-gray-400 font-medium">Actions</th>
                    )}
                  </tr>
                </thead>
                <tbody>
                  {events
                    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
                    .map(event => {
                      const eventTypeInfo = getEventTypeInfo(event);
                      // const notificationOption = notificationOptions.find(opt => opt.value === event.reminderTime);
                      return (
                        <tr 
                          key={event.id} 
                          className={`border-b border-[#232a3a] transition ${
                            isAdmin ? 'hover:bg-[#232a3a]/50 cursor-pointer' : ''
                          }`}
                          onClick={() => isAdmin && handleEventClick(event)}
                        >
                          <td className="p-3">
                            <div className="text-sm font-medium">
                            {convertUTCToPST(event.date).toLocaleString('en-US', { 
                              month: 'short', 
                              day: 'numeric',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                              hour12: true
                            })}
                            </div>
                          </td>
                          <td className="p-3">
                            <div className="font-medium">{event.event}</div>
                          </td>
                          <td className="p-3">
                            <div className="inline-flex">
                              <span className={`px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r ${eventTypeInfo.color} whitespace-nowrap`}>
                                {eventTypeInfo.label}
                              </span>
                            </div>
                          </td>
                          <td className="p-3">
                            <div className="text-sm text-gray-300 max-w-xs truncate">
                              {`📍 ${event.location}` || 'No location'}
                            </div>
                          </td>
                          <td className="p-3">
                            <span className={`px-3 py-1 rounded-full text-xs font-medium border-2 ${urgencyColors[event.urgency]} capitalize`}>
                              {event.urgency}
                            </span>
                          </td>
                          {/* <td className="p-3">
                            <div className="flex items-center gap-2"> */}
                              {/* Notification Toggle */}
                              {/* <input
                                type="checkbox"
                                checked={event.reminderTime > 0}
                                onChange={async (e) => {
                                  const newTime = e.target.checked ? 60 : 0; // Default to 1 hour if enabling
                                  await updateEventNotifications(event.id, newTime);
                                }}
                                className="form-checkbox h-5 w-5 text-blue-500 rounded"
                                title={event.reminderTime > 0 ? 'Disable notifications' : 'Enable notifications'}
                                disabled={!emailNotifications}
                              />
                              {/* Reminder Time Dropdown */}
                              {/* <select
                                value={event.reminderTime}
                                onChange={async (e) => {
                                  await updateEventNotifications(event.id, parseInt(e.target.value));
                                }}
                                className="p-1 rounded bg-[#232a3a] border border-[#3a4151] text-xs text-gray-200"
                                disabled={event.reminderTime === 0 || !emailNotifications}
                                title="Set reminder time"
                              >
                                {notificationOptions.map(option => (
                                  <option key={option.value} value={option.value}>
                                    {option.label}
                                  </option>
                                ))}
                              </select> */}
                              {/* <span className="text-gray-500 text-sm">Notifications disabled</span>
                            </div>
                          </td> */}
                          <td className="p-3">
                            <div className="text-sm text-gray-400 max-w-xs truncate">
                              {event.description || 'No description'}
                            </div>
                          </td>
                          {isAdmin && (
                            <td className="p-3">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  deleteEvent(event.id);
                                }}
                                className="p-2 rounded-lg bg-red-500/20 hover:bg-red-500/30 transition text-red-400"
                              >
                                <XMarkIcon className="w-4 h-4" />
                              </button>
                            </td>
                          )}
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Add Event Modal - Only show for admins */}
      {showAddModal && isAdmin && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 custom-scrollbar">
          <div
            className="bg-[#181e29] rounded-2xl p-6 shadow-lg border border-[#232a3a] w-full max-w-sm relative max-h-[90vh] overflow-y-auto"
            style={{ boxShadow: '0 0 10px 0 #3b82f6, 0 0 24px 0 #8b5cf6, 0 0 0 1px #232a3a' }}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Add New Event</h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-2 rounded-lg bg-[#232a3a] hover:bg-red-500/20 transition cursor-pointer"
              >
                <XMarkIcon className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium mb-1">Date</label>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="w-full p-2 rounded-lg bg-[#232a3a] border border-[#3a4151] focus:border-blue-500 focus:outline-none text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Time</label>
                <input
                  type="time"
                  value={newEvent.time}
                  onChange={e => setNewEvent({ ...newEvent, time: e.target.value })}
                  className="w-full p-2 rounded-lg bg-[#232a3a] border border-[#3a4151] focus:border-blue-500 focus:outline-none text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Event Title</label>
                <input
                  type="text"
                  value={newEvent.title}
                  onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                  placeholder="Enter event title"
                  className="w-full p-2 rounded-lg bg-[#232a3a] border border-[#3a4151] focus:border-blue-500 focus:outline-none text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Event Type</label>
                <select
                  value={newEvent.type in eventTypes ? newEvent.type : 'custom'}
                  onChange={e => {
                    if (e.target.value === 'custom') {
                      setNewEvent({ ...newEvent, type: '' });
                    } else {
                      setNewEvent({ ...newEvent, type: e.target.value });
                    }
                  }}
                  className="w-full p-2 rounded-lg bg-[#232a3a] border border-[#3a4151] focus:border-blue-500 focus:outline-none text-sm"
                >
                  {Object.entries(eventTypes).map(([key, value]) => (
                    <option key={key} value={key}>{value.label}</option>
                  ))}
                  <option value="custom">Custom</option>
                </select>
              </div>
              {!(newEvent.type in eventTypes) && (
                <div>
                  <label className="block text-sm font-medium mb-1">Custom Event Type</label>
                  <input
                    type="text"
                    value={newEvent.type}
                    onChange={e => setNewEvent({ ...newEvent, type: e.target.value })}
                    placeholder="Enter custom event type"
                    className="w-full p-2 rounded-lg bg-[#232a3a] border border-[#3a4151] focus:border-blue-500 focus:outline-none text-sm"
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium mb-1">Urgency</label>
                <select
                  value={newEvent.urgency}
                  onChange={(e) => setNewEvent({ ...newEvent, urgency: e.target.value as Event['urgency'] })}
                  className="w-full p-2 rounded-lg bg-[#232a3a] border border-[#3a4151] focus:border-blue-500 focus:outline-none text-sm"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Description (Optional)</label>
                <textarea
                  value={newEvent.description}
                  onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
                  placeholder="Enter event description"
                  rows={2}
                  className="w-full p-2 rounded-lg bg-[#232a3a] border border-[#3a4151] focus:border-blue-500 focus:outline-none resize-none text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Location</label>
                <input
                  type="text"
                  value={newEvent.location}
                  onChange={(e) => setNewEvent({ ...newEvent, location: e.target.value })}
                  placeholder="Enter event location"
                  className="w-full p-2 rounded-lg bg-[#232a3a] border border-[#3a4151] focus:border-blue-500 focus:outline-none text-sm"
                  required
                />
              </div>

              {/* Reminder Settings */}
              {/* <div className="border-t border-[#232a3a] pt-3">
                <div className="flex items-center gap-2 mb-2">
                  <BellIcon className="w-4 h-4 text-yellow-400" />
                  <label className="text-sm font-medium">Reminder Settings</label>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">Reminder Time</label>
                  <select
                    value={newEvent.notifications.reminderTime}
                    onChange={(e) => setNewEvent({
                      ...newEvent,
                      notifications: {
                        ...newEvent.notifications,
                        reminderTime: parseInt(e.target.value)
                      }
                    })}
                    className="w-full p-2 rounded-lg bg-[#232a3a] border border-[#3a4151] focus:border-blue-500 focus:outline-none text-sm"
                  >
                    {notificationOptions.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div> */}

              <div className="flex gap-2 pt-3">
                <button
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 px-3 py-2 rounded-lg bg-[#232a3a] hover:bg-gray-700 transition text-sm cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddEvent}
                  disabled={!selectedDate || !newEvent.title || !newEvent.location}
                  className="flex-1 px-3 py-2 rounded-lg bg-gradient-to-r from-blue-500 to-violet-500 text-white font-semibold hover:from-blue-600 hover:to-violet-600 transition disabled:opacity-50 disabled:cursor-not-allowed text-sm cursor-pointer"
                >
                  Add Event
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Event Detail Modal - Only show for admins */}
      {showEventDetailModal && selectedEvent && isAdmin && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div
            className="bg-[#181e29] rounded-2xl p-6 shadow-lg border border-[#232a3a] w-full max-w-md relative max-h-[90vh] overflow-y-auto"
            style={{ boxShadow: '0 0 10px 0 #3b82f6, 0 0 24px 0 #8b5cf6, 0 0 0 1px #232a3a' }}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Event Details</h3>
              <button
                onClick={() => setShowEventDetailModal(false)}
                className="p-2 rounded-lg bg-[#232a3a] hover:bg-red-500/20 transition"
              >
                <XMarkIcon className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-400">Event Title</label>
                <div className="text-lg font-semibold">{selectedEvent.event}</div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1 text-gray-400">Date</label>
                <div className="text-sm">
                {convertUTCToPST(selectedEvent.date).toLocaleDateString('en-US', { 
                  weekday: 'long',
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric'
                })}
                </div>
              </div>

              <div className="flex gap-3">
                <div className="flex-1">
                  <label className="block text-sm font-medium mb-1 text-gray-400">Type</label>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r ${getEventTypeInfo(selectedEvent).color}`}>
                    {getEventTypeInfo(selectedEvent).label}
                  </span>
                </div>
                <div className="flex-1">
                  <label className="block text-sm font-medium mb-1 text-gray-400">Urgency</label>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium border-2 ${urgencyColors[selectedEvent.urgency]} capitalize`}>
                    {selectedEvent.urgency}
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1 text-gray-400">Location</label>
                <div className="text-sm text-gray-300">
                  {selectedEvent.location || 'No location specified'}
                </div>
              </div>

              {/* Reminder Settings */}
              {/* <div className="border-t border-[#232a3a] pt-3">
                <div className="flex items-center gap-2 mb-2">
                  <BellIcon className="w-4 h-4 text-yellow-400" />
                  <label className="text-sm font-medium text-gray-400">Reminder Settings</label>
                </div>
                
                <div className="space-y-2">
                  <div>
                    <label className="block text-sm font-medium mb-1">Reminder Time</label>
                    <select
                      value={selectedEvent.reminderTime || 60}
                      onChange={(e) => updateEventNotifications(selectedEvent.id, parseInt(e.target.value))}
                      className="w-full p-3 rounded-lg bg-[#232a3a] border border-[#3a4151] focus:border-blue-500 focus:outline-none text-sm"
                    >
                      {notificationOptions.map(option => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => sendNotificationEmail(selectedEvent)}
                      className="px-3 py-1 rounded-lg bg-blue-500/20 hover:bg-blue-500/30 transition text-blue-400 text-xs"
                    >
                      Send Test Email
                    </button>
                  </div>
                </div>
              </div> */}

              {selectedEvent.description && (
                <div>
                  <label className="block text-sm font-medium mb-1 text-gray-400">Description</label>
                  <div className="text-sm text-gray-300 leading-relaxed">
                    {selectedEvent.description}
                  </div>
                </div>
              )}

              <div className="flex gap-2 pt-4">
                <button
                  onClick={() => setShowEventDetailModal(false)}
                  className="flex-1 px-3 py-2 rounded-lg bg-[#232a3a] hover:bg-gray-700 transition text-sm"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    deleteEvent(selectedEvent.id);
                    setShowEventDetailModal(false);
                  }}
                  className="flex-1 px-3 py-2 rounded-lg bg-red-500/20 hover:bg-red-500/30 transition text-red-400 text-sm"
                >
                  Delete Event
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 