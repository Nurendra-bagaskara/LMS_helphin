"use client";
import Image from "next/image";

const courseTeraktif = [
  { fakultas: "Kalkulus" },
  { fakultas: "Algoritma Pemograman" },
  { fakultas: "Linear" },
];

const mahasiswaTeraktif = [
  { mahasiswa: "Zafra" },
  { mahasiswa: "Michale" },
  { mahasiswa: "Afra" },
];

export default function Leaderboard() {
  return (
    <div className="flex justify-between mt-10">
      <div className="flex flex-col w-full">
        <h1 className="text-lg mb-2">Course Terfavorit</h1>
        {courseTeraktif.map((item, index) => (
          <div
            key={index}
            className="flex justify-between items-center bg-white p-3 rounded-sm shadow-xs mb-3"
          >
            <div className="flex items-center">
              <div className="relative flex items-center justify-center w-9 h-10 rounded-sm bg-[#FFF3E0] mr-2 overflow-hidden">
                <Image
                  src="/Assets/icons/queen-crown-icon.svg"
                  alt="crown"
                  fill
                  className="object-contain opacity-75"
                />
                <span className="relative z-10 font-bold text-xl text-[#FB8C00]">
                  {index + 1}
                </span>
              </div>

              <h2 className="text-lg font-medium text-gray-800">
                {item.fakultas}
              </h2>
            </div>

            <button className="text-xs text-gray-600 hover:text-blue-600 transition font-light cursor-pointer">
              Lihat Course
            </button>
          </div>
        ))}
      </div>
      <div className="flex flex-col pl-5 w-full">
        <h1 className="text-lg mb-2">Student Active</h1>
        {mahasiswaTeraktif.map((item, index) => (
          <div
            key={index}
            className="flex justify-between items-center bg-white p-3 rounded-sm shadow-xs mb-3"
          >
            <div className="flex items-center">
              <div className="relative flex items-center justify-center w-9 h-10 rounded-sm bg-[#FFF3E0] mr-2 overflow-hidden">
                <Image
                  src="/Assets/icons/queen-crown-icon.svg"
                  alt="crown"
                  fill
                  className="object-contain opacity-75"
                />
                <span className="relative z-10 font-bold text-xl text-[#FB8C00]">
                  {index + 1}
                </span>
              </div>

              <h2 className="text-lg font-medium text-gray-800">
                {item.mahasiswa}
              </h2>
            </div>

            <button className="text-xs text-gray-600 hover:text-blue-600 transition font-light cursor-pointer">
              Lihat Profile
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
