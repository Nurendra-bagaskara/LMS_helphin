"use client";
import React, { useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import FooterDashboard from "./footer_dashboard";

interface MataKuliah {
  id: string;
  name: string;
}

export default function AdminDashboard() {
  const router = useRouter();
  const [userName, setUserName] = useState("User");
  const [prodiName, setProdiName] = useState("");
  const [mataKuliahList, setMataKuliahList] = useState<MataKuliah[]>([]);

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

    // Fetch prodi name and mata kuliah
    const token = localStorage.getItem("accessToken");
    if (!token) return;

    // Fetch user's prodi info
    const fetchProdi = async () => {
      try {
        const userStr = localStorage.getItem("user");
        if (!userStr) return;
        const user = JSON.parse(userStr);
        if (user.prodiId) {
          const res = await fetch(
            `http://localhost:8000/api/prodi/${user.prodiId}`,
            {
              headers: { Authorization: `Bearer ${token}` },
            },
          );
          const data = await res.json();
          if (data.success) {
            setProdiName(data.data.name || "");
          }
        }
      } catch (e) {
        console.error("Failed to fetch prodi", e);
      }
    };

    // Fetch mata kuliah list
    const fetchMataKuliah = async () => {
      try {
        const res = await fetch("http://localhost:8000/api/mata-kuliah", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (data.success && Array.isArray(data.data)) {
          setMataKuliahList(data.data.slice(0, 4));
        }
      } catch (e) {
        console.error("Failed to fetch mata kuliah", e);
      }
    };

    fetchProdi();
    fetchMataKuliah();
  }, []);

  // Display first name only for greeting
  const firstName = userName.split(" ")[0];

  return (
    <div className="flex flex-col gap-3 mt-2">
      {/* Welcome Banner */}
      <header className="overflow-hidden flex justify-between mt-5 pl-5 bg-gradient-to-r from-[#0055FF] to-[#07A3F9] to-75% rounded-lg text-white shadow-lg">
        <div className="flex flex-col justify-end pb-5">
          <h1 className="font-bold text-3xl mb-1">Hallo, {firstName} 👋</h1>
          {prodiName && (
            <p className="text-lg font-medium opacity-95">Prodi {prodiName}</p>
          )}
          <p className="text-sm opacity-75 mt-1">by helPhin</p>
        </div>
        <div className="relative">
          <Image
            src="/Assets/gedung_kampus_image.png"
            alt="Gedung Kampus"
            width={350}
            height={350}
            priority
          />
          <div className="absolute left-4 inset-0 bg-gradient-to-t from-[#07A3F9] via-transparent via-25% to-transparent" />
        </div>
      </header>

      {/* Rekomendasi Mata Kuliah */}
      <div>
        <h2 className="text-lg font-semibold text-gray-800 mb-4">
          Rekomendasi Mata Kuliah
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {(mataKuliahList.length > 0
            ? mataKuliahList
            : [null, null, null, null]
          ).map((mk, i) => (
            <div
              key={mk?.id ?? i}
              className="relative rounded-sm min-h-[90px]"
              style={{
                background: "linear-gradient(135deg, #9DEEAF 0%, #D6EFA2 100%)",
              }}
            >
              {/* bg_matkul.png — doodle overlay */}
              <Image
                src="/Assets/bg_matkul.png"
                alt=""
                fill
                className="object-cover object-right pointer-events-none select-none rounded-[18px]"
                aria-hidden
              />

              {/* bg_code_icon.svg blob + code_icon.svg — overlap di atas kotak putih */}
              <div
                className="absolute z-10"
                style={{ bottom: "30px", left: "15px" }}
              >
                <div className="relative w-[52px] h-[52px]">
                  {/* blob background */}
                  <Image
                    src="/Assets/icons/bg_code_icon.svg"
                    alt=""
                    width={40}
                    height={40}
                  />
                  {/* code icon di tengah blob */}
                  <div className="absolute inset-0 flex items-start justify-start">
                    <Image
                      src="/Assets/icons/code_icon.svg"
                      alt="icon"
                      width={35}
                      height={35}
                    />
                  </div>
                </div>
              </div>

              {/* Kotak putih nama mata kuliah */}
              <div className="absolute bottom-2 left-2 right-2 bg-white rounded-sm px-4 py-3 min-h-[50px] flex items-end shadow-sm">
                <span
                  className={`font-extrabold text-[14px] leading-tight ${
                    mk ? "text-gray-900" : "text-gray-400"
                  }`}
                >
                  {mk?.name ?? "Belum ada data"}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* CTA Banner */}
      <div className="bg-[#D9EEFF] pl-5 mt-10 rounded-sm flex justify-between items-center shadow-xs relative overflow-visible min-h-[100px]">
        <div className="flex flex-col justify-center">
          <h1 className="font-extrabold text-lg">
            Mau bikin matkul yang lainnya?
          </h1>
          <h1 className="text-sm font-medium">Langsung buat sekarang ya...</h1>
        </div>
        <Image
          src="/Assets/vector_footer_cs_dashboard.png"
          alt="vector background"
          width={300}
          height={300}
          className="absolute right-0 top-1/2 -translate-y-1/2 z-0 pointer-events-none"
          priority
        />
        <div className="relative flex items-center pr-[50px]">
          <button
            type="button"
            className="relative z-10 bg-white hover:bg-gray-100 transition duration-300 text-[#068DFF] rounded-sm text-sm font-semibold shadow-xs cursor-pointer px-4 py-2"
          >
            Buat Matkul Lainnya
          </button>
        </div>
      </div>

      {/* Footer */}
      <FooterDashboard />
    </div>
  );
}
