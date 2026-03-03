"use client";
import Image from "next/image";

const fakultasTeraktif = [
  { fakultas: "Fakultas Informatika" },
  { fakultas: "Fakultas Rekayasa Industri" },
  { fakultas: "Fakultas Elektro" },
];

const mahasiswaTeraktif = [
  { mahasiswa: "Zafra" },
  { mahasiswa: "Michale" },
  { mahasiswa: "Afra" },
];

export default function Leaderboard() {
  return (
    <div className="flex justify-between mt-5">
      <div className="flex flex-col w-full">
        <h1 className="text-lg mb-2">Fakultas Teraktif</h1>
        {fakultasTeraktif.map((item, index) => (
          <div
            key={index}
            className="flex justify-between items-center bg-white p-3 rounded-xl shadow-sm mb-3"
          >
            <div className="flex items-center">
              <div className="relative flex items-center justify-center w-8 h-8 rounded-lg bg-[#FFF3E0] mr-2 overflow-hidden">
                <Image
                  src="/Assets/icons/queen-crown-icon.svg"
                  alt="crown"
                  fill
                  className="object-contain opacity-75"
                />
                <span className="relative z-10 font-bold text-[#FB8C00]">
                  {index + 1}
                </span>
              </div>

              <h2 className="text-lg font-semibold text-gray-800">
                {item.fakultas}
              </h2>
            </div>

            <button className="text-sm text-gray-600 hover:text-blue-600 transition font-medium">
              Lihat Detail
            </button>
          </div>
        ))}
      </div>
      <div className="flex flex-col pl-5 w-full">
        <h1 className="text-lg mb-2">Mahasiswa Teraktif</h1>
        {mahasiswaTeraktif.map((item, index) => (
          <div
            key={index}
            className="flex justify-between items-center bg-white p-3 rounded-xl shadow-sm mb-3"
          >
            <div className="flex items-center">
              <div className="relative flex items-center justify-center w-8 h-8 rounded-lg bg-[#FFF3E0] mr-2 overflow-hidden">
                <Image
                  src="/Assets/icons/queen-crown-icon.svg"
                  alt="crown"
                  fill
                  className="object-contain opacity-75"
                />
                <span className="relative z-10 font-bold text-[#FB8C00]">
                  {index + 1}
                </span>
              </div>

              <h2 className="text-lg font-semibold text-gray-800">
                {item.mahasiswa}
              </h2>
            </div>

            <button className="text-sm text-gray-600 hover:text-blue-600 transition font-medium">
              Lihat Detail
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
