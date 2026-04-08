"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function StatTelkom() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const token = localStorage.getItem("accessToken");
        if (!token) {
          router.push("/login");
          return;
        }

        const res = await fetch("http://localhost:8000/api/dashboard/stats", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (res.status === 401) {
          router.push("/login");
          return;
        }

        const data = await res.json();
        if (data.success) {
          setStats(data.data);
        }
      } catch (error) {
        console.error("Failed to fetch dashboard stats", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [router]);

  if (loading) {
    return <div className="pl-5 w-full">Loading stats...</div>;
  }

  return (
    <div className="pl-5 w-full grid grid-cols-2 gap-4">
      <div className="bg-white h-auto p-4 rounded-xl border border-gray-100 shadow-xs">
        <h2 className="text-sm text-gray-500 mb-2">Total Mahasiswa</h2>
        <h1 className="font-bold text-3xl text-gray-800">
          {stats?.totalStudents || 0}
        </h1>
        <h3 className="text-xs font-light text-gray-400 mt-2">
          90% Meningkat dalam 15 hari sebelumnya
        </h3>
      </div>
      <div className="bg-white h-auto p-4 rounded-xl border border-gray-100 shadow-xs">
        <h2 className="text-sm text-gray-500 mb-2">Total Course</h2>
        <h1 className="font-bold text-3xl text-gray-800">
          {stats?.totalCourses || 0}
        </h1>
        <h3 className="text-xs font-light text-gray-400 mt-2">
          94% Meningkat dalam 15 hari sebelumnya
        </h3>
      </div>
      <div className="bg-white h-auto p-4 rounded-xl border border-gray-100 shadow-xs">
        <h2 className="text-sm text-gray-500 mb-2">Total Prodi</h2>
        <h1 className="font-bold text-3xl text-gray-800">
          {stats?.totalProdi || 0}
        </h1>
        <h3 className="text-xs font-light text-gray-400 mt-2">prodi aktif</h3>
      </div>
      <div className="bg-white h-auto p-4 rounded-xl border border-gray-100 shadow-xs">
        <h2 className="text-sm text-gray-500 mb-2">Total Materi</h2>
        <h1 className="font-bold text-3xl text-gray-800">
          {stats?.totalMaterials || 0}
        </h1>
        <h3 className="text-xs font-light text-gray-400 mt-2">
          94% Meningkat dalam 15 hari sebelumnya
        </h3>
      </div>
    </div>
  );
}
