import { testConnection } from "./src/config/database/database";

testConnection()
  .then(() => {
    console.log("🟢 Conexión exitosa");
    process.exit(0);
  })
  .catch((err) => {
    console.error("🔴 Error de conexión:", err);
    process.exit(1);
  });
