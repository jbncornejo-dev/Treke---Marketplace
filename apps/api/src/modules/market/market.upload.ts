import multer from "multer";
import fs from "fs";
import path from "path";

const UPLOAD_ROOT = path.join(process.cwd(), "uploads", "market");

// Crear carpeta si no existe
if (!fs.existsSync(UPLOAD_ROOT)) {
  fs.mkdirSync(UPLOAD_ROOT, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, UPLOAD_ROOT);
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname) || ".jpg";
    const name = `${Date.now()}-${Math.random().toString(16).slice(2)}${ext}`;
    cb(null, name);
  },
});

function fileFilter(
  _req: any,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) {
  if (file.mimetype.startsWith("image/")) {
    cb(null, true);
  } else {
    cb(new Error("Solo se permiten imágenes"));
  }
}

export const uploadMarketImages = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5 MB
  },
}).array("images", 6); // hasta 6 imágenes por vez
