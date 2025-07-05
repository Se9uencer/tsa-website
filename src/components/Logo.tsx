import Image from 'next/image';

export default function Logo({ className = '' }: { className?: string }) {
  return (
    <Image
      src="/images/ncTSALogo.png"
      alt="TSA"
      width={48}
      height={48}
      className={className}
      priority
    />
  );
}