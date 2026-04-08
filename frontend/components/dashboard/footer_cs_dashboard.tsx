"use client";
import Image from "next/image";

export default function FooterCSDashboard() {
  return (
    <div className="bg-[#D9EEFF] pl-5 mt-10 rounded-sm flex justify-between items-center shadow-xs relative overflow-visible min-h-[100px]">
      <div className="flex flex-col justify-center">
        <h1 className="font-extrabold text-lg">
          Ada kendala? Yuk, Tanya Kami!
        </h1>
        <h1 className="text-sm font-medium">
          Tim support helPhin siap membantumu
        </h1>
      </div>

      <div className="relative flex items-center pr-[175px]">
        <Image
          src="/Assets/vector_footer_cs_dashboard.png"
          alt="vector background"
          width={9999}
          height={9999}
          className="absolute right-0 top-1/2 -translate-y-1/2 z-0 pointer-events-none"
          priority
        />

        <button
          type="button"
          className="relative z-10 bg-white hover:bg-gray-100 transition duration-300 text-[#068DFF] rounded-sm text-sm font-semibold shadow-xs cursor-pointer px-4 py-2"
        >
          Hubungi Kami
        </button>

        <Image
          src="/Assets/helphin_CS.png"
          alt="helphin_cs"
          width={150}
          height={150}
          className="absolute right-0 z-10 -top-[52px]"
          priority
        />
      </div>
    </div>
  );
}
