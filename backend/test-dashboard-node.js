const fs = require('fs');

async function testDashboard() {
    try {
        let response = await fetch("http://localhost:8000/api/auth/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email: "admin.if@helphin.com", password: "admin123" })
        });
        let data = await response.json();
        let token = data?.data?.token;
        console.log("Admin token:", token ? "Got token" : "No token");

        response = await fetch("http://localhost:8000/api/dashboard/stats", {
            headers: { "Authorization": `Bearer ${token}` }
        });
        console.log("Admin stats status:", response.status);
        console.log("Admin stats response:", await response.text());
        
        response = await fetch("http://localhost:8000/api/auth/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email: "superadmin@helphin.com", password: "superadmin123" })
        });
        data = await response.json();
        token = data?.data?.token;
        console.log("Superadmin token:", token ? "Got token" : "No token");

        response = await fetch("http://localhost:8000/api/dashboard/stats", {
            headers: { "Authorization": `Bearer ${token}` }
        });
        console.log("Superadmin stats status:", response.status);
        console.log("Superadmin stats response:", await response.text());
        
        response = await fetch("http://localhost:8000/api/auth/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email: "student.if@helphin.com", password: "student123" })
        });
        data = await response.json();
        token = data?.data?.token;
        console.log("Student token:", token ? "Got token" : "No token");

        response = await fetch("http://localhost:8000/api/dashboard/stats", {
            headers: { "Authorization": `Bearer ${token}` }
        });
        console.log("Student stats status:", response.status);
        console.log("Student stats response:", await response.text());

    } catch (e) {
        console.error("Test script failed:", e);
    }
}

testDashboard();
