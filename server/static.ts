import express, { type Express } from "express";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

// 1. INI FIX WAJIB: Bikin __dirname manual biar Vercel gak error ReferenceError
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export function serveStatic(app: Express) {
  // 2. Strategi "Jaring Ikan": Cek semua kemungkinan tempat folder frontend
  const possiblePaths = [
    path.join(__dirname, "public"),           // Cek di sebelah file ini
    path.join(__dirname, "../public"),        // Cek mundur satu folder
    path.join(__dirname, "../../dist"),       // Cek hasil build standar
    path.join(process.cwd(), "dist"),         // Cek folder dist di root
    path.join(process.cwd(), "public")        // Cek folder public di root
  ];

  // Cari path mana yang beneran ada isinya
  const distPath = possiblePaths.find(p => fs.existsSync(p));

  // 3. SAFETY NET: Kalau folder gak ketemu, JANGAN CRASH!
  // Biarkan Vercel yang handle lewat CDN-nya.
  if (!distPath) {
    console.log("Info: Folder build tidak ditemukan di server. Mengandalkan Vercel Frontend.");
    return; 
  }

  // Kalau ketemu (misal pas test di Replit), layani filenya
  app.use(express.static(distPath));

  app.use("*", (_req, res) => {
    res.sendFile(path.resolve(distPath, "index.html"));
  });
}