"use client";
import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

function getBioWithReadMore(bio: string, onClick: () => void) {
  return (
    <div className="mt-4 text-base text-white font-normal w-full">
      {/* Hide bio preview on mobile, show on sm+ */}
      <div className="hidden sm:block">
        <div className="line-clamp-3 overflow-hidden text-ellipsis">{bio}</div>
      </div>
      <div className="mt-1 w-full flex justify-center sm:justify-start">
        {/* Show 'Read Bio' on mobile, 'Read more' on sm+ */}
        <span
          className="text-sky-400 font-semibold italic cursor-pointer block text-center sm:text-left"
          onClick={onClick}
        >
          <span className="block sm:hidden">Read Bio &gt;</span>
          <span className="hidden sm:inline">Read more &gt;</span>
        </span>
      </div>
    </div>
  );
}

interface Officer {
  name: string;
  position: string;
  favoriteEvent: string;
  bio: string;
  image: string;
  imageLoading: boolean;
}

export default function Officers() {
  const router = useRouter();
  const [modalIndex, setModalIndex] = useState<number | null>(null);
  const [officers, setOfficers] = useState<Officer[]>([]);
  const [authLoading, setAuthLoading] = useState(true);
  const [officersLoading, setOfficersLoading] = useState(false);
  const [groupImageUrl, setGroupImageUrl] = useState<string | null>(null);

  useEffect(() => {
    const checkUser = async () => {
      const { data, error } = await supabase.auth.getUser();
      if (error || !data.user) {
        router.replace("/signin");
      } else {
        loadOfficersData();
      }
      setAuthLoading(false);
    };
    checkUser();
  }, [router]);

  const loadOfficersData = async () => {
    setOfficersLoading(true);
    const { data, error } = await supabase
      .from("officers")
      .select("name, position, favoriteEvent, bio")
      .order("id", { ascending: true });

    if (!data || error) return;

    const initialOfficers = data.map((officer: any) => ({
      ...officer,
      image: "/file.svg",
      imageLoading: true,
    }));

    setOfficers(initialOfficers);
    loadOfficerImages(initialOfficers);
    fetchInternGroupImage();
    setOfficersLoading(false);
  };

  const loadOfficerImages = async (initialOfficers: Officer[]) => {
    const updated = await Promise.all(
      initialOfficers.map(async (officer: Officer) => {
        const firstName = officer.name.split(" ")[0].toLowerCase();
        const { data: imgData } = await supabase.storage
          .from("officer-photos")
          .createSignedUrl(`${firstName}.jpg`, 3600);
        return {
          ...officer,
          image: imgData?.signedUrl || "/file.svg",
          imageLoading: false,
        };
      })
    );
    setOfficers(updated);
  };

  const fetchInternGroupImage = async () => {
    const { data, error } = await supabase.storage
      .from("officer-photos")
      .createSignedUrl("fellows.jpg", 3600);
    if (!error && data?.signedUrl) setGroupImageUrl(data.signedUrl);
  };

  if (authLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen text-white text-2xl">
        Loading...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a101f] px-4 flex flex-col items-center">
      <div className="h-16" />
      <h1 className="text-4xl font-bold text-white mt-15 mb-15 text-center">
        Meet the North Creek TSA Board!
      </h1>

      {/* Officers Cards */}
      <div className="flex flex-wrap justify-center gap-12 w-full max-w-6xl">
        {officersLoading
          ? Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="flex flex-col md:flex-row bg-[#181e29] border rounded-3xl shadow-xl overflow-hidden p-6 gap-6 items-center border-[#232a3a] h-72 w-full md:w-[48%] lg:w-[32%] max-w-md"
                style={{
                  boxShadow:
                    "0 0 10px 0 #3b82f6, 0 0 24px 0 #8b5cf6, 0 0 0 1px #232a3a",
                }}
              >
                <div className="w-40 h-40 bg-[#232a3a] rounded-2xl border border-[#232a3a]/50 flex items-center justify-center text-gray-400">
                  Loading...
                </div>
              </div>
            ))
          : officers.map((officer, i) => (
              <div
                key={i}
                className="flex flex-col md:flex-row bg-[#181e29] border rounded-3xl shadow-xl overflow-hidden p-6 gap-6 items-center border-[#232a3a] h-72 w-full md:w-[60%] lg:w-[45%] max-w-xl min-w-0 min-h-[340px] sm:min-h-[288px]"
                style={{
                  boxShadow:
                    "0 0 10px 0 #3b82f6, 0 0 24px 0 #8b5cf6, 0 0 0 1px #232a3a",
                }}
              >
                <div className="w-40 h-40 bg-[#232a3a] rounded-2xl border border-[#232a3a]/50 flex items-center justify-center min-w-0 flex-shrink-0">
                  {officer.imageLoading ? (
                    <div className="text-gray-400">Loading...</div>
                  ) : (
                    <Image
                      src={officer.image}
                      alt="Officer"
                      width={120}
                      height={120}
                      className="w-[90%] h-[90%] object-contain rounded-xl"
                    />
                  )}
                </div>
                <div className="flex-1 flex flex-col justify-center min-w-0 w-full">
                  <div className="text-2xl font-bold text-white truncate">
                    {officer.name}
                  </div>
                  <div className="text-lg font-semibold mt-1 bg-gradient-to-r from-blue-500 to-violet-500 bg-clip-text text-transparent truncate">
                    {officer.position}
                  </div>
                  <div className="mt-4 text-lg font-medium text-white truncate">
                    Favorite Event:{" "}
                    <span className="bg-gradient-to-r from-sky-500 to-blue-500 bg-clip-text text-transparent truncate">
                      {officer.favoriteEvent}
                    </span>
                  </div>
                  {/* Always show the Read Bio button, even on mobile */}
                  <div className="flex-1 flex flex-col justify-end">
                    {getBioWithReadMore(officer.bio, () => setModalIndex(i))}
                  </div>
                </div>
              </div>
            ))}
      </div>

      {/* Executive Interns Section */}
      <div className="w-full max-w-4xl mt-24 text-center mb-8">
        <div
          className="bg-[#181e29] border border-[#232a3a] rounded-3xl shadow-lg p-8 flex flex-col items-center"
          style={{
            boxShadow:
              "0 0 10px 0 #3b82f6, 0 0 24px 0 #8b5cf6, 0 0 0 1px #232a3a",
          }}
        >
          <h2 className="text-3xl font-bold text-white mb-6">
            TSA Executive Interns
          </h2>
          {groupImageUrl && (
            <Image
              src={groupImageUrl}
              alt="Executive Interns Group"
              width={600}
              height={400}
              className="rounded-2xl border border-[#232a3a] mb-6"
              unoptimized
            />
          )}
          <p className="text-white text-lg leading-relaxed max-w-2xl">
            <span className="font-bold text-blue-400">Current Interns:</span>{" "}
            Anay Arya, Akal Singh, Tejsimha Tummapudi, Varenya Pothukuchi.
            <br />
            <br />
            Executive Interns support the TSA board in executing chapter
            initiatives, lead projects throughout the year, and take on evolving
            responsibilities to help ensure the success of North Creek TSA.
          </p>

          {/* <details className="mt-6 w-full">
            <summary className="text-sky-400 font-semibold text-lg cursor-pointer hover:underline">
              Interested in supporting?
            </summary>
            <div className="mt-2 text-white">
              Contact us{" "}
              <Link
                href="https://tsa-website-chi.vercel.app/contact"
                target="_blank"
                className="text-blue-400 underline hover:text-blue-500"
              >
                here
              </Link>
              .
            </div>
          </details> */}
        </div>
      </div>

      {/* Officer Bio Modal */}
      {modalIndex !== null && officers[modalIndex] && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
          <div
            className="bg-[#181e29] border rounded-3xl shadow-2xl p-8 max-w-lg w-full relative animate-fade-in border-[#232a3a] max-h-[90vh] overflow-y-auto custom-scrollbar"
            style={{
              boxShadow:
                "0 0 10px 0 #3b82f6, 0 0 24px 0 #8b5cf6, 0 0 0 1px #232a3a",
            }}
          >
            <button
              className="absolute top-4 right-4 text-gray-400 hover:text-white text-3xl font-bold"
              onClick={() => setModalIndex(null)}
              aria-label="Close"
            >
              &times;
            </button>
            <div className="flex flex-col items-center">
              <Image
                src={officers[modalIndex].image}
                alt="Officer"
                width={100}
                height={100}
                className="w-24 h-24 object-contain mb-4 border border-[#232a3a]/50"
              />
              <div className="text-2xl font-bold text-white mb-1">
                {officers[modalIndex].name}
              </div>
              <div className="text-lg font-semibold bg-gradient-to-r from-blue-500 to-violet-500 bg-clip-text text-transparent mb-4">
                {officers[modalIndex].position}
              </div>
              <div className="text-base text-white text-center whitespace-pre-line">
                {officers[modalIndex].bio}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
