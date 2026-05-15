/**
 * HelPhin LMS — In-Memory Cache
 * 
 * Cache sederhana untuk mengurangi beban database pada endpoint yang sering diakses.
 * Data di-cache dengan TTL (time-to-live) dan otomatis dihapus setelah kedaluwarsa.
 * 
 * Cache di-invalidate otomatis saat ada operasi CREATE/UPDATE/DELETE.
 */

interface CacheEntry<T> {
    data: T;
    expiry: number; // timestamp ms
}

class MemoryCache {
    private store = new Map<string, CacheEntry<any>>();
    private cleanupInterval: ReturnType<typeof setInterval>;

    constructor() {
        // Bersihkan cache expired setiap 60 detik
        this.cleanupInterval = setInterval(() => this.cleanup(), 60_000);
    }

    /**
     * Ambil data dari cache
     */
    get<T>(key: string): T | null {
        const entry = this.store.get(key);
        if (!entry) return null;
        if (Date.now() > entry.expiry) {
            this.store.delete(key);
            return null;
        }
        return entry.data as T;
    }

    /**
     * Simpan data ke cache
     * @param key - cache key
     * @param data - data to cache
     * @param ttlSeconds - time-to-live in seconds (default: 30s)
     */
    set<T>(key: string, data: T, ttlSeconds: number = 30): void {
        this.store.set(key, {
            data,
            expiry: Date.now() + ttlSeconds * 1000,
        });
    }

    /**
     * Hapus cache berdasarkan prefix (untuk invalidation)
     * Contoh: invalidate("prodi") akan menghapus semua cache yang key-nya dimulai dengan "prodi"
     */
    invalidate(prefix: string): void {
        for (const key of this.store.keys()) {
            if (key.startsWith(prefix)) {
                this.store.delete(key);
            }
        }
    }

    /**
     * Hapus semua cache
     */
    clear(): void {
        this.store.clear();
    }

    /**
     * Bersihkan entry yang sudah expired
     */
    private cleanup(): void {
        const now = Date.now();
        for (const [key, entry] of this.store.entries()) {
            if (now > entry.expiry) {
                this.store.delete(key);
            }
        }
    }

    /**
     * Info jumlah item di cache (untuk monitoring)
     */
    get size(): number {
        return this.store.size;
    }
}

// Singleton instance
export const cache = new MemoryCache();

// Cache TTL presets (dalam detik)
export const CACHE_TTL = {
    SHORT: 15,       // 15 detik — data yang sering berubah
    MEDIUM: 60,      // 1 menit — data yang jarang berubah (prodi, fakultas)
    LONG: 300,       // 5 menit — data statis (mata kuliah list)
    DASHBOARD: 30,   // 30 detik — dashboard stats
} as const;
