"use client";

import { useState, useEffect, ReactNode } from "react";
import { ChevronDown, ChevronRight, Bell, Moon, Sun } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { usePathname } from "next/navigation";
import SessionManager from "@/app/components/SessionManager";
import { useTheme } from "../../context/ThemeContext";

interface BerandaLayoutProps {
  children: ReactNode;
}

type SubMenuItem = {
  name: string;
  path: string;
};

type MenuItem = {
  name: string;
  icon: string;
  path?: string;
  hasSubmenu: boolean;
  submenu?: SubMenuItem[];
  permission?: string;
};

export default function BerandaLayout({ children }: BerandaLayoutProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { theme, toggleTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [openMenus, setOpenMenus] = useState<{ [key: string]: boolean }>({
    "Manajemen Akun": true,
    "Manajemen Akademik": true,
  });
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const [userName, setUserName] = useState("Loading...");
  const [userEmail, setUserEmail] = useState("");
  const [userInitials, setUserInitials] = useState("?");
  const [userRole, setUserRole] = useState<string>("");
  const [userPermissions, setUserPermissions] = useState<string[]>([]);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const fetchMe = async () => {
      try {
        const token = localStorage.getItem("accessToken");
        if (!token) return;
        const res = await fetch("http://localhost:8000/api/auth/me", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (data.success) {
          localStorage.setItem("user", JSON.stringify(data.data));
          setUserName(data.data.name || "User");
          setUserEmail(data.data.email || "");
          setUserRole(data.data.role || "");
          setUserPermissions(data.data.permissions || []);
        }
      } catch (e) {
        console.error("Gagal sync user data", e);
      }
    };

    const userStr = localStorage.getItem("user");
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        setUserName(user.name || "User");
        setUserEmail(user.email || "");
        setUserRole(user.role || "");
        setUserPermissions(user.permissions || []);

        // If permissions are missing or empty (stale session), fetch latest profile
        if (!user.permissions || user.permissions.length === 0) {
          fetchMe();
        }

        const nameParts = (user.name || "U").split(" ");
        if (nameParts.length >= 2) {
          setUserInitials(`${nameParts[0][0]}${nameParts[1][0]}`.toUpperCase());
        } else {
          setUserInitials(
            nameParts[0] ? nameParts[0].substring(0, 2).toUpperCase() : "U",
          );
        }
      } catch (e) {
        console.error("Failed to parse user data", e);
      }
    } else {
      fetchMe();
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("user");
    router.push("/login");
  };

  const toggleMenu = (menuName: string) => {
    setOpenMenus((prev) => ({
      ...prev,
      [menuName]: !prev[menuName],
    }));
  };

  const superAdminMenu: MenuItem[] = [
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

  const adminMenu: MenuItem[] = [
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
      permission: "materi:view",
    },
    {
      name: "Manajemen Konten",
      icon: "/Assets/icons/manajemen-icon.svg",
      hasSubmenu: true,
      submenu: [
        { name: "Materi", path: "/admin/manajemen/materi" },
        { name: "Video", path: "/admin/manajemen/video" },
        { name: "Responsi", path: "/admin/manajemen/responsi" },
      ],
    },
    {
      name: "Bank Soal",
      icon: "/Assets/icons/manajemen-icon.svg",
      hasSubmenu: false,
      path: "/admin/bank-soal",
      permission: "bank_soal:view",
    },
    {
      name: "Setelan",
      icon: "/Assets/icons/setting-icon.svg",
      hasSubmenu: false,
      path: "/admin/setelan",
    },
  ];

  // Super Admin: show all menus; Admin: show admin menus; Others: minimal
  const menuItems: MenuItem[] = userPermissions.includes("*")
    ? superAdminMenu
    : userRole === "admin"
      ? adminMenu
      : adminMenu;

  const isActive = (path?: string) => {
    if (!path) return false;
    // Use startsWith so sub-pages (e.g. /manajemen/video/tambah) still highlight /manajemen/video
    return pathname === path || pathname.startsWith(path + "/");
  };

  const isSubmenuActive = (submenu?: SubMenuItem[]) => {
    if (!submenu) return false;
    return submenu.some(
      (sub) => pathname === sub.path || pathname.startsWith(sub.path + "/"),
    );
  };

  return (
    <SessionManager>
      <div className="flex h-screen bg-gray-50 dark:bg-slate-950 transition-all duration-300">
        {/* Sidebar */}
        <div className="w-55 bg-white dark:bg-slate-900 shadow-lg flex flex-col border-r border-gray-100 dark:border-slate-800 transition-all duration-300">
          <div className="px-4 py-8">
            <Image
              src="/Assets/Logo-helphin-biru.png"
              alt="Logo Helphin"
              width={120}
              height={40}
              priority
              className="dark:brightness-0 dark:invert"
            />
          </div>

          {/* Menu Items */}
          <nav className="flex-1 px-4 space-y-2 overflow-y-auto pb-4">
            {menuItems.map((item) => {
              if (item.hasSubmenu) {
                const activeParent = isSubmenuActive(item.submenu);

                return (
                  <div key={item.name}>
                    <button
                      onClick={() => toggleMenu(item.name)}
                      className={`w-full flex items-center justify-between px-4 py-3 rounded-lg transition-colors ${
                        activeParent
                          ? "bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400"
                          : "text-gray-700 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-800"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Image
                          src={item.icon}
                          alt={item.name}
                          width={20}
                          height={20}
                          priority
                          className="dark:invert dark:opacity-70"
                        />
                        <span className="font-medium text-sm">{item.name}</span>
                      </div>
                      {openMenus[item.name] ? (
                        <ChevronDown size={18} />
                      ) : (
                        <ChevronRight size={18} />
                      )}
                    </button>

                    {openMenus[item.name] && (
                      <div className="ml-6 mt-1 space-y-1">
                        {item.submenu?.map((sub) => (
                          <button
                            key={sub.name}
                            onClick={() => router.push(sub.path)}
                            className={`w-full text-left px-4 py-2.5 rounded-lg transition-colors ${
                              isActive(sub.path)
                                ? "bg-blue-500 text-white font-medium shadow-md shadow-blue-500/20"
                                : "text-gray-600 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-slate-800"
                            }`}
                          >
                            {sub.name}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                );
              }

              return (
                <button
                  key={item.name}
                  onClick={() => item.path && router.push(item.path)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    isActive(item.path)
                      ? "bg-blue-500 text-white shadow-md shadow-blue-500/20"
                      : "text-gray-700 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-800"
                  }`}
                >
                  <Image
                    src={item.icon}
                    alt={item.name}
                    width={20}
                    height={20}
                    priority
                    className="dark:invert dark:opacity-70"
                  />
                  <span className="font-medium">{item.name}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col">
          {/* Header */}
          <header className="bg-transparent px-8 pt-4 flex items-center justify-end">
            <div className="flex items-center gap-4">
              <button 
                onClick={toggleTheme}
                className="p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
              >
                {mounted && theme === "dark" ? (
                  <Sun size={20} className="text-yellow-400" />
                ) : (
                  <Moon size={20} className="text-gray-600 dark:text-slate-400" />
                )}
              </button>

              <button className="p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg transition-colors relative">
                <Bell size={20} className="text-gray-600 dark:text-slate-400" />
              </button>

              {/* Profile Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                  className="flex items-center gap-3 px-3 py-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                >
                  <div className="w-10 h-10 bg-orange-400 rounded-full flex items-center justify-center shadow-lg shadow-orange-400/20">
                    <span className="text-white font-semibold">
                      {userInitials}
                    </span>
                  </div>
                  <div className="text-left hidden sm:block">
                    <p className="text-sm font-semibold text-gray-800 dark:text-slate-200">
                      {userName}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-slate-500">{userEmail}</p>
                  </div>
                  <ChevronDown size={18} className="text-gray-600 dark:text-slate-500" />
                </button>

                {/* Dropdown Menu */}
                {isProfileOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-slate-900 rounded-xl shadow-xl py-1 z-50 border border-gray-100 dark:border-slate-800">
                    <button
                      onClick={() => {
                        setIsProfileOpen(false);
                        router.push("/profile");
                      }}
                      className="w-full text-left px-4 py-2.5 text-sm text-gray-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors"
                    >
                      Profil Saya
                    </button>
                    <div className="border-t border-gray-100 dark:border-slate-800 my-1"></div>
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors"
                    >
                      Logout
                    </button>
                  </div>
                )}
              </div>
            </div>
          </header>

          {/* Content Area */}
          <main className="flex-1 px-8 pb-8 overflow-auto bg-gray-50 dark:bg-slate-950 transition-colors duration-300">{children}</main>
        </div>
      </div>
    </SessionManager>
  );
}
