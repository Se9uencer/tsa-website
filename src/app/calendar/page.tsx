import { Suspense } from 'react';
import Calendar from './Calendar';

export default function CalendarPage() {
  return (
    <Suspense fallback={<div>Loading calendar...</div>}>
      <Calendar />
    </Suspense>
  );
} 