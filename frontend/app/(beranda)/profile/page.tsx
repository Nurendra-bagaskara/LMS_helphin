"use client";
import React, { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";

export default function ProfilePage() {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const router = useRouter();

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            const token = localStorage.getItem("accessToken");
            if (!token) {
                router.push("/login");
                return;
            }
            const res = await fetch("http://localhost:8000/api/auth/me", {
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = await res.json();
            if (data.success) {
                setName(data.data.name || "");
                setEmail(data.data.email || "");
            }
        } catch (error) {
            console.error("Gagal load profile", error);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();

        if (password && password !== confirmPassword) {
            alert("Konfirmasi Password tidak cocok!");
            return;
        }

        setSaving(true);
        try {
            const token = localStorage.getItem("accessToken");
            
            const payload: any = { name, email };
            if (password) {
                payload.password = password;
            }

            const res = await fetch("http://localhost:8000/api/users/profile", {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify(payload)
            });

            const data = await res.json();
            if (data.success) {
                alert("Profile berhasil diperbarui! 🎉");
                
                // Update local storage user just in case
                const userStr = localStorage.getItem("user");
                if (userStr) {
                    const user = JSON.parse(userStr);
                    user.name = name;
                    user.email = email;
                    localStorage.setItem("user", JSON.stringify(user));
                }

                if (password) {
                    alert("Password telah dirubah. Silakan login kembali.");
                    localStorage.removeItem("accessToken");
                    localStorage.removeItem("user");
                    router.push("/login");
                }
                
                setPassword("");
                setConfirmPassword("");
            } else {
                alert(`Gagal: ${data.message || "Email mungkin sudah digunakan"}`);
            }
        } catch (error) {
            console.error("Update profile error", error);
            alert("Terjadi kesalahan sistem.");
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return <div className="min-h-screen flex items-center justify-center text-gray-500">Memuat profil...</div>;
    }

    return (
        <div className="flex flex-col items-center justify-center py-10">
            <div className="w-full max-w-2xl bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
                <div className="mb-8 text-center flex flex-col items-center">
                    <div className="w-20 h-20 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-3xl font-bold mb-4">
                        {name ? name.substring(0, 2).toUpperCase() : "U"}
                    </div>
                    <h1 className="text-2xl font-bold text-gray-800">Profil Saya</h1>
                    <p className="text-gray-500 text-sm mt-1">Perbarui informasi dasar profil dan password Anda</p>
                </div>

                <form onSubmit={handleSave} className="space-y-6">
                    <div className="space-y-4">
                        <div className="space-y-1.5">
                            <label className="text-sm font-semibold text-gray-700">Nama Lengkap</label>
                            <input
                                type="text"
                                required
                                className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                            />
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-sm font-semibold text-gray-700">Email Utama</label>
                            <input
                                type="email"
                                required
                                className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>

                        <div className="border-t border-gray-100 my-6 pt-6"></div>
                        <h3 className="text-sm font-bold text-gray-800 mb-2">Ubah Password (Opsional)</h3>
                        <p className="text-xs text-gray-500 mb-4">Kosongkan jika Anda tidak ingin mengubah password.</p>

                        <div className="space-y-1.5">
                            <label className="text-sm font-semibold text-gray-700">Password Baru</label>
                            <input
                                type="password"
                                minLength={6}
                                className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Minimal 6 karakter"
                            />
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-sm font-semibold text-gray-700">Konfirmasi Password</label>
                            <input
                                type="password"
                                className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                placeholder="Ulangi password baru"
                            />
                        </div>
                    </div>

                    <div className="pt-6 flex gap-4">
                        <button
                            type="submit"
                            disabled={saving}
                            className="flex-1 bg-[#068DFF] text-white py-3.5 rounded-xl font-bold hover:bg-blue-600 transition-all shadow-md active:scale-95 disabled:opacity-50"
                        >
                            {saving ? "Menyimpan Perubahan..." : "Simpan Profil"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
