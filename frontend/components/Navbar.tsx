import { useState, useEffect, useRef } from "react";
import { Bell, Moon, Sun, ChevronDown, User, LogOut, Calendar, Clock, ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTheme } from "../context/ThemeContext";

interface NavbarProps {
  user?: {
    id: string;
    username: string;
    name: string;
    email: string;
    role: string;
    initials: string;
    prodiId?: string;
  };
}

export default function Navbar({ user: initialUser }: NavbarProps) {
  const router = useRouter();
  const { theme, toggleTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [user, setUser] = useState<any>(initialUser);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [hasNewNotif, setHasNewNotif] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
    const userStr = localStorage.getItem("user");
    if (userStr) {
      try {
        const parsedUser = JSON.parse(userStr);
        const nameParts = (parsedUser.name || "User").split(" ");
        const initials = nameParts.length >= 2 
          ? `${nameParts[0][0]}${nameParts[1][0]}`.toUpperCase()
          : (nameParts[0] ? nameParts[0].substring(0, 2).toUpperCase() : "U");
        
        const userData = {
          ...parsedUser,
          initials: initials
        };
        setUser(userData);
        
        // Fetch Notifications if it's a student or has prodiId
        if (parsedUser.role === "student" && parsedUser.prodiId) {
          fetchNotifications(parsedUser.prodiId);
        }
      } catch (e) {
        console.error("Failed to parse user", e);
      }
    }

    // Close dropdowns on click outside
    const handleClickOutside = (event: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setIsNotifOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const fetchNotifications = async (prodiId: string) => {
    try {
      const res = await fetch(`http://localhost:8000/api/responsi?prodiId=${prodiId}&limit=5&sort=createdAt`);
      const data = await res.json();
      if (data.success && data.data.length > 0) {
        setNotifications(data.data);
        
        // Check localStorage for last seen ID
        const lastSeenId = localStorage.getItem("lastSeenResponsiId");
        const latestId = data.data[0].id;
        
        if (lastSeenId !== latestId) {
          setHasNewNotif(true);
        }
      }
    } catch (e) {
      console.error("Failed fetching notifications", e);
    }
  };

  const handleOpenNotif = () => {
    setIsNotifOpen(!isNotifOpen);
    if (!isNotifOpen && notifications.length > 0) {
      // Mark as seen
      setHasNewNotif(false);
      localStorage.setItem("lastSeenResponsiId", notifications[0].id);
    }
    setIsProfileOpen(false);
  };

  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("user");
    router.push("/login");
  };

  const formatNotifTime = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 60) return `${diffMins}m lalu`;
    if (diffHours < 24) return `${diffHours}j lalu`;
    return `${diffDays}h lalu`;
  };

  return (
    <header className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md sticky top-0 z-30 px-8 py-3 flex items-center justify-end border-b border-gray-100 dark:border-slate-800 transition-colors duration-300">
      <div className="flex items-center gap-5">
        <button 
          onClick={toggleTheme}
          className="p-2.5 hover:bg-gray-100/80 dark:hover:bg-slate-800 rounded-xl transition-all duration-200"
        >
          {mounted && theme === "dark" ? (
            <Sun size={20} className="text-yellow-400" />
          ) : (
            <Moon size={20} className="text-gray-500 dark:text-slate-400" />
          )}
        </button>

        {/* Notification Bell */}
        <div className="relative" ref={notifRef}>
          <button 
            onClick={handleOpenNotif}
            className={`p-2.5 rounded-xl transition-all duration-200 relative ${isNotifOpen ? "bg-red-50 text-red-500" : "hover:bg-gray-100/80 dark:hover:bg-slate-800 text-gray-500 dark:text-slate-400"}`}
          >
            <Bell size={20} className={isNotifOpen ? "animate-pulse" : ""} />
            {hasNewNotif && (
              <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white dark:ring-slate-900 animate-bounce"></span>
            )}
          </button>

          {/* Notification Dropdown */}
          {isNotifOpen && (
            <div className="absolute right-0 mt-3 w-80 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl rounded-[24px] shadow-2xl py-4 z-50 border border-gray-100 dark:border-slate-800 animate-in fade-in zoom-in-95 duration-200 origin-top-right">
              <div className="px-5 pb-3 border-b border-gray-50 dark:border-slate-800 flex items-center justify-between">
                <h3 className="text-sm font-black text-slate-800 dark:text-slate-100 tracking-tight uppercase">Pemberitahuan</h3>
                <span className="text-[10px] font-black bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 px-2 py-0.5 rounded-full uppercase">Terbaru</span>
              </div>
              
              <div className="max-h-[360px] overflow-y-auto px-2 py-2">
                {notifications.length === 0 ? (
                  <div className="py-10 text-center flex flex-col items-center gap-3">
                    <div className="w-12 h-12 bg-gray-50 dark:bg-slate-800 rounded-full flex items-center justify-center text-gray-300 dark:text-slate-700">
                      <Bell size={24} />
                    </div>
                    <p className="text-xs font-semibold text-gray-400 dark:text-slate-500">Belum ada notifikasi baru</p>
                  </div>
                ) : (
                  notifications.map((notif) => (
                    <button
                      key={notif.id}
                      onClick={() => {
                        setIsNotifOpen(false);
                        router.push(`/student/responsi/${notif.id}`);
                      }}
                      className="w-full text-left p-3.5 hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded-2xl transition-all group flex gap-3 items-start"
                    >
                      <div className="w-10 h-10 rounded-xl bg-red-50 dark:bg-red-900/20 text-red-500 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                        <Calendar size={18} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[13px] font-black text-slate-800 dark:text-slate-100 leading-tight mb-1 truncate">
                          Responsi Baru: {notif.title}
                        </p>
                        <div className="flex items-center gap-3 text-[10px] font-bold text-slate-400 dark:text-slate-500">
                          <span className="flex items-center gap-1">
                            <Clock size={10} /> {formatNotifTime(notif.createdAt)}
                          </span>
                          <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
                          <span className="truncate">{notif.mataKuliahName}</span>
                        </div>
                      </div>
                      <ArrowRight size={14} className="text-slate-200 dark:text-slate-800 group-hover:text-red-400 transition-colors shrink-0" />
                    </button>
                  ))
                )}
              </div>

              {notifications.length > 0 && (
                <div className="px-3 pt-3 mt-1 border-t border-gray-50 dark:border-slate-800">
                  <button 
                    onClick={() => {
                      setIsNotifOpen(false);
                      router.push("/student/responsi");
                    }}
                    className="w-full py-2.5 text-[11px] font-black text-slate-400 dark:text-slate-500 hover:text-red-500 dark:hover:text-red-400 text-center uppercase tracking-widest transition-colors"
                  >
                    Lihat Semua Responsi
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="h-8 w-px bg-gray-200 dark:bg-slate-800 mx-1"></div>

        {/* Profile Dropdown */}
        <div className="relative" ref={profileRef}>
          <button
            onClick={() => {
              setIsProfileOpen(!isProfileOpen);
              setIsNotifOpen(false);
            }}
            className={`flex items-center gap-3.5 pl-2 pr-1.5 py-1.5 rounded-2xl transition-all duration-300 group ${isProfileOpen ? "bg-gray-50/80 dark:bg-slate-800" : "hover:bg-gray-50/80 dark:hover:bg-slate-800"}`}
          >
            <div className="w-10 h-10 bg-gradient-to-br from-[#068DFF] to-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-100 dark:shadow-none group-hover:scale-105 transition-transform">
              <span className="text-white font-bold text-sm">
                {user?.initials || "?"}
              </span>
            </div>
            <div className="text-left hidden sm:block">
              <p className="text-[13.5px] font-bold text-gray-800 dark:text-slate-200 leading-none mb-1 truncate max-w-[120px]">
                {user?.name || "Loading..."}
              </p>
              <p className="text-[11px] text-gray-500 dark:text-slate-400 font-medium truncate max-w-[120px]">{user?.email}</p>
            </div>
            <ChevronDown size={16} className={`text-gray-400 transition-transform duration-300 ${isProfileOpen ? "rotate-180" : ""}`} />
          </button>

          {/* Profile Dropdown Menu */}
          {isProfileOpen && (
            <div className="absolute right-0 mt-3 w-56 bg-white dark:bg-slate-900 rounded-[24px] shadow-2xl py-2 z-50 border border-gray-100 dark:border-slate-800 animate-in fade-in zoom-in-95 duration-200 origin-top-right">
              <div className="px-4 py-2 border-b border-gray-50 dark:border-slate-800 mb-1">
                <p className="text-sm font-black text-slate-800 dark:text-slate-100">{user?.name}</p>
                <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">{user?.role?.replace("_", " ")}</p>
              </div>
              <button
                onClick={() => {
                  setIsProfileOpen(false);
                  const role = user?.role || "";
                  if (role === "admin" || role === "admin_prodi") {
                    router.push("/admin/profile");
                  } else if (role === "super_admin") {
                    router.push("/superadmin/profile");
                  } else {
                    router.push("/student/profile");
                  }
                }}
                className="w-[calc(100%-16px)] mx-2 flex items-center gap-3 px-3 py-2.5 text-sm font-bold text-slate-600 dark:text-slate-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 hover:text-blue-600 dark:hover:text-blue-400 rounded-xl transition-all duration-200"
              >
                <User size={16} />
                <span>Profil Terverifikasi</span>
              </button>
              <div className="border-t border-gray-50 dark:border-slate-800 my-1.5"></div>
              <button
                onClick={handleLogout}
                className="w-[calc(100%-16px)] mx-2 flex items-center gap-3 px-3 py-2.5 text-sm font-bold text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-xl transition-all duration-200"
              >
                <LogOut size={16} />
                <span>Keluar Aplikasi</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
