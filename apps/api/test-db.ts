import dotenv from "dotenv";
dotenv.config();

import pkg from "pg";
const { Client } = pkg;

async function testConnection() {

  const isRender = process.env.PGHOST?.includes("render.com") ?? false;

  const client = new Client({
    host: process.env.PGHOST,
    port: Number(process.env.PGPORT),
    database: process.env.PGDATABASE,
    user: process.env.PGUSER,
    password: process.env.PGPASSWORD,

    // Render exige SSL — local NO
    ssl: isRender
      ? { rejectUnauthorized: false }
      : false
  });

  try {
    await client.connect();
    console.log("✅ Conexión exitosa");
    const res = await client.query("SELECT NOW()");
    console.log("Hora del servidor:", res.rows[0]);
  } catch (error) {
    console.error("❌ Error conectando a la base de datos:", error);
  } finally {
    await client.end();
  }
}

testConnection();
