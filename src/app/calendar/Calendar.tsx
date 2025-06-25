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

  // ... rest of the Calendar component code from page.tsx ...
} 