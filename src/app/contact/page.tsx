"use client"
import Link from 'next/link';
export default function Contact() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#0a101f] py-8 pt-24 px-4">
      <h1 className="text-4xl font-bold text-white mt-8 mb-8">Contact Us
      </h1>
      <iframe 
        src="https://docs.google.com/forms/d/e/1FAIpQLSd1As8356TsfvF9lXdUMgjXmdNmqltrTC9t55q1Qv6wZ8Mwog/viewform?embedded=true"
        className="w-full max-w-3xl flex-1 min-h-[70vh] rounded-xl border border-[#232a3a] shadow-lg py-2 md:py-4"
        style={{ background: '#1a2b57', boxShadow: '0 0 10px 0 #3b82f6, 0 0 24px 0 #8b5cf6, 0 0 0 1px #232a3a' }}
        allowFullScreen
      >
        Loading…
      </iframe>
    </div>
  );
} 