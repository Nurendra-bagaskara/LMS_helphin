const { Client } = require('pg');

async function checkDb() {
    const client = new Client({
        connectionString: "postgresql://postgres:postgres@localhost:5432/lms_helphin"
    });
    try {
        await client.connect();
        const res = await client.query('SELECT id, title, live_chat_link FROM responsi');
        console.log(JSON.stringify(res.rows, null, 2));
    } catch (err) {
        console.error(err);
    } finally {
        await client.end();
    }
}

checkDb();
