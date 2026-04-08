"use client";

import { ReactNode, useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import Sidebar, { MenuItem } from "@/components/Sidebar";
import Navbar from "@/components/Navbar";
import SessionManager from "@/app/components/SessionManager";

const studentMenuItems: MenuItem[] = [
  {
    name: "Dashboard",
    icon: "/Assets/icons/home-active-icon.svg",
    hasSubmenu: false,
    path: "/student/dashboard",
  },
  {
    name: "Mata Kuliah",
    icon: "/Assets/icons/manajemen-icon.svg",
    hasSubmenu: false,
    path: "/student/mata-kuliah",
    activeAliases: [
      "/student/responsi",
      "/student/video",
      "/student/quiz",
      "/student/material",
      "/student/materi",
      "/student/bank-soal"
    ],
  },
  {
    name: "Matkul Prodi Lain",
    icon: "/Assets/icons/code_icon.svg",
    hasSubmenu: false,
    path: "/student/matkul-prodi-lain",
  },
];

export default function StudentLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [isGuest, setIsGuest] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (!token && pathname && pathname.startsWith("/student/responsi/")) {
      setIsGuest(true);
    } else {
      setIsGuest(false);
    }
  }, [pathname]);

  if (isGuest) {
    return (
      <SessionManager>
        <div className="flex bg-[#F8FAFC] dark:bg-slate-950 min-h-screen transition-colors duration-300">
          <main className="flex-1 w-full bg-[#F8FAFC] dark:bg-slate-950">
            {children}
          </main>
        </div>
      </SessionManager>
    );
  }

  return (
    <SessionManager>
      <div className="flex h-screen bg-[#F8FAFC] dark:bg-slate-950 transition-colors duration-300">
        <Sidebar menuItems={studentMenuItems} />
        <div className="flex-1 flex flex-col overflow-hidden">
          <Navbar />
          <main className="flex-1 overflow-y-auto bg-[#F8FAFC] dark:bg-slate-950 transition-colors duration-300">
            {children}
          </main>
        </div>
      </div>
    </SessionManager>
  );
}
