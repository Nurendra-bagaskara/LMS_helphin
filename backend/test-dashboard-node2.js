const http = require('http');

async function testLogin() {
    try {
        console.log("Logging in as admin...");
        let response = await fetch("http://localhost:8000/api/auth/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email: "admin.if@helphin.com", password: "admin123" })
        });
        let text = await response.text();
        console.log("Login Admin Response:", text);
        
        let data;
        try {
            data = JSON.parse(text);
        } catch (e) {
            console.error("Failed to parse JSON", e);
            return;
        }

        let token = data?.data?.token;
        if (!token) return;

        response = await fetch("http://localhost:8000/api/dashboard/stats", {
            headers: { "Authorization": `Bearer ${token}` }
        });
        console.log("Stats Admin Status:", response.status);
        console.log("Stats Admin Response:", await response.text());
    } catch (e) {
        console.error("Test script failed:", e);
    }
}

testLogin();
