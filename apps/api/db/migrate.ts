// db/migrate.ts (versión VERBOSA)
import fs from "fs";
import path from "path";
import dotenv from "dotenv";
import { Pool } from "pg";

console.log("▶ Iniciando migrate.ts...");

dotenv.config();
console.log("✔ dotenv cargado. DB_NAME =", process.env.DB_NAME);

const pool = new Pool({
  host: process.env.DB_HOST || "localhost",
  port: Number(process.env.DB_PORT || 5432),
  user: process.env.DB_USER || "postgres",
  password: process.env.DB_PASSWORD || "root",
  database: process.env.DB_NAME || "TREKE",
});

process.on("unhandledRejection", (err) => {
  console.error("🛑 UnhandledRejection:", err);
  process.exit(1);
});
process.on("uncaughtException", (err) => {
  console.error("🛑 UncaughtException:", err);
  process.exit(1);
});

async function run() {
  const here = __dirname; // debería ser .../apps/api/db
  console.log("📂 __dirname:", here);

  const migrationsDir = path.resolve(here, "migrations");
  console.log("📁 migrationsDir:", migrationsDir);

  const exists = fs.existsSync(migrationsDir);
  console.log("🔎 migrationsDir existe?:", exists);

  if (!exists) {
    console.error("❌ No se encontró la carpeta db/migrations. Revisa la ruta.");
    process.exit(1);
  }

  const files = fs.readdirSync(migrationsDir).filter(f => f.endsWith(".sql")).sort();
  console.log("🗂  Migraciones encontradas:", files);

  const client = await pool.connect();
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS _migrations (
        id SERIAL PRIMARY KEY,
        filename TEXT UNIQUE NOT NULL,
        applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `);
    console.log("✔ Tabla de control _migrations OK");

    for (const file of files) {
      const applied = await client.query("SELECT 1 FROM _migrations WHERE filename=$1", [file]);
      if (applied.rowCount) {
        console.log(`↷ Ya aplicada: ${file}`);
        continue;
      }

      const fullpath = path.join(migrationsDir, file);
      console.log(`▶ Leyendo: ${fullpath}`);
      const sql = fs.readFileSync(fullpath, "utf8");

      console.log(`▶ Aplicando: ${file}`);
      await client.query("BEGIN");
      try {
        await client.query(sql);
        await client.query("INSERT INTO _migrations (filename) VALUES ($1)", [file]);
        await client.query("COMMIT");
        console.log(`✅ Completada: ${file}`);
      } catch (e) {
        await client.query("ROLLBACK");
        console.error(`❌ Error en ${file}:`, e);
        process.exit(1);
      }
    }

    console.log("🎉 Migraciones finalizadas sin errores");
  } finally {
    client.release();
    await pool.end();
  }
}

run().catch((e) => {
  console.error("🛑 Error general en migrate.ts:", e);
  process.exit(1);
});
