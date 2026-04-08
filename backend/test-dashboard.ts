import { $ } from "bun";

async function run() {
    // 1. login superadmin
    console.log("Logging in as superadmin...");
    let response = await fetch("http://localhost:8000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: "superadmin@helphin.com", password: "superadmin123" })
    });
    let textData = await response.text();
    console.log("Login superadmin raw:", response.status, textData);
    let data;
    try { data = JSON.parse(textData); } catch (e) { }
    console.log("Login superadmin:", data);

    let token = data.data?.token;

    // 2. get stats superadmin
    console.log("Fetching dashboard stats as superadmin...");
    response = await fetch("http://localhost:8000/api/dashboard/stats", {
        headers: { "Authorization": `Bearer ${token}` }
    });
    console.log("Stats superadmin status:", response.status);
    let text = await response.text();
    console.log("Stats superadmin body:", text);

    // 3. login admin
    console.log("Logging in as admin...");
    response = await fetch("http://localhost:8000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: "admin.if@helphin.com", password: "admin123" })
    });
    data = await response.json();
    console.log("Login admin:", data);

    token = data.data?.token;

    // 4. get stats admin
    console.log("Fetching dashboard stats as admin...");
    response = await fetch("http://localhost:8000/api/dashboard/stats", {
        headers: { "Authorization": `Bearer ${token}` }
    });
    console.log("Stats admin status:", response.status);
    text = await response.text();
    console.log("Stats admin body:", text);
    
    // 5. login student
    console.log("Logging in as student...");
    response = await fetch("http://localhost:8000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: "student.if@helphin.com", password: "student123" })
    });
    data = await response.json();
    console.log("Login student:", data);

    token = data.data?.token;

    // 6. get stats student
    console.log("Fetching dashboard stats as student...");
    response = await fetch("http://localhost:3000/api/dashboard/stats", {
        headers: { "Authorization": `Bearer ${token}` }
    });
    console.log("Stats student status:", response.status);
    text = await response.text();
    console.log("Stats student body:", text);
}

run();
