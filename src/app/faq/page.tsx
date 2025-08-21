'use client';
import { useState, useEffect } from 'react';
import { FiSearch, FiPlus, FiMinus } from 'react-icons/fi';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';

// Remove initialQuestions and add FAQ type
type FAQItem = { question: string; answer: string };

export default function FAQ() {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [openIndexes, setOpenIndexes] = useState<number[]>([]);
  const [faqs, setFaqs] = useState<FAQItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const checkUser = async () => {
      const { data, error } = await supabase.auth.getUser();
      if (error || !data.user) {
        router.replace('/signin');
      }
    };
    checkUser();
  }, [router]);

  useEffect(() => {
    const fetchFaqs = async () => {
      setLoading(true);
      setError(null);
      const { data, error } = await supabase
        .from('faqs')
        .select('question, answer')
        .order('id', { ascending: true }); // Order by id ascending
      if (error) {
        console.log(error);
        setError('Failed to load FAQs.');
        setFaqs([]);
      } else {
        setFaqs(
          (data || []).map((row: any) => ({
            question: row.question,
            answer: row.answer,
          }))
        );
      }
      setLoading(false);
    };
    fetchFaqs();

    console.log(faqs);
  }, []);

  // Filter questions by search
  const filteredQuestions = faqs.filter(q =>
    q.question.toLowerCase().includes(search.toLowerCase())
  );

  const toggleOpen = (idx: number) => {
    setOpenIndexes(prev =>
      prev.includes(idx) ? prev.filter(i => i !== idx) : [...prev, idx]
    );
  };

  // Add helper to parse answer text and render links
  function renderAnswerWithLinks(answer: string) {
    // Regex to match [text + url]
    const linkRegex = /\[(.*?)\s*\+\s*(.*?)\]/g;
    const parts: (string | { text: string; url: string })[] = [];
    let lastIndex = 0;
    let match;
    while ((match = linkRegex.exec(answer)) !== null) {
      if (match.index > lastIndex) {
        parts.push(answer.slice(lastIndex, match.index));
      }
      parts.push({ text: match[1].trim(), url: match[2].trim() });
      lastIndex = match.index + match[0].length;
    }
    if (lastIndex < answer.length) {
      parts.push(answer.slice(lastIndex));
    }
    return parts.map((part, i) =>
      typeof part === 'string'
        ? part
        : (
            <a
              key={i}
              href={part.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-400 underline hover:text-purple-300 transition-colors"
            >
              {part.text}
            </a>
          )
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center py-30 px-2 bg-[#0a101f]">
      <h1 className="text-4xl font-bold text-white mb-10 text-center">Frequently Asked Questions</h1>
      {/* <div className="w-full max-w-2xl mb-15 px-4 md:px-0">
        <div className="flex items-center bg-[#181e29] border border-[#232a3a] rounded-lg px-6 py-2" style={{ boxShadow: '0 0 10px 0 #5647fd, 0 0 10px 0 #8b5cf6, 0 0 0 1px #232a3a' }}>
          <input
            type="text"
            placeholder="Search for a question..."
            className="flex-1 bg-transparent outline-none text-lg text-white placeholder-gray-400 italic"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          <FiSearch className="text-xl text-purple-300" />
        </div>
      </div> */}
      <div className="w-full max-w-2xl flex flex-col gap-6 px-4 md:px-0">
        {loading ? (
          <div className="text-center text-lg text-gray-300">Loading...</div>
        ) : error ? (
          <div className="text-center text-lg text-red-400">{error}</div>
        ) : filteredQuestions.length === 0 ? (
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
                <span className="text-lg md:text-xl font-semibold text-blue-400 text-start max-w-[80%]">
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
                {renderAnswerWithLinks(q.answer)}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
} 