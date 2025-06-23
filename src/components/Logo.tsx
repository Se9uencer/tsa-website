import { GlobeAltIcon } from '@heroicons/react/24/solid';

export default function Logo({ className = '' }: { className?: string }) {
  return (
    <GlobeAltIcon className={`w-12 h-12 text-blue-600 dark:text-blue-400 ${className}`} />
  );
} 