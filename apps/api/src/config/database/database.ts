// apps/api/src/config/database/database.ts
import dotenv from "dotenv";
dotenv.config();
import pg from "pg";
const { Pool } = pg;

const isProduction = process.env.NODE_ENV === 'production';

export const pool = new Pool({
  host: process.env.PGHOST,
  port: Number(process.env.PGPORT),
  user: process.env.PGUSER,
  password: process.env.PGPASSWORD,
  database: process.env.PGDATABASE,
  // 👇 AQUÍ ESTÁ EL CAMBIO IMPORTANTE 👇
  ssl: {
    rejectUnauthorized: false, 
  },
});

export async function testConnection() {
  try {
    const res = await pool.query("SELECT NOW() as now");
    console.log("✅ Conectado a PostgreSQL:", res.rows[0].now);
  } catch (error) {
    console.error("❌ Error conectando a la BD:", error);
  }
}

// 🔧 FALTABA: helper de transacciones
export async function withTx<T>(fn: (c: pg.PoolClient) => Promise<T>): Promise<T> {
  // Nota: connect() también intentará usar la config SSL del pool
  const client = await pool.connect(); 
  try {
    await client.query("BEGIN");
    const out = await fn(client);
    await client.query("COMMIT");
    return out;
  } catch (e) {
    await client.query("ROLLBACK");
    throw e;
  } finally {
    client.release();
  }
}