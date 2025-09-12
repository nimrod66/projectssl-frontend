import Image from "next/image";

export default function Logo({ className }: { className?: string }) {
  return (
    <Image
      src="/assets/logo.png"
      height={40}
      width={30}
      alt="SSL Logo"
      className={className}
      priority
    />
  );
}
