"use client";

import Image from "next/image";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Mail, ShieldCheck, Lock, CheckCircle2 } from "lucide-react";

type Step = "IDENTIFIER" | "OTP" | "RESET" | "SUCCESS";

export default function ForgotPasswordPage() {
  const [step, setStep] = useState<Step>("IDENTIFIER");
  const [identifier, setIdentifier] = useState("");
  const [otp, setOtp] = useState("");
  const [email, setEmail] = useState(""); // Stored email from backend response
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  // Step 1: Request OTP
  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const res = await fetch("http://localhost:8000/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Gagal mengirim OTP");

      setEmail(data.data.email);
      setStep("OTP");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Step 2: Verify OTP
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const res = await fetch("http://localhost:8000/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Kode OTP tidak valid");

      setStep("RESET");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Step 3: Reset Password
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    
    if (newPassword !== confirmPassword) {
      setError("Konfirmasi password tidak cocok");
      return;
    }

    if (newPassword.length < 6) {
      setError("Password minimal 6 karakter");
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch("http://localhost:8000/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp, newPassword }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Gagal mereset password");

      setStep("SUCCESS");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="h-screen w-screen flex overflow-hidden bg-white relative">
      {/* ======================== LEFT SIDE (Copy from Login) ======================== */}
      <div className="hidden lg:block lg:w-[58%] relative">
        <div className="absolute inset-0 overflow-hidden">
          <Image src="/images/background.svg" alt="" fill className="object-cover object-center" priority />
        </div>
        <div className="absolute bottom-0 right-0 w-full pointer-events-none">
          <Image src="/images/Vector 1.svg" alt="" width={1440} height={738} className="object-cover w-full opacity-40" />
        </div>
        <div className="absolute top-12 left-1/2 -translate-x-[10%] z-20">
          <h2 className="text-[52px] leading-none tracking-tight font-black italic text-[#068DFF] font-inter">#Explore</h2>
          <p className="text-[13px] text-gray-400 font-medium mt-0.5 italic">with helPhin x HIMA</p>
        </div>
        <div className="absolute inset-0 flex items-end justify-center z-10 pointer-events-none pb-0">
          <div className="relative w-[460px] h-[90%]">
            <Image src="/images/Model.svg" alt="Student" fill priority className="object-contain object-bottom" />
          </div>
        </div>
      </div>

      {/* ======================== RIGHT SIDE ======================== */}
      <div className="flex-1 flex items-center justify-center px-8 lg:px-16">
        <div className="w-full max-w-[400px]">
          {/* Back to login */}
          <Link href="/login" className="flex items-center gap-2 text-gray-400 hover:text-blue-500 transition-colors mb-8 group">
            <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
            <span className="text-sm font-bold">Kembali ke Login</span>
          </Link>

          {/* Logo */}
          <div className="mb-8">
            <Image src="/images/helPhin 2.svg" alt="helPhin" width={150} height={48} priority />
          </div>

          {/* --- STEP 1: IDENTIFIER --- */}
          {step === "IDENTIFIER" && (
            <div className="animate-in fade-in slide-in-from-right-4 duration-500">
              <h1 className="text-2xl font-black text-gray-800 mb-2">Lupa Password?</h1>
              <p className="text-sm text-gray-500 mb-8 leading-relaxed">
                Jangan khawatir! Masukkan Email atau NIM Anda untuk menerima kode verifikasi OTP.
              </p>

              <form onSubmit={handleRequestOtp} className="space-y-4">
                {error && <div className="p-3 text-xs text-red-500 bg-red-50 border border-red-200 rounded-xl text-center font-bold">{error}</div>}
                <div className="relative group">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors" size={18} />
                  <input
                    type="text"
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    placeholder="Email atau NIM"
                    required
                    className="w-full pl-12 pr-4 py-4 rounded-2xl bg-gray-50 border border-transparent outline-none transition-all focus:bg-white focus:border-blue-400 focus:ring-4 focus:ring-blue-50 text-sm font-bold text-gray-700"
                  />
                </div>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-4 bg-[#068DFF] hover:bg-blue-600 disabled:opacity-50 text-white font-black text-sm tracking-widest uppercase rounded-2xl shadow-xl shadow-blue-200 transition-all active:scale-[0.98]"
                >
                  {isLoading ? "Mengirim..." : "Kirim Kode OTP"}
                </button>
              </form>
            </div>
          )}

          {/* --- STEP 2: OTP --- */}
          {step === "OTP" && (
            <div className="animate-in fade-in slide-in-from-right-4 duration-500">
              <div className="w-16 h-16 bg-blue-50 text-blue-500 rounded-2xl flex items-center justify-center mb-6">
                <ShieldCheck size={32} />
              </div>
              <h1 className="text-2xl font-black text-gray-800 mb-2">Verifikasi OTP</h1>
              <p className="text-sm text-gray-500 mb-8 leading-relaxed">
                Kode 6-digit telah dikirim ke <span className="font-bold text-gray-700">{email}</span>. Silakan periksa kotak masuk Anda.
              </p>

              <form onSubmit={handleVerifyOtp} className="space-y-4">
                {error && <div className="p-3 text-xs text-red-500 bg-red-50 border border-red-200 rounded-xl text-center font-bold">{error}</div>}
                <input
                  type="text"
                  maxLength={6}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                  placeholder="0 0 0 0 0 0"
                  required
                  className="w-full px-4 py-5 rounded-2xl bg-gray-50 border border-transparent outline-none transition-all focus:bg-white focus:border-blue-400 focus:ring-4 focus:ring-blue-50 text-center text-2xl font-black tracking-[0.5em] text-gray-700 placeholder:text-gray-200"
                />
                <button
                  type="submit"
                  disabled={isLoading || otp.length < 6}
                  className="w-full py-4 bg-[#068DFF] hover:bg-blue-600 disabled:opacity-50 text-white font-black text-sm tracking-widest uppercase rounded-2xl shadow-xl shadow-blue-200 transition-all active:scale-[0.98]"
                >
                  {isLoading ? "Memverifikasi..." : "Verifikasi Kode"}
                </button>
              </form>
              <p className="text-center text-xs text-gray-400 mt-6">
                Tidak menerima kode? <button type="button" onClick={handleRequestOtp} className="text-blue-500 font-bold hover:underline">Kirim ulang</button>
              </p>
            </div>
          )}

          {/* --- STEP 3: RESET --- */}
          {step === "RESET" && (
            <div className="animate-in fade-in slide-in-from-right-4 duration-500">
              <div className="w-16 h-16 bg-orange-50 text-orange-500 rounded-2xl flex items-center justify-center mb-6">
                <Lock size={32} />
              </div>
              <h1 className="text-2xl font-black text-gray-800 mb-2">Password Baru</h1>
              <p className="text-sm text-gray-500 mb-8 leading-relaxed">
                Hampir selesai! Buat password baru yang kuat untuk mengamankan akun Anda.
              </p>

              <form onSubmit={handleResetPassword} className="space-y-4">
                {error && <div className="p-3 text-xs text-red-500 bg-red-50 border border-red-200 rounded-xl text-center font-bold">{error}</div>}
                <div className="space-y-4">
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Password Baru"
                    required
                    className="w-full px-5 py-4 rounded-2xl bg-gray-50 border border-transparent outline-none transition-all focus:bg-white focus:border-orange-400 focus:ring-4 focus:ring-orange-50 text-sm font-bold text-gray-700"
                  />
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Konfirmasi Password Baru"
                    required
                    className="w-full px-5 py-4 rounded-2xl bg-gray-50 border border-transparent outline-none transition-all focus:bg-white focus:border-orange-400 focus:ring-4 focus:ring-orange-50 text-sm font-bold text-gray-700"
                  />
                </div>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-4 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 disabled:opacity-50 text-white font-black text-sm tracking-widest uppercase rounded-2xl shadow-xl shadow-orange-200 transition-all active:scale-[0.98]"
                >
                  {isLoading ? "Menyimpan..." : "Simpan Password Baru"}
                </button>
              </form>
            </div>
          )}

          {/* --- STEP 4: SUCCESS --- */}
          {step === "SUCCESS" && (
            <div className="animate-in fade-in zoom-in-95 duration-500 text-center">
              <div className="w-20 h-20 bg-green-50 text-green-500 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-inner">
                <CheckCircle2 size={40} />
              </div>
              <h1 className="text-2xl font-black text-gray-800 mb-3">Berhasil!</h1>
              <p className="text-sm text-gray-500 mb-10 leading-relaxed">
                Password Anda telah berhasil diatur ulang. Sekarang Anda dapat masuk kembali ke akun helPhin Anda.
              </p>
              <Link
                href="/login"
                className="block w-full py-4 bg-green-500 hover:bg-green-600 text-white font-black text-sm tracking-widest uppercase rounded-2xl shadow-xl shadow-green-200 transition-all active:scale-[0.98]"
              >
                Login Sekarang
              </Link>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
