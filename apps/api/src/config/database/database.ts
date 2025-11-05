// src/config/database.ts
import dotenv from "dotenv";
dotenv.config();

import pg from "pg";
const { Pool } = pg;

export const pool = new Pool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

// Función para probar la conexión
export async function testConnection() {
  const res = await pool.query("SELECT NOW() as now");
  console.log("✅ Conectado a PostgreSQL:", res.rows[0].now);
}
