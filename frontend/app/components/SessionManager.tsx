"use client";

import { useEffect, useCallback } from "react";
import { useRouter, usePathname } from "next/navigation";

export default function SessionManager({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    const pathname = usePathname();
    const INACTIVITY_LIMIT = 15 * 60 * 1000; // 15 minutes in ms
    const REFRESH_INTERVAL = 10 * 60 * 1000; // 10 minutes in ms

    const handleLogout = useCallback(() => {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        localStorage.removeItem("user");
        localStorage.removeItem("lastActivity");
        router.push("/login");
    }, [router]);

    const refreshTokens = useCallback(async () => {
        try {
            const refreshToken = localStorage.getItem("refreshToken");
            if (!refreshToken) return;

            const res = await fetch("http://localhost:8000/api/auth/refresh", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ refreshToken })
            });
            const data = await res.json();
            if (data.success) {
                localStorage.setItem("accessToken", data.data.accessToken);
                localStorage.setItem("refreshToken", data.data.refreshToken);
            } else {
                handleLogout(); // Force logout if refresh fails
            }
        } catch (e) {
            console.error("Failed to refresh token", e);
        }
    }, [handleLogout]);

    useEffect(() => {
        // Prevent running on public pages
        if (pathname === "/login" || pathname === "/register") {
            // Also clean up stale lastActivity on login page to be safe
            const lastActive = localStorage.getItem("lastActivity");
            if (lastActive && Date.now() - parseInt(lastActive, 10) > INACTIVITY_LIMIT) {
                localStorage.removeItem("lastActivity");
            }
            return;
        }

        // 1. Initial Check on Mount
        const lastActivityStr = localStorage.getItem("lastActivity");
        if (lastActivityStr) {
            const lastActivity = parseInt(lastActivityStr, 10);
            if (Date.now() - lastActivity > INACTIVITY_LIMIT) {
                // Inactive for more than 15 mins while tab was closed/inactive
                handleLogout();
                return;
            }
        } else {
            // If no lastActivity is found but user is in a protected route, initialize it
            localStorage.setItem("lastActivity", Date.now().toString());
        }

        // 2. Setup Activity Listeners
        let timeoutId: NodeJS.Timeout;
        const updateActivity = () => {
            localStorage.setItem("lastActivity", Date.now().toString());
            // Reset the inactivity strict logout timer
            clearTimeout(timeoutId);
            timeoutId = setTimeout(handleLogout, INACTIVITY_LIMIT);
        };

        // Throttle localStorage updates to once per 5 seconds
        let lastUpdate = 0;
        const handleActivity = () => {
            const now = Date.now();
            if (now - lastUpdate > 5000) {
                updateActivity();
                lastUpdate = now;
            }
        };

        // Initial setup for the timeout
        updateActivity();

        // Listen for user interactions
        const events = ['mousedown', 'keydown', 'scroll', 'touchstart'];
        events.forEach(evt => window.addEventListener(evt, handleActivity));

        // 3. Setup Token Refresh Interval
        const refreshIntervalId = setInterval(() => {
            const lastActive = parseInt(localStorage.getItem("lastActivity") || "0", 10);
            // Only refresh if user is still active (under 15 min limit)
            if (Date.now() - lastActive <= INACTIVITY_LIMIT) {
                refreshTokens();
            }
        }, REFRESH_INTERVAL);

        return () => {
            events.forEach(evt => window.removeEventListener(evt, handleActivity));
            clearTimeout(timeoutId);
            clearInterval(refreshIntervalId);
        };
    }, [pathname, handleLogout, refreshTokens, INACTIVITY_LIMIT, REFRESH_INTERVAL]);

    return <>{children}</>;
}
