'use client';
import React, { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";

export default function EditAkunPage() {
    const [nama, setNama] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [jabatan, setJabatan] = useState("");
    const [prodiId, setProdiId] = useState("");
    const [roleId, setRoleId] = useState("");
    const [listProdi, setListProdi] = useState<any[]>([]);
    const [listRole, setListRole] = useState<any[]>([]);

    const [loading, setLoading] = useState(false);
    const [initialLoading, setInitialLoading] = useState(true);
    const router = useRouter();
    const params = useParams();
    const { id } = params;

    useEffect(() => {
        fetchProdiList();
        fetchRoleList();
        fetchAdmin();
    }, [id]);

    const fetchRoleList = async () => {
        try {
            const token = localStorage.getItem("accessToken");
            if (!token) return;
            const res = await fetch("http://localhost:8000/api/roles", {
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = await res.json();
            if (data.success) {
                setListRole(data.data);
            }
        } catch (e) {
            console.error("Gagal load roles", e);
        }
    };

    const fetchProdiList = async () => {
        try {
            const token = localStorage.getItem("accessToken");
            if (!token) return;
            const res = await fetch("http://localhost:8000/api/prodi", {
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = await res.json();
            if (data.success) {
                setListProdi(data.data);
            }
        } catch (e) {
            console.error("Gagal load prodi", e);
        }
    };

    const fetchAdmin = async () => {
        try {
            const token = localStorage.getItem("accessToken");
            if (!token) {
                router.push("/login");
                return;
            }
            const res = await fetch(`http://localhost:8000/api/users/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = await res.json();
            if (data.success) {
                const adminData = data.data;
                if (adminData) {
                    setNama(adminData.name);
                    let displayEmail = adminData.email;
                    if (displayEmail.includes(".helphian@gmail.com")) {
                        displayEmail = displayEmail.replace(".helphian@gmail.com", "");
                    }
                    setEmail(displayEmail);
                    setJabatan(adminData.jabatan || "");
                    setProdiId(adminData.prodiId || "");
                    setRoleId(adminData.roleId || "");
                } else {
                    alert("Admin tidak ditemukan!");
                    router.push("/manajemen/akun");
                }
            }
        } catch (e) {
            console.error("Gagal memuat admin", e);
            alert("Terjadi kesalahan.");
            router.push("/manajemen/akun");
        } finally {
            setInitialLoading(false);
        }
    };

    const handleSimpan = async () => {
        if (!nama || !email || !prodiId) {
            alert("Harap isi semua field wajib (Nama, Email, Prodi)!");
            return;
        }

        setLoading(true);
        try {
            const token = localStorage.getItem("accessToken");

            const fullEmail = email.includes("@") ? email : `${email.replace(/\s/g, "")}.helphian@gmail.com`;

            const payload: any = {
                name: nama,
                email: fullEmail,
                prodiId: prodiId || null,
                roleId: roleId || null,
                jabatan: jabatan || null
            };

            if (password.trim()) {
                payload.password = password;
            }

            const res = await fetch(`http://localhost:8000/api/users/${id}`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify(payload)
            });

            const data = await res.json();
            if (data.success) {
                alert("Data Admin Berhasil Diperbarui!");
                router.push("/manajemen/akun");
            } else {
                alert(`Gagal: ${data.message || "Terjadi kesalahan"}`);
            }
        } catch (e) {
            console.error("Gagal menyimpan", e);
            alert("Terjadi kesalahan pada sistem.");
        } finally {
            setLoading(false);
        }
    };

    if (initialLoading) {
        return <div className="min-h-screen flex items-center justify-center bg-[#F8F9FA] text-gray-500">Memuat data admin...</div>;
    }

    return (
        <div className="min-h-screen bg-[#F0F7FF] flex flex-col items-center p-8 relative overflow-hidden">
            <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-blue-200 rounded-full blur-[120px] opacity-50 z-0"></div>
            <div className="absolute bottom-[-10%] right-[-10%] w-[400px] h-[400px] bg-blue-100 rounded-full blur-[100px] opacity-40 z-0"></div>

            <div className="z-10 mb-2">
                <Image src="/Assets/Logo-helphin-biru.png" alt="Logo Helphin" width={140} height={40} priority />
            </div>

            <h1 className="text-3xl font-bold text-gray-800 z-10">Edit Akun Anggota</h1>
            <p className="text-blue-500 text-sm mb-10 z-10">Edit Informasi Akun Prodi</p>

            <div className="w-full max-w-4xl bg-white rounded-3xl shadow-2xl p-10 z-10 space-y-10 border border-white/50 backdrop-blur-sm">

                {/* Section Data Organisasi */}
                <div>
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-lg font-bold text-gray-700 flex items-center gap-3">
                            <Link href="/manajemen/akun" className="text-gray-400 hover:text-blue-500 text-sm">← Kembali</Link>
                            Data Organisasi
                        </h2>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="flex flex-col space-y-2">
                            <label className="text-sm font-bold text-gray-600">Organisasi Himpunan (Prodi)</label>
                            <select
                                value={prodiId}
                                onChange={(e) => setProdiId(e.target.value)}
                                className="border border-gray-200 p-3 rounded-xl text-gray-700 focus:outline-blue-500 bg-gray-50/50"
                            >
                                <option value="" disabled>Pilih Prodi</option>
                                {listProdi.map((p) => (
                                    <option key={p.id} value={p.id}>{p.name}</option>
                                ))}
                            </select>
                        </div>
                        <div className="flex flex-col space-y-2">
                            <label className="text-sm font-bold text-gray-600">Role Pengguna</label>
                            <select
                                value={roleId}
                                onChange={(e) => setRoleId(e.target.value)}
                                className="border border-gray-200 p-3 rounded-xl text-gray-700 focus:outline-blue-500 bg-gray-50/50"
                            >
                                <option value="" disabled>Pilih Role</option>
                                {listRole.map((r) => (
                                    <option key={r.id} value={r.id}>{r.name}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>

                {/* Section Data Akun */}
                <div className="relative">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-lg font-bold text-gray-700">Data Akun</h2>
                    </div>

                    <div className="space-y-12">
                        <div className="relative grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8 pt-0 border-none">

                            {/* Input Nama */}
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-gray-600">Nama Lengkap</label>
                                <input
                                    type="text"
                                    placeholder="Masukkan nama"
                                    className="border border-gray-200 p-3 rounded-xl w-full text-black focus:ring-2 focus:ring-blue-100 outline-none transition bg-gray-50/50"
                                    value={nama}
                                    onChange={(e) => setNama(e.target.value)}
                                />
                            </div>

                            {/* Input Jabatan */}
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-gray-600">Jabatan</label>
                                <input
                                    type="text"
                                    placeholder="Jabatan di Organisasi"
                                    className="border border-gray-200 p-3 rounded-xl w-full text-black focus:ring-2 focus:ring-blue-100 outline-none transition bg-gray-50/50"
                                    value={jabatan}
                                    onChange={(e) => setJabatan(e.target.value)}
                                />
                            </div>

                            {/* Input Email */}
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-gray-600">Username Email</label>
                                <div className="flex border border-gray-200 rounded-xl overflow-hidden bg-gray-50/50">
                                    <input
                                        type="text"
                                        className="p-3 w-full text-black outline-none bg-transparent"
                                        placeholder="Username"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value.replace(/\s/g, ""))}
                                    />
                                    <span className="p-3 text-gray-400 text-xs border-l bg-gray-100/50 flex items-center">.helphian@gmail.com</span>
                                </div>
                            </div>

                            {/* Input Password */}
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-gray-600">Password Baru</label>
                                <input
                                    type="password"
                                    placeholder="Kosongkan jika tidak diubah"
                                    className="border border-gray-200 p-3 rounded-xl w-full bg-gray-50/50 text-black outline-none transition"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="flex justify-end items-center space-x-6 pt-6">
                    <button
                        onClick={handleSimpan}
                        disabled={loading}
                        className={`px-14 py-4 rounded-2xl font-bold shadow-xl transition-all ${loading
                            ? 'bg-gray-300 cursor-not-allowed opacity-50 shadow-none text-gray-500'
                            : 'bg-blue-500 text-white shadow-blue-200 hover:bg-blue-600 hover:-translate-y-1'
                            }`}
                    >
                        {loading ? 'Menyimpan...' : 'Simpan Perubahan'}
                    </button>
                </div>
            </div>
        </div>
    );
}
