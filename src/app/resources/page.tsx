'use client';
import { useEffect, useState, useRef } from 'react';
import { isMobile } from 'react-device-detect';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import Link from 'next/link';

type Event = { name: string; id: string };
const EVENTS: Event[] = [  // Temporary data 
  { name: 'Architectural Design', id: '1' },
  { name: 'Data Science and Analytics', id: '2' },
  { name: 'Manufacturing Prototype', id: '3' },
  { name: 'Computer-Aided Design (CAD), Architecture', id: '4' },

];

const GENERAL_EMBED_URL = 'https://drive.google.com/embeddedfolderview?id=1DigW0nBS9Ptsunb6rnGk-YTI0ggZEzrL#list';

function camelToTitleCase(camel: string): string {
  return camel
    // Insert space before all caps
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    // Capitalize each word
    .replace(/\b\w/g, char => char.toUpperCase());
}

export default function Resources() {
  const router = useRouter();
  const [expanded, setExpanded] = useState<string | null>(null);
  const [showing, setShowing] = useState<{ [key: string]: boolean }>({});
  const [resourceLinks, setResourceLinks] = useState<{ [eventName: string]: { [col: string]: string } }>({});
  const [generalLinks, setGeneralLinks] = useState<{ name: string; link: string }[]>([]);
  const timeoutRef = useRef<{ [key: string]: NodeJS.Timeout }>({});

  useEffect(() => {
    const checkUser = async () => {
      const { data, error } = await supabase.auth.getUser();
      if (error || !data.user) {
        router.replace('/signin');
      }
    };
    checkUser();
  }, [router]);

  // Fetch resource links for all events on mount
  useEffect(() => {
    const fetchResourceLinks = async () => {
      const eventNames = EVENTS.map(e => e.name);
      const { data, error } = await supabase
        .from('resourcesDriveFolderIDs')
        .select('*')
        .in('Name', eventNames);
      if (!error && data) {
        const mapping: { [key: string]: { [col: string]: string } } = {};
        data.forEach((row: any) => {
          const links: { [col: string]: string } = {};
          Object.entries(row).forEach(([col, val]) => {
            // Exclude the 'Full Folder' column and the 'Name' column
            if (col !== 'Full Folder' && col !== 'Name' && val && typeof val === 'string') {
              links[col] = val;
            }
          });
          mapping[row.Name] = links;
        });
        setResourceLinks(mapping);
      }
    };
    fetchResourceLinks();
  }, []);

  // Fetch general resource links on mount
  useEffect(() => {
    const fetchGeneralLinks = async () => {
      const { data, error } = await supabase
        .from('generalResourcesLinks')
        .select('Name,Link');
      if (!error && data) {
        setGeneralLinks(
          data
            .filter((row: any) => row.Name && row.Link)
            .map((row: any) => ({ name: row.Name, link: row.Link }))
        );
      }
    };
    fetchGeneralLinks();
  }, []);

  // Handle showing state for smooth unmount
  useEffect(() => {
    EVENTS.forEach(event => {
      if (expanded === event.id) {
        // If expanding, show immediately
        setShowing(prev => ({ ...prev, [event.id]: true }));
        if (timeoutRef.current[event.id]) {
          clearTimeout(timeoutRef.current[event.id]);
        }
      } else if (showing[event.id]) {
        // If collapsing, delay hiding
        timeoutRef.current[event.id] = setTimeout(() => {
          setShowing(prev => ({ ...prev, [event.id]: false }));
        }, 500); // match transition duration
      }
    });
    // Cleanup on unmount
    return () => {
      Object.values(timeoutRef.current).forEach(clearTimeout);
    };
  }, [expanded]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#0a101f] px-4 pt-16 pb-8 md:pt-8">
      <h1 className="text-white text-4xl font-bold my-12 text-center">Resources</h1>
      <div className="flex flex-col md:flex-row gap-10 w-full max-w-5xl justify-center md:h-[60vh]">
        {/* Your Events */}
        <div className="flex-1 bg-[#181e29] rounded-2xl border border-[#232a3a] shadow-lg p-8 w-[100%] md:min-w-[40%] md:max-w-[50%] h-[100%] flex flex-col" style={{ boxShadow: '0 0 10px 0 #3b82f6, 0 0 24px 0 #8b5cf6, 0 0 0 1px #232a3a' }}>
          <h2 className="text-white text-2xl font-bold mb-6 shrink-0">Your Events</h2>
          <div className="flex flex-col flex-1 min-h-0">
            <div className="flex flex-col gap-4 flex-1 pr-2 overflow-y-auto custom-scrollbar min-h-0">
              {EVENTS.length === 0 ? (
                <span className="text-gray-400 italic">You aren't registered in any events.</span>
              ) : (
                EVENTS.map(event => (
                  <div key={event.id}>
                    <button
                      className="text-xl font-bold text-purple-400 hover:text-purple-500 hover:cursor-pointer flex w-full text-left focus:outline-none"
                      onClick={() => setExpanded(expanded === event.id ? null : event.id)}
                    >
                      <span
                        className={`ml-2 mr-2 text-lg transition-transform duration-300 h-full ${expanded === event.id ? 'rotate-90' : 'rotate-0'}`}
                        style={{ display: 'inline-block' }}
                      >
                        {">"}
                      </span>
                      {event.name}
                    </button>
                    <div className={`transition-all duration-500 ease-in-out overflow-hidden rollout ${expanded === event.id ? 'max-h-64 opacity-100' : 'max-h-0 opacity-0'}`}>
                      {showing[event.id] && (
                        <div className="mt-3 mb-2 flex flex-col gap-2">
                          {resourceLinks[event.name] &&
                            Object.entries(resourceLinks[event.name]).map(([col, val]) => (
                              <a
                                key={col}
                                href={`https://drive.google.com/drive/folders/${val}`}
                                className="bg-gradient-to-r from-blue-500 to-violet-500 bg-clip-text text-transparent hover:from-blue-700 hover:to-violet-700 transition-colors duration-200 text-lg pl-8"
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                {isMobile
                                  ? (<>{col} <span className="text-gray-100 md:text-violet-500">&#8599;</span></>)
                                  : (<>{col} &#8599;</>)}
                              </a>
                            ))
                          }
                          {!resourceLinks[event.name] && (
                            <span className="text-gray-400 italic">No resources available.</span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
            <div className="mt-8 shrink-0">
              <Link href="https://drive.google.com/drive/folders/15W3n8-9p7-amG2WFeF6g20RmsSNnDEME" 
                className="italic text-blue-300 text-lg hover:text-blue-400"
                target="_blank" rel="noopener noreferrer">See all resources...</Link>
            </div>
          </div>
        </div>
        {/* General Resources */}
        <div className="flex-1 bg-[#181e29] rounded-2xl border border-[#232a3a] shadow-lg p-8 w-[100%] md:min-w-[30%] md:max-w-[40%] h-[100%] flex flex-col" style={{ boxShadow: '0 0 10px 0 #3b82f6, 0 0 24px 0 #8b5cf6, 0 0 0 1px #232a3a' }}>
          <h2 className="text-white text-2xl font-bold mb-6">General Resources</h2>
          <div className="flex-1 flex flex-col items-start justify-start w-full gap-2 overflow-y-auto">
            {generalLinks.length > 0 ? (
              generalLinks.map((item, idx) => (
                <a
                  key={idx}
                  href={item.link}
                  className="bg-gradient-to-r from-blue-500 to-violet-500 bg-clip-text text-transparent hover:from-blue-700 hover:to-violet-700 transition-colors duration-200 text-lg"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {isMobile
                    ? (<>{item.name} <span className="text-gray-100 md:text-violet-500">&#8599;</span></>)
                    : (<>{item.name} &#8599;</>)}
                </a>
              ))
            ) : (
              <span className="text-gray-400 italic">No general resources available.</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 