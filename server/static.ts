import express, { type Express } from "express";
import fs from "fs";
import path from "path";

export function serveStatic(app: Express) {
  // Kita cari folder build di beberapa kemungkinan lokasi
  const possiblePaths = [
    path.join(process.cwd(), "dist"),          // Kemungkinan 1: Vite default
    path.join(process.cwd(), "public"),        // Kemungkinan 2: Folder public biasa
    path.join(process.cwd(), "dist/public"),   // Kemungkinan 3: Custom config
    path.join(__dirname, "../client/dist")     // Kemungkinan 4: Relative path
  ];

  // Cari path mana yang benar-benar ada
  const distPath = possiblePaths.find(p => fs.existsSync(p));

  if (!distPath) {
    throw new Error(
      `Could not find build directory. Checked locations: ${possiblePaths.join(", ")}`
    );
  }

  // Sajikan file statis dari folder yang ketemu
  app.use(express.static(distPath));

  // Handle SPA routing (selalu balik ke index.html)
  app.use("*", (_req, res) => {
    res.sendFile(path.resolve(distPath, "index.html"));
  });
}

