"use client";

import Image from "next/image";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function StudentLoginPage() {
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const res = await fetch("http://localhost:8000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Gagal login. Periksa NIM & password.");
      }

      localStorage.setItem("accessToken", data.data.accessToken);
      localStorage.setItem("refreshToken", data.data.refreshToken || "");
      localStorage.setItem("user", JSON.stringify(data.data.user));
      localStorage.setItem("lastActivity", Date.now().toString());
      
      const redirectUrl = sessionStorage.getItem("redirectAfterLogin");
      if (redirectUrl) {
        sessionStorage.removeItem("redirectAfterLogin");
        router.push(redirectUrl);
      } else {
        router.push("/student/dashboard");
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="h-screen w-screen flex overflow-hidden bg-white relative">
      {/* ======================== LEFT SIDE ======================== */}
      <div className="hidden lg:block lg:w-[58%] relative">
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

        {/* #Explore title */}
        <div className="absolute top-12 left-1/2 -translate-x-[10%] z-20">
          <h2
            className="text-[52px] leading-none tracking-tight"
            style={{ fontFamily: "Inter, sans-serif", fontWeight: 900, fontStyle: "italic", color: "#068DFF" }}
          >
            #Explore
          </h2>
          <p className="text-[13px] text-gray-400 font-medium mt-0.5" style={{ fontStyle: "italic" }}>
            with helPhin x HIMA
          </p>
        </div>

        {/* Model Image — centered */}
        <div className="absolute inset-0 flex items-end justify-center z-10 pointer-events-none pb-0">
          <div className="relative w-[460px] h-[90%]">
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

        {/* Badge: Bank Soal — left side */}
        <div className="absolute left-[5%] top-[38%] z-30 animate-[float_5s_ease-in-out_infinite]">
          <div className="bg-white rounded-2xl shadow-[0_8px_30px_rgba(6,141,255,0.12)] px-3 py-2.5 flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg overflow-hidden flex-shrink-0">
              <Image src="/images/Group 197.svg" alt="Bank Soal" width={36} height={36} />
            </div>
            <span className="text-[13px] font-bold text-gray-700 whitespace-nowrap pr-1">Bank Soal</span>
          </div>
        </div>

        {/* Badge: Explore — upper right area */}
        <div className="absolute right-[15%] top-[26%] z-30 animate-[float_6s_ease-in-out_infinite_0.5s]">
          <div className="bg-white rounded-xl shadow-[0_8px_30px_rgba(6,141,255,0.12)] px-3 py-2 flex items-center gap-2">
            <div className="w-7 h-7 bg-blue-50 rounded-md flex items-center justify-center flex-shrink-0">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M7 1L9 5L13 5.5L10 8.5L11 13L7 11L3 13L4 8.5L1 5.5L5 5L7 1Z" fill="#068DFF"/>
              </svg>
            </div>
            <span className="text-[12px] font-bold text-gray-700 pr-0.5">Explore</span>
          </div>
        </div>

        {/* Badge: Teaching — bottom right */}
        <div className="absolute right-[8%] bottom-[22%] z-30 animate-[float_5.5s_ease-in-out_infinite_1s]">
          <div className="bg-white rounded-2xl shadow-[0_8px_30px_rgba(6,141,255,0.12)] px-3 py-2.5 flex items-center gap-2.5">
            <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center flex-shrink-0">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <rect x="1" y="3" width="14" height="10" rx="2" stroke="#068DFF" strokeWidth="1.5"/>
                <path d="M6.5 6L10.5 8L6.5 10V6Z" fill="#068DFF"/>
              </svg>
            </div>
            <span className="text-[13px] font-bold text-gray-700 whitespace-nowrap pr-1">Teaching</span>
          </div>
        </div>

        {/* Small blue orb — bottom left */}
        <div className="absolute left-[8%] bottom-[14%] z-30 animate-[float_4s_ease-in-out_infinite_0.3s]">
          <div className="w-11 h-11 rounded-full bg-gradient-to-br from-[#068DFF] to-[#30B5FF] flex items-center justify-center shadow-lg shadow-blue-300/40">
            <span className="text-white text-[10px] font-black italic">êx</span>
          </div>
        </div>

        {/* Small blue dot — middle right */}
        <div className="absolute right-[30%] top-[50%] z-20">
          <div className="w-6 h-6 rounded-full bg-gradient-to-br from-[#068DFF] to-[#30B5FF] opacity-50"></div>
        </div>
      </div>

      {/* ======================== RIGHT SIDE ======================== */}
      <div className="flex-1 flex items-center justify-center px-8 lg:px-16">
        <div className="w-full max-w-[380px]">
          {/* helPhin logo */}
          <div className="flex justify-center mb-6">
            <Image
              src="/images/helPhin 2.svg"
              alt="helPhin"
              width={170}
              height={55}
              priority
            />
          </div>

          {/* Subtitle */}
          <p className="text-center text-[14px] text-gray-500 leading-relaxed mb-10">
            Masukkan Email atau NIM dan kata sandi Anda
            <br />
            di bawah ini untuk masuk ke akun Anda
          </p>

          {/* Login Form */}
          <form className="flex flex-col gap-3" onSubmit={handleLogin}>
            {error && (
              <div className="p-3 text-[13px] text-red-500 bg-red-50 border border-red-200 rounded-lg text-center mb-1">
                {error}
              </div>
            )}

            {/* NIM */}
            <input
              type="text"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              placeholder="Email atau NIM"
              required
              className="w-full px-5 py-3.5 rounded-lg bg-white text-gray-800 border border-gray-300 outline-none transition-all duration-200 hover:border-blue-400 focus:border-[#068DFF] focus:ring-2 focus:ring-blue-100 text-[14px]"
            />

            {/* Password */}
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              required
              className="w-full px-5 py-3.5 rounded-lg bg-white text-gray-800 border border-gray-300 outline-none transition-all duration-200 hover:border-blue-400 focus:border-[#068DFF] focus:ring-2 focus:ring-blue-100 text-[14px]"
            />

            {/* Lupa password */}
            <div className="flex justify-end mt-1">
              <Link href="/forgot-password" className="text-[13px] font-medium text-[#068DFF] hover:underline">
                Lupa password?
              </Link>
            </div>

            {/* Masuk Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-3 py-3.5 bg-[#068DFF] hover:bg-[#0570CC] disabled:opacity-50 text-white font-semibold text-[15px] rounded-full shadow-md transition-all duration-200 active:scale-[0.98]"
            >
              {isLoading ? "Memproses..." : "Masuk"}
            </button>
          </form>

          {/* Register link */}
          <p className="text-center text-[14px] text-gray-500 mt-8">
            Belum punya akun?{" "}
            <Link href="/register" className="text-gray-800 font-bold hover:underline">
              Buat Akun
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
