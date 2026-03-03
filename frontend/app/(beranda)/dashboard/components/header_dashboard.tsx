"use client";
import Image from "next/image";

export default function HeaderDashboard() {
  return (
    <header className="overflow-hidden flex justify-between mt-5 pl-5 bg-gradient-to-r from-[#0055FF] to-[#07A3F9] to-75% rounded-lg text-white shadow-lg">
      <div className="flex flex-col justify-end pb-5">
        <h1 className="font-bold text-2xl">Hallo, Super Admin 👋</h1>
        <h1 className="text-xs font-light">by helPhin</h1>
      </div>
      <div className="relative">
        <Image
          src="/Assets/gedung_kampus_image.png"
          alt="Gedung Kampus"
          width={350}
          height={350}
          priority
        />
        <div className="absolute left-4 inset-0 bg-gradient-to-t from-[#07A3F9] via-transparent via-25% to-transparent" />
      </div>
    </header>
  );
}
