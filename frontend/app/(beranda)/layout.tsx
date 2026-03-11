"use client";

import { useState, useEffect, ReactNode } from "react";
import { ChevronDown, ChevronRight, Bell, Moon } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { usePathname } from "next/navigation";
import SessionManager from "@/app/components/SessionManager";

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
    const fetchMe = async () => {
      try {
        const token = localStorage.getItem("accessToken");
        if (!token) return;
        const res = await fetch("http://localhost:8000/api/auth/me", {
          headers: { Authorization: `Bearer ${token}` }
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
          setUserInitials(nameParts[0] ? nameParts[0].substring(0, 2).toUpperCase() : "U");
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
    setOpenMenus(prev => ({
      ...prev,
      [menuName]: !prev[menuName]
    }));
  };

  const superAdminMenu: MenuItem[] = [
    {
      name: "Dashboard",
      icon: "/Assets/icons/home-active-icon.svg",
      hasSubmenu: false,
      path: "/dashboard",
      permission: "dashboard:view",
    },
    {
      name: "Manajemen Akun",
      icon: "/Assets/icons/manajemen-icon.svg",
      hasSubmenu: true,
      permission: "akun:view",
      submenu: [
        { name: "Akun", path: "/manajemen/akun" },
        { name: "Role", path: "/manajemen/role" },
      ],
    },
    {
      name: "Manajemen Akademik",
      icon: "/Assets/icons/manajemen-icon.svg",
      hasSubmenu: true,
      permission: "prodi:view",
      submenu: [
        { name: "Fakultas", path: "/manajemen/fakultas" },
        { name: "Prodi", path: "/manajemen/prodi" },
        { name: "Mata Kuliah", path: "/manajemen/matkul" },
      ],
    },
    {
      name: "Manajemen Konten",
      icon: "/Assets/icons/manajemen-icon.svg",
      hasSubmenu: true,
      permission: "responsi:view",
      submenu: [
        { name: "Responsi", path: "/manajemen/responsi" },
        { name: "Materi", path: "/manajemen/materi" },
        { name: "Video", path: "/manajemen/video" },
        { name: "Latihan Soal", path: "/manajemen/latihan-soal" },
        { name: "Request Materi", path: "/manajemen/request-materi" },
      ],
    },
    {
      name: "Log Activity",
      icon: "/Assets/icons/log_activity-icon.svg",
      hasSubmenu: false,
      path: "/log_activity",
      permission: "log:view",
    },
    {
      name: "Setelan",
      icon: "/Assets/icons/setting-icon.svg",
      hasSubmenu: false,
      path: "/setelan",
    },
  ];

  const adminMenu: MenuItem[] = [
    {
      name: "Dashboard",
      icon: "/Assets/icons/home-active-icon.svg",
      hasSubmenu: false,
      path: "/dashboard",
      permission: "dashboard:view",
    },
    {
      name: "Mata Kuliah",
      icon: "/Assets/icons/manajemen-icon.svg",
      hasSubmenu: false,
      path: "/mata-kuliah",
      permission: "materi:view",
    },
    {
      name: "Setelan",
      icon: "/Assets/icons/setting-icon.svg",
      hasSubmenu: false,
      path: "/setelan",
    },
  ];

  // Super Admin: show all menus; Admin/others: show only Dashboard + Setelan
  const menuItems: MenuItem[] = userPermissions.includes("*")
    ? superAdminMenu
    : adminMenu;

  const isActive = (path?: string) => {
    if (!path) return false;
    // Use startsWith so sub-pages (e.g. /manajemen/video/tambah) still highlight /manajemen/video
    return pathname === path || pathname.startsWith(path + "/");
  };

  const isSubmenuActive = (submenu?: SubMenuItem[]) => {
    if (!submenu) return false;
    return submenu.some((sub) => pathname === sub.path || pathname.startsWith(sub.path + "/"));
  };

  return (
    <SessionManager>
      <div className="flex h-screen bg-gray-50">
        {/* Sidebar */}
        <div className="w-55 bg-white shadow-lg flex flex-col border-r border-gray-100">
          <div className="px-4 py-8">
            <Image
              src="/Assets/Logo-helphin-biru.png"
              alt="Logo Helphin"
              width={120}
              height={40}
              priority
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
                      className={`w-full flex items-center justify-between px-4 py-3 rounded-lg transition-colors ${activeParent
                        ? "bg-blue-50 text-blue-600"
                        : "text-gray-700 hover:bg-gray-100"
                        }`}
                    >
                      <div className="flex items-center gap-3">
                        <Image
                          src={item.icon}
                          alt={item.name}
                          width={20}
                          height={20}
                          priority
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
                            className={`w-full text-left px-4 py-2.5 rounded-lg transition-colors ${isActive(sub.path)
                              ? "bg-blue-500 text-white font-medium"
                              : "text-gray-600 hover:bg-gray-100"
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
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${isActive(item.path)
                    ? "bg-blue-500 text-white"
                    : "text-gray-700 hover:bg-gray-100"
                    }`}
                >
                  <Image
                    src={item.icon}
                    alt={item.name}
                    width={20}
                    height={20}
                    priority
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
              <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                <Moon size={20} className="text-gray-600" />
              </button>

              <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors relative">
                <Bell size={20} className="text-gray-600" />
                {/* <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span> */}
              </button>

              {/* Profile Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                  className="flex items-center gap-3 px-3 py-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <div className="w-10 h-10 bg-orange-400 rounded-full flex items-center justify-center">
                    <span className="text-white font-semibold">{userInitials}</span>
                  </div>
                  <div className="text-left hidden sm:block">
                    <p className="text-sm font-semibold text-gray-800">
                      {userName}
                    </p>
                    <p className="text-xs text-gray-500">{userEmail}</p>
                  </div>
                  <ChevronDown size={18} className="text-gray-600" />
                </button>

                {/* Dropdown Menu */}
                {isProfileOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-1 z-50 border border-gray-100">
                    <button
                      onClick={() => {
                        setIsProfileOpen(false);
                        router.push("/profile");
                      }}
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      Profil Saya
                    </button>
                    <div className="border-t border-gray-100 my-1"></div>
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                    >
                      Logout
                    </button>
                  </div>
                )}
              </div>
            </div>
          </header>

          {/* Content Area */}
          <main className="flex-1 px-8 pb-8 overflow-auto">{children}</main>
        </div>
      </div>
    </SessionManager>
  );
}
