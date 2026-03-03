"use client";
import { useState, useEffect } from "react";
import Image from "next/image";
import HeaderDashboard from "./components/header_dashboard";
import FooterDashboard from "./components/footer_dashboard";
import ChartStatisLoginUser from "./components/chart_statis_login_user";
import StatTelkom from "./components/stat_telkom";
import Leaderboard from "./components/leaderboard";
import AdminDashboard from "./components/admin_dashboard";

export default function Dashboard() {
  const [userRole, setUserRole] = useState<string>("");

  useEffect(() => {
    const userStr = localStorage.getItem("user");
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        setUserRole(user.role || "");
      } catch (e) {
        console.error("Failed to parse user data", e);
      }
    }
  }, []);

  // Admin dashboard
  if (userRole === "admin") {
    return <AdminDashboard />;
  }

  // Super Admin dashboard (existing)
  return (
    <div className="flex flex-col min-h-screen bg-gray-50 text-gray-800">
      <HeaderDashboard />
      <div className="flex justify-between items-center my-2">
        <h1 className="text-lg">Aktivitas Anda</h1>
        <Image
          src="/Assets/helphin_1.png"
          alt="helphin_1"
          width={75}
          height={75}
          priority
        />
      </div>
      <div className="flex">
        <ChartStatisLoginUser />
        <StatTelkom />
      </div>
      <Leaderboard />
      <FooterDashboard />
    </div>
  );
}
