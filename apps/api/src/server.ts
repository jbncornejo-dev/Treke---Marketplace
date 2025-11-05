import dotenv from "dotenv";
dotenv.config();

import app from "./app";

const PORT = Number(process.env.PORT || 4000);

const server = app.listen(PORT, () => {
  console.log(`🚀 API running on http://localhost:${PORT}`);
});

process.on("SIGINT", () => {
  server.close(() => {
    console.log("🛑 Server closed");
    process.exit(0);
  });
});
