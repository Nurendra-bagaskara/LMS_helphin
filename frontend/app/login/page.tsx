"use client";

import Image from "next/image";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
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
      const res = await fetch("http://localhost:3000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Gagal login. Periksa email & password.");
      }

      // Simpan credentials
      localStorage.setItem("accessToken", data.data.accessToken);
      localStorage.setItem("refreshToken", data.data.refreshToken || ""); // Ensure refreshToken is also stored if present
      localStorage.setItem("user", JSON.stringify(data.data.user));
      localStorage.setItem("lastActivity", Date.now().toString());

      // Redirect ke dashboard
      router.push("/dashboard");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="overflow-hidden relative">
      {/* Container */}
      <div className="relative z-10 h-full w-full flex items-center justify-end px-20">
        {/* Login Card */}
        <div className="w-[420px] bg-white border border-white rounded-2xl p-10">
          {/* Icon */}
          <div className="mb-4 flex flex-col items-center pt-4">
            <Image
              src="/images/helPhin 2.svg"
              alt="Logo Helphin"
              width={150}
              height={50}
              priority
            />
          </div>

          {/* Teks */}
          <p className="text-black text-center mt-2 mb-8">
            Masukkan alamat email dan kata sandi Anda<br />di bawah ini untuk masuk ke akun Anda
          </p>

          {/* Form */}
          <form className="flex flex-col gap-4" onSubmit={handleLogin}>

            {error && (
              <div className="p-3 text-sm text-red-500 bg-red-50 border border-red-200 rounded-lg text-center">
                {error}
              </div>
            )}

            {/* Email */}
            <div>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email"
                required
                className="w-full mt-1 px-4 py-3 rounded-lg bg-white text-gray-800 border border-gray-300 outline-none transition-all duration-300 ease-in-out hover:border-blue-400 focus:border-blue-600 focus:ring-2 focus:ring-blue-200"
              />
            </div>

            {/* Password */}
            <div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                required
                className="w-full mt-1 px-4 py-3 rounded-lg bg-white text-gray-800 border border-gray-300 outline-none transition-all duration-300 ease-in-out hover:border-blue-400 focus:border-blue-600 focus:ring-2 focus:ring-blue-200"
              />
            </div>

            {/* Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="mt-4 bg-[#068DFF] hover:bg-blue-700 disabled:opacity-50 transition duration-300 text-white py-3 rounded-lg font-semibold shadow-lg"
            >
              {isLoading ? "Memproses..." : "Masuk"}
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}