"use client";

import { ReactNode } from "react";
import Sidebar, { MenuItem } from "@/components/Sidebar";
import Navbar from "@/components/Navbar";
import SessionManager from "@/app/components/SessionManager";

const adminMenuItems: MenuItem[] = [
  {
    name: "Dashboard",
    icon: "/Assets/icons/home-active-icon.svg",
    hasSubmenu: false,
    path: "/admin/dashboard",
    permission: "dashboard:view",
  },
  {
    name: "Mata Kuliah",
    icon: "/Assets/icons/manajemen-icon.svg",
    hasSubmenu: false,
    path: "/admin/mata-kuliah",
    permission: "matkul:view",
  },
  {
    name: "Pusat Layanan",
    icon: "/Assets/icons/setting-icon.svg",
    hasSubmenu: false,
    path: "/admin/pusat-layanan",
  },
];

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <SessionManager>
      <div className="flex h-screen bg-[#F8FAFC] dark:bg-slate-950 transition-colors duration-300">
        <Sidebar menuItems={adminMenuItems} />
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
