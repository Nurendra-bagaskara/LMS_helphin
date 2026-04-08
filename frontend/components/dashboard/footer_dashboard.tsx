"use client";
import Image from "next/image";

export default function FooterDashboard() {
  return (
    <div className="bg-gradient-to-r mt-5 from-[#068DFF] to-[#31B6FF] p-5 rounded-sm flex justify-between items-center text-white shadow-sm">
      <Image
        src="/Assets/Logo-helphin-putih.png"
        alt="Logo Helphin"
        width={100}
        height={40}
        priority
      />
      <div className="space-x-4 text-xs font-light">
        <span className="cursor-pointer hover:underline">About</span>
        <span className="cursor-pointer hover:underline">Policy</span>
        <span className="cursor-pointer hover:underline">Terms</span>
      </div>
    </div>
  );
}
