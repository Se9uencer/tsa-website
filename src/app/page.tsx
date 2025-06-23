import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-200 dark:from-gray-900 dark:to-gray-800">
      <div className="w-full max-w-xl p-8 bg-white dark:bg-gray-900 rounded-lg shadow-lg flex flex-col items-center gap-8">
        <Image
          className="dark:invert mb-2"
          src="/next.svg"
          alt="Next.js logo"
          width={180}
          height={38}
          priority
        />
        <ol className="list-inside list-decimal text-base text-center font-mono mb-4">
          <li className="mb-2 tracking-[-.01em]">
            Get started by editing{' '}
            <code className="bg-black/5 dark:bg-white/10 px-1 py-0.5 rounded font-semibold">
              src/app/page.tsx
            </code>
            .
          </li>
          <li className="tracking-[-.01em]">Save and see your changes instantly.</li>
        </ol>
        <div className="flex gap-4 flex-col sm:flex-row w-full justify-center items-center">
          <a
            className="rounded-full border border-transparent transition-colors flex items-center justify-center bg-blue-600 text-white gap-2 hover:bg-blue-700 font-medium text-base h-12 px-5 w-full sm:w-auto"
            href="/signin"
          >
            Sign In
          </a>
          <a
            className="rounded-full border border-blue-600 text-blue-600 bg-transparent transition-colors flex items-center justify-center hover:bg-blue-50 font-medium text-base h-12 px-5 w-full sm:w-auto"
            href="/signup"
          >
            Sign Up
          </a>
        </div>
        <div className="flex gap-4 flex-wrap items-center justify-center mt-4">
          <a
            className="flex items-center gap-2 hover:underline hover:underline-offset-4 text-sm"
            href="https://nextjs.org/learn?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Image aria-hidden src="/file.svg" alt="File icon" width={16} height={16} />
            Learn
          </a>
          <a
            className="flex items-center gap-2 hover:underline hover:underline-offset-4 text-sm"
            href="https://vercel.com/templates?framework=next.js&utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Image aria-hidden src="/window.svg" alt="Window icon" width={16} height={16} />
            Examples
          </a>
          <a
            className="flex items-center gap-2 hover:underline hover:underline-offset-4 text-sm"
            href="https://nextjs.org?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Image aria-hidden src="/globe.svg" alt="Globe icon" width={16} height={16} />
            Go to nextjs.org →
          </a>
        </div>
      </div>
    </div>
  );
}
