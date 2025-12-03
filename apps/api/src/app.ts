// apps/api/src/app.ts
import express from "express";
import cors from "cors";
import path from "path";
import usuariosRoutes from "./modules/usuarios/usuarios.routes";
import marketRoutes from "./modules/market/market.routes";

import creditosRoutes from "./modules/creditos/creditos.routes";
import intercambiosRoutes from "./modules/intercambios/intercambios.routes";
import adminReportRouter from "./modules/reports_admin/reports_admin.routes";
import  {userReportRouter}  from "./modules/report-user/userReport.routes";
import anunciosRoutes from "./modules/anuncios/anuncios.routes";
import reseniasRoutes from './modules/resenias/resenias.routes';
import {gamificacionRouter} from "./modules/gamificacion/gamificacion.routes";


import profilePublicRoutes from "./modules/profile-public/profilePublic.routes";





const app = express();

app.use(cors({ origin: ["http://localhost:5173"], credentials: true }));
app.use(express.json());

// 🔹 Rutas de API
app.use("/api", usuariosRoutes);
app.use("/api", marketRoutes);
app.use("/api", creditosRoutes);
app.use("/api", intercambiosRoutes);
app.use("/api/admin/reportes", adminReportRouter);
app.use("/api/user/reportes", userReportRouter);
app.use("/api", anunciosRoutes);
app.use("/api/gamificacion", gamificacionRouter);
app.use('/api/resenias', reseniasRoutes);
app.use("/api/profiles", profilePublicRoutes);

// 🔹 Archivos estáticos (fotos de publicaciones, etc.)
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

// 🔹 Página raíz informativa (puedes dejar la tuya)
app.get("/", (_req, res) => {
  res.send(`
    <html>
      <head>
        <title>Servidor TREKE 🌱</title>
        <style>
          body { font-family: sans-serif; text-align: center; background: #f3f4f6; margin-top: 100px; }
          h1 { color: #22c55e; }
          .box { background: white; padding: 20px; border-radius: 8px; display: inline-block; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
          a { color: #2563eb; text-decoration: none; }
        </style>
      </head>
      <body>
        <div class="box">
          <h1>Servidor TREKE 🌱</h1>
          <p>Tu backend Express + PostgreSQL está funcionando correctamente.</p>
          <p>✅ API activa en <code>/api/prueba</code></p>
          <p>🔗 <a href="/api/health">Probar endpoint de salud</a></p>
        </div>
      </body>
    </html>
  `);
});

// 🔹 Endpoint de prueba JSON
app.get("/api/prueba", (_req, res) => {
  res.json({ ok: true, service: "TREKE API", time: new Date().toISOString() });
});

// (Si quieres) health sencillo
app.get("/api/health", (_req, res) => {
  res.json({ ok: true, status: "healthy" });
});

export default app;
