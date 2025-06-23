import "./globals.css";
import { Raleway } from "next/font/google";

const raleway = Raleway({ subsets: ["latin"], variable: "--font-raleway", display: "swap" });

export const metadata = {
  title: "TSA Website",
  description: "A modern Next.js TSA website.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={raleway.variable}>
      <body className="font-sans bg-[#0a101f] text-white">{children}</body>
    </html>
  );
}
