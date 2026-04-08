"use client";

import Image from "next/image";
import { useState } from "react";
import { useRouter } from "next/navigation";

interface LoginViewProps {
  roleTitle: string;
  redirectPath: string;
}

export default function LoginView({ roleTitle, redirectPath }: LoginViewProps) {
  const [email, setEmail] = useState("");
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
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Gagal login. Periksa kembali email & password.");
      }

      const userRole = data.data.user.role;
      if (redirectPath.includes("admin") && userRole !== "admin" && !data.data.user.permissions?.includes("*")) {
        if (redirectPath.includes("superadmin") && !data.data.user.permissions?.includes("*")) {
          throw new Error("Anda tidak memiliki akses ke portal ini.");
        }
      }

      localStorage.setItem("accessToken", data.data.accessToken);
      localStorage.setItem("refreshToken", data.data.refreshToken || "");
      localStorage.setItem("user", JSON.stringify(data.data.user));
      localStorage.setItem("lastActivity", Date.now().toString());

      router.push(redirectPath);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const isSuperAdmin = roleTitle.toLowerCase().includes("superadmin");

  return (
    <main className="h-screen w-screen flex overflow-hidden bg-white relative">
      {/* ======================== LEFT SIDE ======================== */}
      <div className="hidden lg:block lg:w-[58%] relative overflow-hidden">
        {/* Background SVG */}
        <div className="absolute inset-0">
          <Image
            src="/images/background.svg"
            alt=""
            fill
            className="object-cover object-center"
            priority
          />
        </div>

        {/* Blue wave */}
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
            className="text-[52px] leading-none tracking-tight"
            style={{ fontFamily: "Inter, sans-serif", fontWeight: 900, fontStyle: "italic", color: "#068DFF" }}
          >
            {isSuperAdmin ? "#Control" : "#Manage"}
          </h2>
          <p className="text-[13px] text-gray-400 font-medium mt-0.5" style={{ fontStyle: "italic" }}>
            helPhin {roleTitle} Portal
          </p>
        </div>

        {/* Main illustration */}
        <div className="absolute inset-0 flex items-end justify-center z-10 pointer-events-none">
          <div className="relative w-[460px] h-[90%]">
            <Image
              src="/images/Model.svg"
              alt="Admin"
              fill
              priority
              className="object-contain object-bottom"
            />
          </div>
        </div>

        {/* Floating Badges */}
        <div className="absolute left-[5%] top-[38%] z-30 animate-[float_5s_ease-in-out_infinite]">
          <div className="bg-white rounded-2xl shadow-[0_8px_30px_rgba(6,141,255,0.12)] px-3 py-2.5 flex items-center gap-2.5">
            <div className="w-9 h-9 bg-blue-50 rounded-lg flex items-center justify-center flex-shrink-0">
              <svg width="18" height="18" viewBox="0 0 16 16" fill="none">
                <path d="M8 1L10 6H15L11 9L12.5 14L8 11L3.5 14L5 9L1 6H6L8 1Z" fill="#068DFF"/>
              </svg>
            </div>
            <span className="text-[13px] font-bold text-gray-700 whitespace-nowrap pr-1">Dashboard</span>
          </div>
        </div>

        <div className="absolute right-[8%] bottom-[22%] z-30 animate-[float_5.5s_ease-in-out_infinite_1s]">
          <div className="bg-white rounded-2xl shadow-[0_8px_30px_rgba(6,141,255,0.12)] px-3 py-2.5 flex items-center gap-2.5">
            <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center flex-shrink-0">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <rect x="1" y="1" width="6" height="6" rx="1.5" fill="#068DFF"/>
                <rect x="9" y="1" width="6" height="6" rx="1.5" fill="#068DFF" opacity="0.5"/>
                <rect x="1" y="9" width="6" height="6" rx="1.5" fill="#068DFF" opacity="0.5"/>
                <rect x="9" y="9" width="6" height="6" rx="1.5" fill="#068DFF"/>
              </svg>
            </div>
            <span className="text-[13px] font-bold text-gray-700 whitespace-nowrap pr-1">Manajemen</span>
          </div>
        </div>

        {/* Blue orb */}
        <div className="absolute left-[8%] bottom-[14%] z-30 animate-[float_4s_ease-in-out_infinite_0.3s]">
          <div className="w-11 h-11 rounded-full bg-gradient-to-br from-[#068DFF] to-[#30B5FF] flex items-center justify-center shadow-lg shadow-blue-300/40">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M8 2V14M2 8H14" stroke="white" strokeWidth="2.5" strokeLinecap="round"/>
            </svg>
          </div>
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

          {/* Portal Title */}
          <div className="text-center mb-10 space-y-2">
            <h1 className="text-xl font-bold text-gray-800">Portal {roleTitle}</h1>
            <p className="text-[14px] text-gray-500 leading-relaxed">
              Masukkan email dan kata sandi Anda
              <br />
              di bawah ini untuk masuk ke akun Anda
            </p>
          </div>

          {/* Login Form */}
          <form className="flex flex-col gap-3" onSubmit={handleLogin}>
            {error && (
              <div className="p-3 text-[13px] text-red-500 bg-red-50 border border-red-200 rounded-lg text-center mb-1">
                {error}
              </div>
            )}

            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
              required
              className="w-full px-5 py-3.5 rounded-lg bg-white text-gray-800 border border-gray-300 outline-none transition-all duration-200 hover:border-blue-400 focus:border-[#068DFF] focus:ring-2 focus:ring-blue-100 text-[14px]"
            />

            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              required
              className="w-full px-5 py-3.5 rounded-lg bg-white text-gray-800 border border-gray-300 outline-none transition-all duration-200 hover:border-blue-400 focus:border-[#068DFF] focus:ring-2 focus:ring-blue-100 text-[14px]"
            />

            <div className="flex justify-end mt-1">
              <button type="button" className="text-[13px] font-medium text-[#068DFF] hover:underline">
                Lupa password?
              </button>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-3 py-3.5 bg-[#068DFF] hover:bg-[#0570CC] disabled:opacity-50 text-white font-semibold text-[15px] rounded-full shadow-md transition-all duration-200 active:scale-[0.98]"
            >
              {isLoading ? "Memproses..." : "Masuk"}
            </button>
          </form>

          <p className="text-center text-[13px] text-gray-400 mt-8">
            Lupa kata sandi?{" "}
            <button className="text-[#068DFF] font-medium hover:underline">Hubungi Admin</button>
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
