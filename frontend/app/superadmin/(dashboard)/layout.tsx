"use client";

import { ReactNode } from "react";
import Sidebar, { MenuItem } from "@/components/Sidebar";
import Navbar from "@/components/Navbar";
import SessionManager from "@/app/components/SessionManager";

const superAdminMenuItems: MenuItem[] = [
  {
    name: "Dashboard",
    icon: "/Assets/icons/home-active-icon.svg",
    hasSubmenu: false,
    path: "/superadmin/dashboard",
    permission: "dashboard:view",
  },
  {
    name: "Manajemen Akun",
    icon: "/Assets/icons/manajemen-icon.svg",
    hasSubmenu: true,
    permission: "akun:view",
    submenu: [
      { name: "Akun", path: "/superadmin/manajemen/akun" },
      { name: "Role", path: "/superadmin/manajemen/role" },
    ],
  },
  {
    name: "Manajemen Akademik",
    icon: "/Assets/icons/manajemen-icon.svg",
    hasSubmenu: true,
    permission: "prodi:view",
    submenu: [
      { name: "Fakultas", path: "/superadmin/manajemen/fakultas" },
      { name: "Prodi", path: "/superadmin/manajemen/prodi" },
      { name: "Mata Kuliah", path: "/superadmin/manajemen/matkul" },
    ],
  },
  {
    name: "Manajemen Konten",
    icon: "/Assets/icons/manajemen-icon.svg",
    hasSubmenu: true,
    permission: "responsi:view",
    submenu: [
      { name: "Responsi", path: "/superadmin/manajemen/responsi" },
      { name: "Materi", path: "/superadmin/manajemen/materi" },
      { name: "Video", path: "/superadmin/manajemen/video" },
      { name: "Latihan Soal", path: "/superadmin/manajemen/latihan-soal" },
      { name: "Request Materi", path: "/superadmin/manajemen/request-materi" },
    ],
  },
  {
    name: "Bank Soal",
    icon: "/Assets/icons/manajemen-icon.svg",
    hasSubmenu: false,
    path: "/superadmin/bank-soal",
    permission: "bank_soal:view",
  },
  {
    name: "Log Activity",
    icon: "/Assets/icons/log_activity-icon.svg",
    hasSubmenu: false,
    path: "/superadmin/log_activity",
    permission: "log:view",
  },
  {
    name: "Setelan",
    icon: "/Assets/icons/setting-icon.svg",
    hasSubmenu: false,
    path: "/superadmin/setelan",
  },
];

export default function SuperAdminLayout({ children }: { children: ReactNode }) {
  return (
    <SessionManager>
      <div className="flex h-screen bg-[#F8FAFC]">
        <Sidebar menuItems={superAdminMenuItems} />
        <div className="flex-1 flex flex-col overflow-hidden">
          <Navbar />
          <main className="flex-1 overflow-y-auto bg-[#F8FAFC]">
            {children}
          </main>
        </div>
      </div>
    </SessionManager>
  );
}

