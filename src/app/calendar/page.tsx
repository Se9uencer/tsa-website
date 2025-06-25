'use client';
import { useState, useEffect } from 'react';
import { ChevronLeftIcon, ChevronRightIcon, PlusIcon, XMarkIcon, BellIcon } from '@heroicons/react/24/solid';
import { supabase } from '@/lib/supabaseClient';
import { useSearchParams } from 'next/navigation';

interface Event {
  id: string;
  title: string;
  date: string;
  type: 'meeting' | 'due_date' | 'conference' | 'workshop' | 'custom';
  urgency: 'low' | 'medium' | 'high';
  description?: string;
  customCategory?: string;
  notifications?: {
    enabled: boolean;
    reminderTime: number; // minutes before event
    emailSent?: boolean;
  };
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

const notificationOptions = [
  { value: 0, label: 'No reminder' },
  { value: 15, label: '15 minutes before' },
  { value: 30, label: '30 minutes before' },
  { value: 60, label: '1 hour before' },
  { value: 1440, label: '1 day before' },
  { value: 2880, label: '2 days before' },
  { value: 10080, label: '1 week before' }
];

export default function Calendar() {
  const searchParams = useSearchParams();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState<Event[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEventDetailModal, setShowEventDetailModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [newEvent, setNewEvent] = useState({
    title: '',
    type: 'meeting' as Event['type'],
    urgency: 'medium' as Event['urgency'],
    description: '',
    customCategory: '',
    notifications: {
      enabled: false,
      reminderTime: 60
    }
  });

  // Sample events - in a real app, these would come from the database
  useEffect(() => {
    const sampleEvents: Event[] = [
      {
        id: '1',
        title: 'TSA Regional Conference',
        date: '2024-12-15',
        type: 'conference',
        urgency: 'high',
        description: 'Annual regional TSA conference with competitions and workshops. This is a major event where teams from different schools compete in various STEM categories including robotics, web design, and engineering challenges.',
        notifications: {
          enabled: true,
          reminderTime: 10080, // 1 week before
          emailSent: false
        }
      },
      {
        id: '2',
        title: 'Project Submission Deadline',
        date: '2024-12-20',
        type: 'due_date',
        urgency: 'high',
        description: 'Final deadline for all competition project submissions. Make sure all documentation, code, and presentation materials are submitted by this date. Late submissions will not be accepted.',
        notifications: {
          enabled: true,
          reminderTime: 1440, // 1 day before
          emailSent: false
        }
      },
      {
        id: '3',
        title: 'Weekly Club Meeting',
        date: '2024-12-10',
        type: 'meeting',
        urgency: 'medium',
        description: 'Regular weekly TSA club meeting where we discuss upcoming events, project progress, and team coordination. All members are encouraged to attend and share updates.',
        notifications: {
          enabled: true,
          reminderTime: 30, // 30 minutes before
          emailSent: false
        }
      },
      {
        id: '4',
        title: 'STEM Workshop',
        date: '2024-12-25',
        type: 'workshop',
        urgency: 'low',
        description: 'Hands-on STEM workshop for members focusing on advanced programming concepts and robotics engineering. This workshop will help prepare teams for upcoming competitions.',
        notifications: {
          enabled: false,
          reminderTime: 60,
          emailSent: false
        }
      }
    ];
    setEvents(sampleEvents);

    // Check if there's an event ID in the URL (from dashboard)
    const eventId = searchParams.get('event');
    if (eventId) {
      const event = sampleEvents.find(e => e.id === eventId);
      if (event) {
        setSelectedEvent(event);
        setShowEventDetailModal(true);
      }
    }
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
    return events.filter(event => event.date === dateStr);
  };

  const isToday = (day: number) => {
    const today = new Date();
    return day === today.getDate() && 
           currentDate.getMonth() === today.getMonth() && 
           currentDate.getFullYear() === today.getFullYear();
  };

  const getEventTypeInfo = (event: Event) => {
    if (event.type === 'custom' && event.customCategory) {
      return { label: event.customCategory, color: 'from-indigo-500 to-indigo-600' };
    }
    return eventTypes[event.type] || eventTypes.meeting;
  };

  const sendNotificationEmail = async (event: Event) => {
    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user?.email) return;

      // In a real implementation, you would:
      // 1. Use Supabase Edge Functions or a service like Resend/SendGrid
      // 2. Send the email with event details
      // 3. Update the event to mark email as sent
      
      console.log(`Sending notification email to ${user.email} for event: ${event.title}`);
      
      // For now, we'll just simulate the email being sent
      const updatedEvents = events.map(e => 
        e.id === event.id 
          ? { 
              ...e, 
              notifications: { 
                ...e.notifications, 
                emailSent: true 
              } as Event['notifications']
            }
          : e
      );
      setEvents(updatedEvents);
      
    } catch (error) {
      console.error('Error sending notification email:', error);
    }
  };

  const handleAddEvent = () => {
    if (!selectedDate || !newEvent.title) return;
    
    const event: Event = {
      id: Date.now().toString(),
      title: newEvent.title,
      date: selectedDate,
      type: newEvent.type,
      urgency: newEvent.urgency,
      description: newEvent.description,
      customCategory: newEvent.customCategory,
      notifications: newEvent.notifications
    };
    
    setEvents([...events, event]);
    setShowAddModal(false);
    setNewEvent({ 
      title: '', 
      type: 'meeting', 
      urgency: 'medium', 
      description: '', 
      customCategory: '',
      notifications: {
        enabled: false,
        reminderTime: 60
      }
    });
    setSelectedDate('');
  };

  const handleDateClick = (day: number) => {
    const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    setSelectedDate(dateStr);
    setShowAddModal(true);
  };

  const handleEventClick = (event: Event) => {
    setSelectedEvent(event);
    setShowEventDetailModal(true);
  };

  const deleteEvent = (eventId: string) => {
    setEvents(events.filter(event => event.id !== eventId));
    if (selectedEvent?.id === eventId) {
      setShowEventDetailModal(false);
      setSelectedEvent(null);
    }
  };

  const updateEventNotifications = (eventId: string, notifications: Event['notifications']) => {
    const updatedEvents = events.map(event => 
      event.id === eventId 
        ? { ...event, notifications }
        : event
    );
    setEvents(updatedEvents);
    
    if (selectedEvent?.id === eventId) {
      setSelectedEvent({ ...selectedEvent, notifications });
    }
  };

  const days = getDaysInMonth(currentDate);
  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

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
            <button
              onClick={() => setShowAddModal(true)}
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-blue-500 to-violet-500 text-white font-semibold shadow hover:from-blue-600 hover:to-violet-600 transition flex items-center gap-2"
            >
              <PlusIcon className="w-5 h-5" />
              Add Event
            </button>
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
                  className="p-2 rounded-lg bg-[#232a3a] hover:bg-blue-900/30 transition"
                >
                  <ChevronLeftIcon className="w-5 h-5" />
                </button>
                <h2 className="text-2xl font-bold">
                  {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
                </h2>
                <button
                  onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1))}
                  className="p-2 rounded-lg bg-[#232a3a] hover:bg-blue-900/30 transition"
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
                      className={`h-16 p-1 cursor-pointer transition-all hover:bg-[#232a3a] rounded-lg relative group ${
                        isCurrentDay ? 'ring-2 ring-blue-500' : ''
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
                              title={`${event.title} (${eventTypeInfo.label})`}
                            >
                              {/* Notification indicator */}
                              {event.notifications?.enabled && (
                                <div className="absolute -top-1 -right-1 w-1.5 h-1.5 bg-yellow-400 rounded-full" />
                              )}
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
                            return (
                              <div key={event.id} className="text-xs text-gray-300">
                                • {event.title} ({eventTypeInfo.label})
                                {event.notifications?.enabled && (
                                  <span className="text-yellow-400 ml-1">🔔</span>
                                )}
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

              <h3 className="text-xl font-semibold mb-4 mt-6">Notifications</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 rounded-full bg-yellow-400 relative">
                    <div className="absolute -top-1 -right-1 w-1.5 h-1.5 bg-yellow-400 rounded-full" />
                  </div>
                  <span className="text-sm">Email notifications enabled</span>
                </div>
              </div>
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
                    <th className="text-left p-3 text-gray-400 font-medium">Urgency</th>
                    <th className="text-left p-3 text-gray-400 font-medium">Notifications</th>
                    <th className="text-left p-3 text-gray-400 font-medium">Description</th>
                    <th className="text-left p-3 text-gray-400 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {events
                    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
                    .map(event => {
                      const eventTypeInfo = getEventTypeInfo(event);
                      const notificationOption = notificationOptions.find(opt => opt.value === event.notifications?.reminderTime);
                      return (
                        <tr 
                          key={event.id} 
                          className="border-b border-[#232a3a] hover:bg-[#232a3a]/50 transition cursor-pointer"
                          onClick={() => handleEventClick(event)}
                        >
                          <td className="p-3">
                            <div className="text-sm font-medium">
                              {new Date(event.date + 'T00:00:00').toLocaleDateString('en-US', { 
                                month: 'short', 
                                day: 'numeric',
                                year: 'numeric'
                              })}
                            </div>
                          </td>
                          <td className="p-3">
                            <div className="font-medium">{event.title}</div>
                          </td>
                          <td className="p-3">
                            <span className={`px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r ${eventTypeInfo.color}`}>
                              {eventTypeInfo.label}
                            </span>
                          </td>
                          <td className="p-3">
                            <span className={`px-3 py-1 rounded-full text-xs font-medium border-2 ${urgencyColors[event.urgency]} capitalize`}>
                              {event.urgency}
                            </span>
                          </td>
                          <td className="p-3">
                            <div className="flex items-center gap-2">
                              {event.notifications?.enabled ? (
                                <>
                                  <BellIcon className="w-4 h-4 text-yellow-400" />
                                  <span className="text-xs text-gray-300">
                                    {notificationOption?.label}
                                  </span>
                                </>
                              ) : (
                                <span className="text-xs text-gray-500">None</span>
                              )}
                            </div>
                          </td>
                          <td className="p-3">
                            <div className="text-sm text-gray-400 max-w-xs truncate">
                              {event.description || 'No description'}
                            </div>
                          </td>
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
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Add Event Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div
            className="bg-[#181e29] rounded-2xl p-6 shadow-lg border border-[#232a3a] w-full max-w-sm relative max-h-[90vh] overflow-y-auto"
            style={{ boxShadow: '0 0 10px 0 #3b82f6, 0 0 24px 0 #8b5cf6, 0 0 0 1px #232a3a' }}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Add New Event</h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-2 rounded-lg bg-[#232a3a] hover:bg-red-500/20 transition"
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
                  value={newEvent.type}
                  onChange={(e) => setNewEvent({ ...newEvent, type: e.target.value as Event['type'] })}
                  className="w-full p-2 rounded-lg bg-[#232a3a] border border-[#3a4151] focus:border-blue-500 focus:outline-none text-sm"
                >
                  {Object.entries(eventTypes).map(([key, value]) => (
                    <option key={key} value={key}>{value.label}</option>
                  ))}
                  <option value="custom">Custom Category</option>
                </select>
              </div>

              {newEvent.type === 'custom' && (
                <div>
                  <label className="block text-sm font-medium mb-1">Custom Category Name</label>
                  <input
                    type="text"
                    value={newEvent.customCategory}
                    onChange={(e) => setNewEvent({ ...newEvent, customCategory: e.target.value })}
                    placeholder="Enter custom category name"
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

              {/* Notification Settings */}
              <div className="border-t border-[#232a3a] pt-3">
                <div className="flex items-center gap-2 mb-2">
                  <BellIcon className="w-4 h-4 text-yellow-400" />
                  <label className="text-sm font-medium">Email Notifications</label>
                </div>
                
                <div className="space-y-2">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={newEvent.notifications.enabled}
                      onChange={(e) => setNewEvent({
                        ...newEvent,
                        notifications: {
                          ...newEvent.notifications,
                          enabled: e.target.checked
                        }
                      })}
                      className="rounded border-[#3a4151] bg-[#232a3a] text-blue-500 focus:ring-blue-500"
                    />
                    <span className="text-sm">Enable email reminders</span>
                  </label>

                  {newEvent.notifications.enabled && (
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
                  )}
                </div>
              </div>

              <div className="flex gap-2 pt-3">
                <button
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 px-3 py-2 rounded-lg bg-[#232a3a] hover:bg-gray-700 transition text-sm"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddEvent}
                  disabled={!selectedDate || !newEvent.title || (newEvent.type === 'custom' && !newEvent.customCategory)}
                  className="flex-1 px-3 py-2 rounded-lg bg-gradient-to-r from-blue-500 to-violet-500 text-white font-semibold hover:from-blue-600 hover:to-violet-600 transition disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                >
                  Add Event
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Event Detail Modal */}
      {showEventDetailModal && selectedEvent && (
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
                <div className="text-lg font-semibold">{selectedEvent.title}</div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1 text-gray-400">Date</label>
                <div className="text-sm">
                  {new Date(selectedEvent.date + 'T00:00:00').toLocaleDateString('en-US', { 
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

              {/* Notification Settings */}
              <div className="border-t border-[#232a3a] pt-3">
                <div className="flex items-center gap-2 mb-2">
                  <BellIcon className="w-4 h-4 text-yellow-400" />
                  <label className="text-sm font-medium text-gray-400">Email Notifications</label>
                </div>
                
                <div className="space-y-2">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={selectedEvent.notifications?.enabled || false}
                      onChange={(e) => updateEventNotifications(selectedEvent.id, {
                        enabled: e.target.checked,
                        reminderTime: selectedEvent.notifications?.reminderTime || 60,
                        emailSent: selectedEvent.notifications?.emailSent
                      })}
                      className="rounded border-[#3a4151] bg-[#232a3a] text-blue-500 focus:ring-blue-500"
                    />
                    <span className="text-sm">Enable email reminders</span>
                  </label>

                  {selectedEvent.notifications?.enabled && (
                    <div>
                      <label className="block text-sm font-medium mb-1">Reminder Time</label>
                      <select
                        value={selectedEvent.notifications.reminderTime || 60}
                        onChange={(e) => updateEventNotifications(selectedEvent.id, {
                          enabled: selectedEvent.notifications?.enabled || false,
                          reminderTime: parseInt(e.target.value),
                          emailSent: selectedEvent.notifications?.emailSent
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
                  )}

                  {selectedEvent.notifications?.enabled && (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => sendNotificationEmail(selectedEvent)}
                        className="px-3 py-1 rounded-lg bg-blue-500/20 hover:bg-blue-500/30 transition text-blue-400 text-xs"
                      >
                        Send Test Email
                      </button>
                      {selectedEvent.notifications.emailSent && (
                        <span className="text-xs text-green-400">✓ Email sent</span>
                      )}
                    </div>
                  )}
                </div>
              </div>

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