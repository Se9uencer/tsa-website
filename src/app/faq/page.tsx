'use client';
import { useState } from 'react';
import { FiSearch, FiPlus, FiMinus } from 'react-icons/fi';

// Mocked questions for now; replace with Supabase fetch in the future
const initialQuestions = [
  {
    question: 'How can I contact North Creek TSA?',
    answer: 'You can contact North Creek TSA by emailing northcreektsa@gmail.com or reaching out through our website contact form.'
  },
  {
    question: 'How can I contact North Creek TSA?',
    answer: 'You can contact North Creek TSA by emailing northcreektsa@gmail.com or reaching out through our website contact form.'
  },
  {
    question: 'How can I contact North Creek TSA?',
    answer: 'You can contact North Creek TSA by emailing northcreektsa@gmail.com or reaching out through our website contact form.'
  },
  {
    question: 'How can I contact North Creek TSA?',
    answer: 'You can contact North Creek TSA by emailing northcreektsa@gmail.com or reaching out through our website contact form.'
  },
];

export default function FAQ() {
  const [search, setSearch] = useState('');
  const [openIndexes, setOpenIndexes] = useState<number[]>([]);

  // Filter questions by search
  const filteredQuestions = initialQuestions.filter(q =>
    q.question.toLowerCase().includes(search.toLowerCase())
  );

  const toggleOpen = (idx: number) => {
    setOpenIndexes(prev =>
      prev.includes(idx) ? prev.filter(i => i !== idx) : [...prev, idx]
    );
  };

  return (
    <div className="min-h-screen flex flex-col items-center py-30 px-2 bg-[#0a101f]">
      <h1 className="text-4xl font-bold text-white mb-10 text-center">Frequently Asked Questions</h1>
      <div className="w-full max-w-2xl mb-15">
        <div className="flex items-center bg-[#181e29] border border-[#232a3a] rounded-lg px-6 py-2" style={{ boxShadow: '0 0 10px 0 #5647fd, 0 0 10px 0 #8b5cf6, 0 0 0 1px #232a3a' }}>
          <input
            type="text"
            placeholder="Search for a question..."
            className="flex-1 bg-transparent outline-none text-lg text-white placeholder-gray-400"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          <FiSearch className="text-xl text-purple-300" />
        </div>
      </div>
      <div className="w-full max-w-2xl flex flex-col gap-6">
        {filteredQuestions.length === 0 ? (
          <div className="text-center text-lg text-gray-300">No questions found.</div>
        ) : (
          filteredQuestions.map((q, idx) => (
            <div
              key={idx}
              className="rounded-xl border bg-[#181e29] overflow-hidden transition-all border-[#232a3a]"
              style={{ boxShadow: '0 0 10px 0 #3b82f6, 0 0 10px 0 #8b5cf6, 0 0 0 1px #232a3a' }}
            >
              <button
                className="w-full flex items-center justify-between px-8 py-5 focus:outline-none hover:cursor-pointer"
                onClick={() => toggleOpen(idx)}
              >
                <span className="text-lg md:text-xl font-semibold text-blue-400">
                  <span className="text-purple-300">Q:</span> {q.question}
                </span>
                <span className="text-2xl text-purple-300">
                  {openIndexes.includes(idx) ? <FiMinus /> : <FiPlus />}
                </span>
              </button>
              <div
                className={`px-8 text-md text-purple-100 transition-all duration-300 ease-linear overflow-hidden ${openIndexes.includes(idx) ? 'max-h-40 opacity-100 pb-6' : 'max-h-0 opacity-0 pb-0'}`}
                style={{ pointerEvents: openIndexes.includes(idx) ? 'auto' : 'none' }}
              >
                {q.answer}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
} 