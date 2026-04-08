"use client";

import Image from "next/image";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface Prodi {
  id: string;
  name: string;
  fakultasName: string;
}

export default function StudentRegisterPage() {
  const [name, setName] = useState("");
  const [nim, setNim] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [prodiId, setProdiId] = useState("");
  const [prodiList, setProdiList] = useState<Prodi[]>([]);

  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const fetchProdi = async () => {
      try {
        const res = await fetch("http://localhost:8000/api/prodi");
        const data = await res.json();
        if (data.success) {
          setProdiList(data.data);
        }
      } catch (e) {
        console.error("Gagal mengambil data prodi", e);
      }
    };
    fetchProdi();
  }, []);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    if (!prodiId) {
      setError("Silakan pilih program studi Anda.");
      setIsLoading(false);
      return;
    }

    try {
      const res = await fetch("http://localhost:8000/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, nim, email, password, prodiId }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Gagal mendaftar. Periksa kembali data Anda.");
      }

      router.push("/login?registered=true");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="h-screen w-screen flex overflow-hidden bg-white relative">
      {/* ======================== LEFT SIDE ======================== */}
      <div className="hidden lg:block lg:w-[50%] relative">
        {/* Background SVG (concentric ellipses + blur) */}
        <div className="absolute inset-0 overflow-hidden">
          <Image
            src="/images/background.svg"
            alt=""
            fill
            className="object-cover object-center"
            priority
          />
        </div>

        {/* Blue wave decoration at bottom */}
        <div className="absolute bottom-0 right-0 w-full pointer-events-none">
          <Image
            src="/images/Vector 1.svg"
            alt=""
            width={1440}
            height={738}
            className="object-cover w-full opacity-40"
          />
        </div>

        {/* Title */}
        <div className="absolute top-12 left-1/2 -translate-x-[10%] z-20">
          <h2
            className="text-[48px] leading-none tracking-tight"
            style={{ fontFamily: "Inter, sans-serif", fontWeight: 900, fontStyle: "italic", color: "#068DFF" }}
          >
            #JoinUs
          </h2>
          <p className="text-[13px] text-gray-400 font-medium mt-0.5" style={{ fontStyle: "italic" }}>
            with helPhin x HIMA
          </p>
        </div>

        {/* Model Image — centered */}
        <div className="absolute inset-0 flex items-end justify-center z-10 pointer-events-none pb-0">
          <div className="relative w-[420px] h-[85%]">
            <Image
              src="/images/Model.svg"
              alt="Student"
              fill
              priority
              className="object-contain object-bottom"
            />
          </div>
        </div>

        {/* ========== FLOATING BADGES ========== */}

        {/* Badge: Bank Soal */}
        <div className="absolute left-[5%] top-[38%] z-30 animate-[float_5s_ease-in-out_infinite]">
          <div className="bg-white rounded-2xl shadow-[0_8px_30px_rgba(6,141,255,0.12)] px-3 py-2.5 flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg overflow-hidden flex-shrink-0">
              <Image src="/images/Group 197.svg" alt="Bank Soal" width={36} height={36} />
            </div>
            <span className="text-[13px] font-bold text-gray-700 whitespace-nowrap pr-1">Bank Soal</span>
          </div>
        </div>

        {/* Badge: Explore */}
        <div className="absolute right-[12%] top-[26%] z-30 animate-[float_6s_ease-in-out_infinite_0.5s]">
          <div className="bg-white rounded-xl shadow-[0_8px_30px_rgba(6,141,255,0.12)] px-3 py-2 flex items-center gap-2">
            <div className="w-7 h-7 bg-blue-50 rounded-md flex items-center justify-center flex-shrink-0">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M7 1L9 5L13 5.5L10 8.5L11 13L7 11L3 13L4 8.5L1 5.5L5 5L7 1Z" fill="#068DFF" />
              </svg>
            </div>
            <span className="text-[12px] font-bold text-gray-700 pr-0.5">Explore</span>
          </div>
        </div>

        {/* Badge: Teaching */}
        <div className="absolute right-[5%] bottom-[22%] z-30 animate-[float_5.5s_ease-in-out_infinite_1s]">
          <div className="bg-white rounded-2xl shadow-[0_8px_30px_rgba(6,141,255,0.12)] px-3 py-2.5 flex items-center gap-2.5">
            <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center flex-shrink-0">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <rect x="1" y="3" width="14" height="10" rx="2" stroke="#068DFF" strokeWidth="1.5" />
                <path d="M6.5 6L10.5 8L6.5 10V6Z" fill="#068DFF" />
              </svg>
            </div>
            <span className="text-[13px] font-bold text-gray-700 whitespace-nowrap pr-1">Teaching</span>
          </div>
        </div>

        {/* Small blue orb */}
        <div className="absolute left-[8%] bottom-[14%] z-30 animate-[float_4s_ease-in-out_infinite_0.3s]">
          <div className="w-11 h-11 rounded-full bg-gradient-to-br from-[#068DFF] to-[#30B5FF] flex items-center justify-center shadow-lg shadow-blue-300/40">
            <span className="text-white text-[10px] font-black italic">êx</span>
          </div>
        </div>

        {/* Small blue dot */}
        <div className="absolute right-[30%] top-[50%] z-20">
          <div className="w-6 h-6 rounded-full bg-gradient-to-br from-[#068DFF] to-[#30B5FF] opacity-50"></div>
        </div>
      </div>

      {/* ======================== RIGHT SIDE ======================== */}
      <div className="flex-1 flex items-center justify-center px-8 lg:px-14 overflow-y-auto">
        <div className="w-full max-w-[420px] py-10">
          {/* helPhin logo */}
          <div className="flex justify-center mb-4">
            <Image
              src="/images/helPhin 2.svg"
              alt="helPhin"
              width={160}
              height={50}
              priority
            />
          </div>

          {/* Subtitle */}
          <p className="text-center text-[14px] text-gray-500 leading-relaxed mb-8">
            Daftarkan akun Anda untuk mulai
            <br />
            belajar bersama helPhin
          </p>

          {/* Register Form */}
          <form className="flex flex-col gap-3" onSubmit={handleRegister}>
            {error && (
              <div className="p-3 text-[13px] text-red-500 bg-red-50 border border-red-200 rounded-lg text-center mb-1">
                {error}
              </div>
            )}

            {/* Nama Lengkap */}
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Nama Lengkap"
              required
              className="w-full px-5 py-3.5 rounded-lg bg-white text-gray-800 border border-gray-300 outline-none transition-all duration-200 hover:border-blue-400 focus:border-[#068DFF] focus:ring-2 focus:ring-blue-100 text-[14px]"
            />

            {/* NIM + Email side by side */}
            <div className="grid grid-cols-2 gap-3">
              <input
                type="text"
                value={nim}
                onChange={(e) => setNim(e.target.value)}
                placeholder="NIM"
                required
                className="w-full px-5 py-3.5 rounded-lg bg-white text-gray-800 border border-gray-300 outline-none transition-all duration-200 hover:border-blue-400 focus:border-[#068DFF] focus:ring-2 focus:ring-blue-100 text-[14px]"
              />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email"
                required
                className="w-full px-5 py-3.5 rounded-lg bg-white text-gray-800 border border-gray-300 outline-none transition-all duration-200 hover:border-blue-400 focus:border-[#068DFF] focus:ring-2 focus:ring-blue-100 text-[14px]"
              />
            </div>

            {/* Program Studi */}
            <div className="relative">
              <select
                value={prodiId}
                onChange={(e) => setProdiId(e.target.value)}
                required
                className="w-full px-5 py-3.5 rounded-lg bg-white text-gray-800 border border-gray-300 outline-none transition-all duration-200 hover:border-blue-400 focus:border-[#068DFF] focus:ring-2 focus:ring-blue-100 text-[14px] appearance-none cursor-pointer"
              >
                <option value="">Pilih Program Studi</option>
                {prodiList.map((p) => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
              <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                <svg width="12" height="8" viewBox="0 0 12 8" fill="none">
                  <path d="M1 1.5L6 6.5L11 1.5" stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
            </div>

            {/* Password */}
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password (min. 6 karakter)"
              required
              className="w-full px-5 py-3.5 rounded-lg bg-white text-gray-800 border border-gray-300 outline-none transition-all duration-200 hover:border-blue-400 focus:border-[#068DFF] focus:ring-2 focus:ring-blue-100 text-[14px]"
            />

            {/* Daftar Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-3 py-3.5 bg-[#068DFF] hover:bg-[#0570CC] disabled:opacity-50 text-white font-semibold text-[15px] rounded-full shadow-md transition-all duration-200 active:scale-[0.98]"
            >
              {isLoading ? "Mendaftarkan..." : "Daftar Sekarang"}
            </button>
          </form>

          {/* Login link */}
          <p className="text-center text-[14px] text-gray-500 mt-6">
            Sudah punya akun?{" "}
            <Link href="/login" className="text-gray-800 font-bold hover:underline">
              Masuk di sini
            </Link>
          </p>
        </div>
      </div>

      {/* Keyframes */}
      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-12px); }
        }
      `}</style>
    </main>
  );
}
