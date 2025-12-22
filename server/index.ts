import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes.js";
import { serveStatic } from "./static.js";
import { createServer } from "http";

const app = express();
const httpServer = createServer(app);

declare module "http" {
  interface IncomingMessage {
    rawBody: unknown;
  }
}

app.use(
  express.json({
    verify: (req, _res, buf) => {
      req.rawBody = buf;
    },
  }),
);

app.use(express.urlencoded({ extended: false }));

export function log(message: string, source = "express") {
  const formattedTime = new Date().toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });

  console.log(`${formattedTime} [${source}] ${message}`);
}

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      log(logLine);
    }
  });

  next();
});

// --- GANTI DARI SINI KE BAWAH ---

// 1. Register routes (Kita panggil langsung biar siap sebelum Vercel jalan)
registerRoutes(httpServer, app);

// 2. Error handling middleware
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  const status = err.status || err.statusCode || 500;
  const message = err.message || "Internal Server Error";
  res.status(status).json({ message });
  throw err;
});

// 3. Setup Static Files (Khusus Production/Vercel)
if (process.env.NODE_ENV === "production") {
  serveStatic(app);
} else {
  // Setup Vite (Khusus Development di Replit)
  // Kita bungkus async biar gak nge-block export utama
  (async () => {
    const { setupVite } = await import("./vite.js");
    await setupVite(httpServer, app);
  })();
}

// 4. INI YANG DICARI VERCEL! (Export app)
export default app;

// 5. Jalankan server (Hanya kalau bukan di Vercel/Production)
// Vercel akan otomatis handle listen sendiri lewat export di atas.
if (process.env.NODE_ENV !== "production") {
  const port = parseInt(process.env.PORT || "5000", 10);
  httpServer.listen({ port, host: "0.0.0.0", reusePort: true }, () => {
    log(`serving on port ${port}`);
  });
}
