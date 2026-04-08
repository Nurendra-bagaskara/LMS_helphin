"use client";

import { useState } from "react";
import { ChevronDown, ChevronRight, PanelLeftClose, PanelLeftOpen } from "lucide-react";
import Image from "next/image";
import { useRouter, usePathname } from "next/navigation";

export interface SubMenuItem {
  name: string;
  path: string;
  activeAliases?: string[];
}

export interface MenuItem {
  name: string;
  icon: string;
  path?: string;
  hasSubmenu: boolean;
  submenu?: SubMenuItem[];
  permission?: string;
  activeAliases?: string[];
}

interface SidebarProps {
  menuItems: MenuItem[];
  logoSrc?: string;
}

export default function Sidebar({ menuItems, logoSrc = "/Assets/Logo-helphin-biru.png" }: SidebarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [openMenus, setOpenMenus] = useState<{ [key: string]: boolean }>({});
  const [collapsed, setCollapsed] = useState(false);

  const toggleMenu = (menuName: string) => {
    setOpenMenus((prev) => ({
      ...prev,
      [menuName]: !prev[menuName],
    }));
  };

  const isActive = (path?: string, aliases?: string[]) => {
    if (!path) return false;
    if (pathname === path || pathname.startsWith(path + "/")) return true;
    if (aliases && aliases.some(alias => pathname.startsWith(alias))) return true;
    return false;
  };

  const isSubmenuActive = (submenu?: SubMenuItem[]) => {
    if (!submenu) return false;
    return submenu.some((sub) => isActive(sub.path, sub.activeAliases));
  };

  return (
    <div
      className={`bg-white dark:bg-slate-900 shadow-lg flex flex-col border-r border-gray-100 dark:border-slate-800 h-screen sticky top-0 transition-all duration-300 ease-in-out ${
        collapsed ? "w-[72px]" : "w-64"
      }`}
    >
      {/* Logo + Toggle */}
      <div className={`flex items-center py-8 transition-all duration-300 ${collapsed ? "px-3 justify-center" : "px-6 justify-between"}`}>
        {!collapsed && (
          <Image
            src={logoSrc}
            alt="Logo"
            width={130}
            height={45}
            priority
            className="object-contain dark:brightness-0 dark:invert"
          />
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="w-9 h-9 rounded-xl bg-slate-50 dark:bg-slate-800 hover:bg-blue-50 dark:hover:bg-blue-900/40 text-slate-400 dark:text-slate-500 hover:text-blue-600 dark:hover:text-blue-400 flex items-center justify-center transition-all shrink-0"
          title={collapsed ? "Buka Sidebar" : "Tutup Sidebar"}
        >
          {collapsed ? <PanelLeftOpen size={18} /> : <PanelLeftClose size={18} />}
        </button>
      </div>

      <nav className="flex-1 px-2 space-y-2 overflow-y-auto pb-4 scrollbar-hide">
        {menuItems.map((item) => {
          if (item.hasSubmenu) {
            const activeParent = isSubmenuActive(item.submenu);

            return (
              <div key={item.name} className="group">
                <button
                  onClick={() => collapsed ? (item.path && router.push(item.path)) : toggleMenu(item.name)}
                  className={`w-full flex items-center ${collapsed ? "justify-center" : "justify-between"} px-3 py-3 rounded-xl transition-all duration-200 relative ${
                    activeParent
                      ? "bg-blue-50/80 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400"
                      : "text-gray-500 dark:text-slate-400 hover:bg-gray-50 dark:hover:bg-slate-800 hover:text-gray-900 dark:hover:text-slate-100"
                  }`}
                  title={collapsed ? item.name : undefined}
                >
                  {activeParent && (
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-blue-600 dark:bg-blue-500 rounded-r-full" />
                  )}
                  <div className="flex items-center gap-3">
                    <div className={`p-1.5 rounded-lg ${activeParent ? "bg-blue-100/50 dark:bg-blue-900/40" : "group-hover:bg-gray-100/80 dark:group-hover:bg-slate-800 transition-colors"}`}>
                      <Image
                        src={item.icon}
                        alt={item.name}
                        width={20}
                        height={20}
                        priority
                        className={activeParent ? "brightness-0 invert-[44%] sepia-[96%] saturate-[1518%] hue-rotate-[189deg] brightness-[101%] contrast-[101%] dark:brightness-200" : "brightness-0 opacity-40 group-hover:opacity-100 transition-all dark:invert dark:opacity-50"}
                      />
                    </div>
                    {!collapsed && <span className="font-semibold text-[13.5px]">{item.name}</span>}
                  </div>
                  {!collapsed && (
                    openMenus[item.name] || activeParent ? (
                      <ChevronDown size={16} className="text-blue-500 dark:text-blue-400" />
                    ) : (
                      <ChevronRight size={16} className="text-gray-400 group-hover:text-gray-600 dark:group-hover:text-slate-300" />
                    )
                  )}
                </button>

                {!collapsed && (openMenus[item.name] || activeParent) && (
                  <div className="ml-9 mt-1.5 space-y-1.5 border-l-2 border-gray-100 dark:border-slate-800 pl-3">
                    {item.submenu?.map((sub) => (
                      <button
                        key={sub.name}
                        onClick={() => router.push(sub.path)}
                        className={`w-full text-left px-4 py-2.5 rounded-lg text-sm transition-all duration-200 relative ${
                          isActive(sub.path)
                            ? "bg-blue-100/50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 font-bold"
                            : "text-gray-500 dark:text-slate-400 hover:bg-gray-50 dark:hover:bg-slate-800 hover:text-gray-900 dark:hover:text-slate-100"
                        }`}
                      >
                        {isActive(sub.path) && (
                          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-4 bg-blue-600 dark:bg-blue-500 rounded-r-full" />
                        )}
                        {sub.name}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            );
          }

          const active = isActive(item.path, item.activeAliases);

          return (
            <button
              key={item.name}
              onClick={() => item.path && router.push(item.path)}
              className={`w-full group flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 relative ${
                collapsed ? "justify-center" : ""
              } ${
                active
                  ? "bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400"
                  : "text-gray-500 dark:text-slate-400 hover:bg-gray-50 dark:hover:bg-slate-800 hover:text-gray-900 dark:hover:text-slate-100"
              }`}
              title={collapsed ? item.name : undefined}
            >
              {active && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-blue-600 dark:bg-blue-500 rounded-r-full" />
              )}
              <div className={`p-1.5 rounded-lg ${active ? "bg-blue-100/50 dark:bg-blue-900/40" : "group-hover:bg-gray-100/80 dark:group-hover:bg-slate-800 transition-colors"}`}>
                <Image
                    src={item.icon}
                    alt={item.name}
                    width={20}
                    height={20}
                    priority
                    className={active ? "brightness-0 invert-[44%] sepia-[96%] saturate-[1518%] hue-rotate-[189deg] brightness-[101%] contrast-[101%] dark:brightness-200" : "brightness-0 opacity-40 group-hover:opacity-100 transition-all dark:invert dark:opacity-50"}
                  />
              </div>
              {!collapsed && <span className="font-semibold text-[13.5px]">{item.name}</span>}
            </button>
          );
        })}
      </nav>
    </div>
  );
}
