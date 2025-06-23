import { redirect } from 'next/navigation';
import Image from "next/image";
import Link from "next/link";

export default function Home() {
  redirect('/signin');
  return null;
}
