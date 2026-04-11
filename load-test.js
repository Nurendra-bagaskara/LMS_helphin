import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate, Trend } from 'k6/metrics';

// ═══════════════════════════════════════════════
//  HelPhin LMS — Load Test Script
//  Simulasi 1000 user mengakses sistem secara bersamaan
// ═══════════════════════════════════════════════

const BASE_URL = 'https://lmshelphin-production.up.railway.app';
const FRONTEND_URL = 'https://lms.helphin.id';

// Custom metrics
const errorRate = new Rate('errors');
const loginDuration = new Trend('login_duration');

// ── Test Scenarios ──
// Ramp up bertahap ke 1000 users dalam 5 menit
export const options = {
    stages: [
        { duration: '30s', target: 50 },    // Pemanasan: 0 → 50 users
        { duration: '1m',  target: 200 },   // Naik: 50 → 200 users
        { duration: '1m',  target: 500 },   // Naik lagi: 200 → 500 users
        { duration: '1m',  target: 1000 },  // Puncak: 500 → 1000 users
        { duration: '2m',  target: 1000 },  // Tahan di 1000 users selama 2 menit
        { duration: '30s', target: 0 },     // Cool down: 1000 → 0
    ],
    thresholds: {
        http_req_duration: ['p(95)<3000'],   // 95% request harus < 3 detik
        errors: ['rate<0.1'],                // Error rate harus < 10%
    },
};

export default function () {
    // ── 1. Test Homepage / Frontend ──
    const frontendRes = http.get(FRONTEND_URL, {
        tags: { name: 'Frontend_Homepage' },
    });
    check(frontendRes, {
        'Frontend: status 200': (r) => r.status === 200,
        'Frontend: response < 3s': (r) => r.timings.duration < 3000,
    }) || errorRate.add(1);

    sleep(1);

    // ── 2. Test Login API ──
    const loginStart = Date.now();
    const loginRes = http.post(
        `${BASE_URL}/api/auth/login`,
        JSON.stringify({
            email: 'student.if@helphin.com',
            password: 'student123',
        }),
        {
            headers: { 'Content-Type': 'application/json' },
            tags: { name: 'API_Login' },
        }
    );
    loginDuration.add(Date.now() - loginStart);

    const loginSuccess = check(loginRes, {
        'Login: status 200': (r) => r.status === 200,
        'Login: has token': (r) => {
            try {
                return JSON.parse(r.body).data?.accessToken !== undefined;
            } catch {
                return false;
            }
        },
    });
    if (!loginSuccess) errorRate.add(1);

    // Extract token untuk request berikutnya
    let token = '';
    try {
        const body = JSON.parse(loginRes.body);
        token = body.data?.accessToken || '';
    } catch {}

    sleep(1);

    // ── 3. Test Get Mata Kuliah (Authenticated) ──
    if (token) {
        const matkulRes = http.get(`${BASE_URL}/api/mata-kuliah`, {
            headers: { Authorization: `Bearer ${token}` },
            tags: { name: 'API_MataKuliah' },
        });
        check(matkulRes, {
            'Matkul: status 200': (r) => r.status === 200,
            'Matkul: has data': (r) => {
                try {
                    return JSON.parse(r.body).success === true;
                } catch {
                    return false;
                }
            },
        }) || errorRate.add(1);

        sleep(1);

        // ── 4. Test Get Materials ──
        const materiRes = http.get(`${BASE_URL}/api/materials`, {
            headers: { Authorization: `Bearer ${token}` },
            tags: { name: 'API_Materials' },
        });
        check(materiRes, {
            'Materials: status 200': (r) => r.status === 200,
        }) || errorRate.add(1);

        sleep(1);

        // ── 5. Test Get Videos ──
        const videoRes = http.get(`${BASE_URL}/api/videos`, {
            headers: { Authorization: `Bearer ${token}` },
            tags: { name: 'API_Videos' },
        });
        check(videoRes, {
            'Videos: status 200': (r) => r.status === 200,
        }) || errorRate.add(1);
    }

    sleep(Math.random() * 3 + 1); // Random delay 1-4 detik (simulasi perilaku nyata)
}

// ── Summary Report ──
export function handleSummary(data) {
    const summary = {
        '📊 Total Requests': data.metrics.http_reqs.values.count,
        '⚡ Avg Response Time': `${Math.round(data.metrics.http_req_duration.values.avg)}ms`,
        '🏃 P95 Response Time': `${Math.round(data.metrics.http_req_duration.values['p(95)'])}ms`,
        '🎯 P99 Response Time': `${Math.round(data.metrics.http_req_duration.values['p(99)'])}ms`,
        '❌ Error Rate': `${(data.metrics.errors?.values?.rate * 100 || 0).toFixed(2)}%`,
        '👥 Peak VUs': data.metrics.vus_max.values.max,
    };
    
    console.log('\n═══════════════════════════════════════');
    console.log('  🐬 HelPhin LMS — Load Test Report');
    console.log('═══════════════════════════════════════');
    for (const [key, value] of Object.entries(summary)) {
        console.log(`  ${key}: ${value}`);
    }
    console.log('═══════════════════════════════════════\n');
    
    return {
        stdout: textSummary(data, { indent: ' ', enableColors: true }),
    };
}

import { textSummary } from 'https://jslib.k6.io/k6-summary/0.0.1/index.js';
