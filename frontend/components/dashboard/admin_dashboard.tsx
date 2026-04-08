"use client";
import React, { useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import Link from "next/link";
import FooterDashboard from "@/components/dashboard/footer_dashboard";

interface MataKuliah {
  id: string;
  name: string;
}

export default function AdminDashboard() {
  const router = useRouter();
  const [userName, setUserName] = useState("User");
  const [prodiName, setProdiName] = useState("");
  const [stats, setStats] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

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

    const fetchDashboardData = async () => {
      try {
        const token = localStorage.getItem("accessToken");
        if (!token) return;

        const res = await fetch("http://localhost:8000/api/dashboard/stats", {
          headers: { Authorization: `Bearer ${token}` },
          cache: "no-store"
        });
        const data = await res.json();
        if (data.success) {
          setStats(data.data);
          if (data.data.prodiName) {
            setProdiName(data.data.prodiName);
          }
        }
      } catch (e) {
        console.error("Failed to fetch dashboard stats", e);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // Display first name only for greeting
  const firstName = userName.split(" ")[0];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  const isSuperAdmin = stats?.role === "super_admin";

  const statItems = isSuperAdmin 
    ? [
        { label: "Total Mahasiswa", value: stats?.totalStudents || "0", desc: "Mahasiswa terdaftar" },
        { label: "Total Course", value: stats?.totalCourses || "0", desc: "Mata kuliah tersedia" },
        { label: "Total Prodi", value: stats?.totalProdi || "0", desc: "Program studi aktif" },
        { label: "Total Materi", value: stats?.totalMaterials || "0", desc: "Materi terupload" }
      ]
    : [
        { label: "Total Mahasiswa", value: stats?.totalStudents || "0", desc: "Mahasiswa prodi" },
        { label: "Total Course", value: stats?.totalMaterials || "0", desc: "Materi prodi" },
        { label: "Total Request", value: stats?.totalRequests || "0", desc: "Saran materi" },
        { label: "Total Latihan", value: stats?.totalExercises || "0", desc: "Latihan soal" }
      ];

  return (
    <div className="flex flex-col gap-8 py-2 px-2 animate-in fade-in duration-500">
      {/* ======================== 1. WELCOME BANNER ======================== */}
      <header className="relative w-full h-[180px] rounded-2xl overflow-hidden bg-gradient-to-r from-[#0055FF] to-[#07A3F9] shadow-lg flex items-center">
        <div className="relative z-10 pl-8 text-white">
          <h1 className="text-3xl font-extrabold mb-1 drop-shadow-sm">Hallo, {firstName} 👋</h1>
          {prodiName && (
            <p className="text-xl font-bold opacity-90 drop-shadow-sm">Prodi {prodiName}</p>
          )}
          {!prodiName && isSuperAdmin && (
            <p className="text-xl font-bold opacity-90 drop-shadow-sm">Super Admin Dashboard</p>
          )}
          <p className="text-xs opacity-75 mt-2 font-medium">by helPhin</p>
        </div>

        <div className="absolute right-0 top-0 h-full w-[45%] z-5 overflow-hidden">
             <Image
                src="/Assets/gedung_kampus_image.png"
                alt="Gedung"
                fill
                className="object-cover object-left"
                priority
            />
            <div className="absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-[#07A3F9] to-transparent" />
        </div>
      </header>

      {/* ======================== 2. AKTIVITAS ANDA ======================== */}
      <section>
        <div className="flex items-center justify-between mb-5">
            <h2 className="text-lg font-bold text-gray-800">Aktivitas Anda</h2>
            <div className="relative w-12 h-12">
                <Image src="/images/Group 197.svg" alt="icon" width={40} height={40} className="object-contain" />
            </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Performance Chart Card (Still partially static as a placeholder for actual analytics) */}
          <div className="bg-[#EBF5FF] rounded-2xl p-6 border border-blue-100 shadow-sm flex items-center justify-between min-h-[220px]">
            <div className="flex flex-col gap-2">
              <span className="text-sm font-bold text-gray-500">Performa {isSuperAdmin ? "Sistem" : "Prodi"}</span>
              <div className="flex items-baseline gap-1 mt-4">
                <span className="text-5xl font-black text-gray-800">96%</span>
              </div>
              <div className="mt-4 flex flex-col gap-1.5">
                {[20, 90, 20].map((v, i) => (
                    <div key={i} className="flex items-center gap-2">
                        <span className="text-[10px] font-bold text-gray-400 w-6">{v}%</span>
                        <div className="w-24 h-1.5 bg-[#D4EAFF] rounded-full overflow-hidden">
                            <div className="h-full bg-blue-500 rounded-full" style={{ width: `${v}%` }}></div>
                        </div>
                    </div>
                ))}
              </div>
              <button className="mt-auto w-fit bg-white/80 hover:bg-white text-blue-500 text-[10px] font-bold px-4 py-1.5 rounded-md shadow-sm transition-all">
                Lihat Detail
              </button>
            </div>

            <div className="relative w-48 h-48">
              <Image 
                src="/Assets/perform.png" 
                alt="Performance" 
                fill 
                className="object-contain"
              />
            </div>
          </div>

          {/* Stats Grid Card */}
          <div className="grid grid-cols-2 gap-4">
            {statItems.map((stat, i) => (
              <div key={i} className="bg-white p-4 rounded-xl shadow-sm border border-gray-50 flex flex-col justify-between hover:shadow-md transition-all group">
                <div className="flex justify-between items-start">
                   <span className="text-[11px] font-bold text-gray-500 leading-tight">{stat.label}</span>
                   {i % 2 === 0 && (
                     <div className="w-12 h-6 relative opacity-60">
                        <Image src="/images/Vector 1.svg" alt="chart" fill className="object-contain" />
                     </div>
                   )}
                </div>
                <div className="mt-2 flex items-baseline gap-2">
                  <span className="text-2xl font-black text-gray-800">{stat.value}</span>
                  {i % 2 === 0 && <span className="w-10 h-10 -mt-2"><Image src="/images/background.svg" alt="" width={40} height={40} className="opacity-20" /></span>}
                </div>
                <p className="text-[9px] text-gray-400 font-medium mt-1 leading-tight">{stat.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ======================== 3. RANKING SECTION ======================== */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Course Terpopuler */}
        <div>
          <h2 className="text-lg font-bold text-gray-800 mb-6">Course Terpopuler</h2>
          <div className="space-y-4">
            {(stats?.mataKuliahTerpopuler || []).length > 0 ? (
              stats.mataKuliahTerpopuler.map((mk: any, i: number) => (
                <Link 
                  key={mk.id} 
                  href={isSuperAdmin ? `/superadmin/manajemen/matkul/${mk.id}` : `/admin/mata-kuliah/${mk.id}`}
                  className="bg-white rounded-xl p-4 shadow-sm border border-gray-50 flex items-center justify-between group hover:-translate-y-1 transition-all duration-300 cursor-pointer"
                >
                  <div className="flex items-center gap-4">
                      <div className="relative w-8 h-8 flex items-center justify-center">
                           <span className="text-orange-400 font-black text-lg z-10">{i + 1}</span>
                           <div className="absolute inset-0 bg-orange-50 rounded-lg -rotate-12 group-hover:rotate-0 transition-transform"></div>
                      </div>
                      <div className="flex flex-col">
                        <span className="font-bold text-gray-700">{mk.name}</span>
                        <span className="text-[10px] text-gray-400">{mk.materialCount} Konten</span>
                      </div>
                  </div>
                  <button className="text-[10px] font-bold text-gray-400 group-hover:text-blue-500 transition-colors uppercase tracking-wider">
                    Lihat
                  </button>
                </Link>
              ))
            ) : (
                <div className="text-sm text-gray-400 text-center py-8 bg-white rounded-xl border border-dashed border-gray-200">
                  Belum ada data mata kuliah terpopuler.
                </div>
            )}
          </div>
        </div>

        {/* Student Active / Mahasiswa Teraktif */}
        <div>
          <h2 className="text-lg font-bold text-gray-800 mb-6">Mahasiswa Teraktif</h2>
          <div className="space-y-4">
            {(stats?.mahasiswaTeraktif || []).length > 0 ? (
              stats.mahasiswaTeraktif.slice(0, 5).map((m: any, i: number) => (
                <div key={m.userId} className="bg-white rounded-xl p-4 shadow-sm border border-gray-50 flex items-center justify-between group hover:-translate-y-1 transition-all duration-300">
                  <div className="flex items-center gap-4">
                      <div className="relative w-8 h-8 flex items-center justify-center">
                           <span className="text-blue-400 font-black text-lg z-10">{i + 1}</span>
                           <div className="absolute inset-0 bg-blue-50 rounded-lg rotate-12 group-hover:rotate-0 transition-transform"></div>
                      </div>
                      <div className="flex flex-col">
                        <span className="font-bold text-gray-700">{m.userName}</span>
                        <span className="text-[10px] text-gray-400">{m.prodiName || "Mahasiswa"} • {m.activityCount} Aktivitas</span>
                      </div>
                  </div>
                  <button className="text-[10px] font-bold text-gray-400 hover:text-blue-500 transition-colors uppercase tracking-wider">
                    Profile
                  </button>
                </div>
              ))
            ) : (
              <div className="text-sm text-gray-400 text-center py-8 bg-white rounded-xl border border-dashed border-gray-200">
                Belum ada data mahasiswa teraktif.
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ======================== 4. SUPPORT BANNER ======================== */}
      <section className="relative mt-8">
        <div className="bg-[#EBF5FF] rounded-2xl p-8 flex justify-between items-center overflow-hidden shadow-sm border border-blue-50">
            <div className="flex flex-col gap-2 z-10 relative">
                <h3 className="text-2xl font-black text-gray-800">Ada kendala? Yuk, Tanya Kami!</h3>
                <p className="text-sm font-medium text-gray-500">Tim support helPhin siap membantumu</p>
                <div className="mt-4">
                    <button 
                      onClick={() => window.open("https://wa.me/your-number", "_blank")}
                      className="bg-white text-blue-500 font-bold px-8 py-3 rounded-xl shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all"
                    >
                        Hubungi Kami
                    </button>
                </div>
            </div>
            
            <div className="absolute right-0 top-0 h-full w-[45%] flex items-end justify-end">
                <div className="relative w-full h-[120%] -mb-4">
                     <Image src="/Assets/helphin_CS.png" alt="Mascot" fill className="object-contain object-right-bottom select-none pointer-events-none" />
                </div>
            </div>
            <div className="absolute top-1/2 left-2/3 -translate-y-1/2 w-64 h-64 bg-blue-100 rounded-full blur-3xl opacity-50 select-none"></div>
        </div>
      </section>

      <div className="mt-4">
        <FooterDashboard />
      </div>
    </div>
  );
}
