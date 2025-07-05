"use client";
import { usePathname } from "next/navigation";
import Navbar from "@/components/Navbar";
import { ReactNode } from "react";

export default function BodyWithNav({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const hideNav = pathname === "/signin" || pathname === "/signup" || pathname === "/forgot-password" || pathname === "/update-password" || pathname === "/auth/verified";
  return (
    <>
      {!hideNav && <Navbar />}
      {children}
    </>
  );
} 