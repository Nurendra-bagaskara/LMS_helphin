"use client";
import { useState, useEffect } from "react";
import Image from "next/image";

export default function HeaderDashboard() {
  const [userName, setUserName] = useState("User");

  useEffect(() => {
    // Get user info from localStorage
    const userStr = localStorage.getItem("user");
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        setUserName(user.name || "User");
      } catch (e) {
        console.error("Failed to parse user data", e);
      }
    }

    // Fetch prodi name and mata kuliah
    const token = localStorage.getItem("accessToken");
    if (!token) return;
  }, []);

  const firstName = userName.split(" ")[0];

  return (
    <header className="overflow-hidden flex justify-between mt-5 pl-5 bg-gradient-to-r from-[#0055FF] to-[#07A3F9] to-75% rounded-lg text-white shadow-lg">
      <div className="flex flex-col justify-end pb-5">
        <h1 className="font-bold text-3xl mb-1">Hallo, {firstName} 👋</h1>
        <p className="text-sm opacity-75 mt-1">by helPhin</p>
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
