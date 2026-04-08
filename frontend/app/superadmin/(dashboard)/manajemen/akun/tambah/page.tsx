'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';

export default function BuatAkunPage() {
    const router = useRouter();

    const [daftarAnggota, setDaftarAnggota] = useState([{ id: 1, nama: '', jabatan: '', email: '', password: '', roleId: '' }]);
    const [errorNama, setErrorNama] = useState<{ [key: number]: string }>({});
    const [errorEmail, setErrorEmail] = useState<{ [key: number]: string }>({});

    const [listProdi, setListProdi] = useState<any[]>([]);
    const [listRole, setListRole] = useState<any[]>([]);
    const [prodiId, setProdiId] = useState("");
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchProdi = async () => {
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
        const fetchRoles = async () => {
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
        fetchProdi();
        fetchRoles();
    }, []);

    const tambahKolomAnggota = () => {
        setDaftarAnggota([...daftarAnggota, { id: Date.now(), nama: '', jabatan: '', email: '', password: '', roleId: '' }]);
    };

    const hapusKolomAnggota = (id: number) => {
        setDaftarAnggota(daftarAnggota.filter(anggota => anggota.id !== id));
    };

    const simpanSemuaAkun = async () => {
        if (!prodiId) {
            alert("Harap pilih Organisasi Prodi terlebih dahulu!");
            return;
        }

        setLoading(true);
        try {
            const token = localStorage.getItem("accessToken");
            if (!token) {
                alert("Sesi login berakhir. Silakan login kembali.");
                router.push("/login");
                return;
            }

            let successCount = 0;
            let errorMessages = [];

            for (const anggota of daftarAnggota) {
                const fullEmail = `${anggota.email}.helphian@gmail.com`;

                const res = await fetch("http://localhost:8000/api/users", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`
                    },
                    body: JSON.stringify({
                        name: anggota.nama,
                        email: fullEmail,
                        password: anggota.password,
                        prodiId: prodiId,
                        roleId: anggota.roleId,
                        jabatan: anggota.jabatan
                    })
                });

                const data = await res.json();
                if (data.success) {
                    successCount++;
                } else {
                    errorMessages.push(`Gagal menambahkan ${anggota.nama}: ${data.message}`);
                }
            }

            if (errorMessages.length > 0) {
                alert("Beberapa akun gagal ditambahkan:\n" + errorMessages.join("\n"));
                if (successCount > 0) router.push('/manajemen/akun');
            } else {
                alert("Semua akun Himpunan berhasil dibuat! 🐬");
                router.push('/manajemen/akun');
            }

        } catch (e) {
            console.error("Error creating accounts", e);
            alert("Terjadi kesalahan sistem.");
        } finally {
            setLoading(false);
        }
    };

    const adaError = Object.values(errorNama).some(p => p !== "") || Object.values(errorEmail).some(p => p !== "");
    const adaKosong = daftarAnggota.some(a =>
        a.nama.trim() === "" || a.jabatan.trim() === "" || a.email.trim() === "" || a.password.trim() === "" || a.roleId === ""
    ) || prodiId === "";
    const tombolMati = adaError || adaKosong || loading;

    return (
        <div className="min-h-screen bg-[#F0F7FF] flex flex-col items-center p-8 relative overflow-hidden">
            <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-blue-200 rounded-full blur-[120px] opacity-50 z-0"></div>
            <div className="absolute bottom-[-10%] right-[-10%] w-[400px] h-[400px] bg-blue-100 rounded-full blur-[100px] opacity-40 z-0"></div>

            <div className="z-10 mb-2">
                <Image src="/Assets/Logo-helphin-biru.png" alt="Logo Helphin" width={140} height={40} priority />
            </div>

            <h1 className="text-3xl font-bold text-gray-800 z-10">Buat Akun Anggota</h1>
            <p className="text-blue-500 text-sm mb-10 z-10 cursor-pointer hover:underline">Buatkan Akun Prodi</p>

            <div className="w-full max-w-4xl bg-white rounded-3xl shadow-2xl p-10 z-10 space-y-10 border border-white/50 backdrop-blur-sm">
                {/* Section Data Organisasi */}
                <div>
                    <h2 className="text-lg font-bold mb-4 text-gray-700">Data Organisasi</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="flex flex-col space-y-2">
                            <label className="text-sm font-bold text-gray-600">Organisasi Himpunan (Prodi)</label>
                            <select
                                value={prodiId}
                                onChange={(e) => setProdiId(e.target.value)}
                                className="border border-gray-200 p-3 rounded-xl text-gray-700 focus:outline-blue-500 bg-gray-50/50"
                            >
                                <option value="">Pilih Prodi</option>
                                {listProdi.map((p) => (
                                    <option key={p.id} value={p.id}>{p.name}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>

                {/* Section Data Akun */}
                <div className="relative">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-lg font-bold text-gray-700">Data Akun</h2>
                        <button onClick={tambahKolomAnggota} className="bg-blue-500 text-white px-5 py-2.5 rounded-xl text-sm font-semibold shadow-lg hover:bg-blue-600 transition">
                            + Tambah Anggota
                        </button>
                    </div>

                    <div className="space-y-12">
                        {daftarAnggota.map((anggota, index) => (
                            <div key={anggota.id} className="relative grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8 pt-8 border-t border-gray-100 first:border-none first:pt-0">

                                {/* Header Anggota & Hapus */}
                                <div className="flex justify-between items-center absolute -top-4 w-full px-2">
                                    {index > 0 && (
                                        <>
                                            <span className="bg-blue-50 text-blue-500 text-[10px] px-2 py-0.5 rounded-full font-bold">Anggota Ke-{index + 1}</span>
                                            <button onClick={() => hapusKolomAnggota(anggota.id)} className="text-red-500 hover:text-red-700 text-xs font-bold transition">✕ Hapus</button>
                                        </>
                                    )}
                                </div>

                                {/* Input Nama */}
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-gray-600">Nama Lengkap</label>
                                    <input
                                        type="text"
                                        placeholder="Masukkan nama"
                                        className={`border p-3 rounded-xl w-full text-black focus:ring-2 focus:ring-blue-100 outline-none transition ${errorNama[index] ? 'border-red-500 bg-red-50' : 'border-gray-200 bg-gray-50/50'}`}
                                        value={anggota.nama}
                                        onChange={(e) => {
                                            const inputBaru = e.target.value;
                                            const update = [...daftarAnggota];
                                            update[index].nama = inputBaru;
                                            setDaftarAnggota(update);
                                            setErrorNama(prev => ({ ...prev, [index]: "" }));
                                        }}
                                    />
                                    {errorNama[index] && <p className="text-[10px] text-red-500 font-bold mt-1 italic">{errorNama[index]}</p>}
                                </div>

                                {/* Input Jabatan */}
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-gray-600">Jabatan</label>
                                    <input
                                        type="text"
                                        placeholder="Jabatan di Organisasi"
                                        className="border border-gray-200 p-3 rounded-xl w-full bg-gray-50/50 text-black outline-none transition"
                                        value={anggota.jabatan}
                                        onChange={(e) => {
                                            const update = [...daftarAnggota];
                                            update[index].jabatan = e.target.value;
                                            setDaftarAnggota(update);
                                        }}
                                    />
                                </div>

                                {/* Input Role */}
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-gray-600">Role</label>
                                    <select
                                        className="border border-gray-200 p-3 rounded-xl w-full bg-gray-50/50 text-black outline-none transition"
                                        value={anggota.roleId}
                                        onChange={(e) => {
                                            const update = [...daftarAnggota];
                                            update[index].roleId = e.target.value;
                                            setDaftarAnggota(update);
                                        }}
                                    >
                                        <option value="">Pilih Role</option>
                                        {listRole.map((r) => (
                                            <option key={r.id} value={r.id}>{r.name}</option>
                                        ))}
                                    </select>
                                </div>

                                {/* Input Email */}
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-gray-600">Email</label>
                                    <div className="flex border border-gray-200 rounded-xl overflow-hidden bg-gray-50/50">
                                        <input
                                            type="text"
                                            className="p-3 w-full text-black outline-none bg-transparent"
                                            placeholder="Username"
                                            value={anggota.email}
                                            onChange={(e) => {
                                                let val = e.target.value.replace(/\s/g, "");
                                                const up = [...daftarAnggota];
                                                up[index].email = val;
                                                setDaftarAnggota(up);
                                                setErrorEmail(prev => ({ ...prev, [index]: val.includes("@") ? "Cukup username saja! 🐬" : "" }));
                                            }}
                                        />
                                        <span className="p-3 text-gray-400 text-xs border-l bg-gray-100/50 flex items-center">.helphian@gmail.com</span>
                                    </div>
                                    {errorEmail[index] && <p className="text-[10px] text-red-500 font-bold mt-1 italic">{errorEmail[index]}</p>}
                                </div>

                                {/* Input Password */}
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-gray-600">Password</label>
                                    <input
                                        type="password"
                                        placeholder="Masukkan password (> 6 char)"
                                        className="border border-gray-200 p-3 rounded-xl w-full bg-gray-50/50 text-black outline-none transition"
                                        value={anggota.password}
                                        onChange={(e) => {
                                            const update = [...daftarAnggota];
                                            update[index].password = e.target.value;
                                            setDaftarAnggota(update);
                                        }}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="flex justify-end items-center space-x-6 pt-6">
                    <Link href="/superadmin/manajemen/akun" className="text-gray-400 font-bold hover:text-gray-600 transition">Batal</Link>
                    <button
                        onClick={simpanSemuaAkun}
                        disabled={tombolMati}
                        className={`px-14 py-4 rounded-2xl font-bold shadow-xl transition-all ${tombolMati
                            ? 'bg-gray-300 cursor-not-allowed opacity-50 shadow-none text-gray-500'
                            : 'bg-blue-500 text-white shadow-blue-200 hover:bg-blue-600 hover:-translate-y-1'
                            }`}
                    >
                        {loading ? 'Menyimpan...' : 'Buat Akun'}
                    </button>
                </div>
            </div>
        </div>
    );
}

