import "dotenv/config";
import express, { type Express, type Request, type Response, type NextFunction } from "express";
import fs from "fs";
import path from "path";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { appRouter } from "../routers";
import { createContext } from "./context";
import { registerOAuthRoutes } from "./oauth";

/** Express app shared by local dev, production Node, and Vercel serverless. */
export function createApp(): Express {
  const app = express();

  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ limit: "50mb", extended: true }));

  registerOAuthRoutes(app);

  app.use(
    "/api/trpc",
    createExpressMiddleware({
      router: appRouter,
      createContext,
    })
  );

  // On Vercel, static files are served from /public by the CDN (express.static is ignored).
  // Non-API routes still hit this function, so serve index.html for client-side routing.
  // Static file serving fallback for SPA routing is handled by vercel.json rewrites.
  // This block is only needed if you want to handle it in the serverless function.
  // However, it's better to let Vercel's edge handle it.
  if (process.env.VERCEL) {
    app.get("*", (req: Request, res: Response, next: NextFunction) => {
      if (req.path.startsWith("/api")) {
        return next();
      }
      // Vercel serves index.html automatically for non-api routes if configured in vercel.json
      next();
    });
  }

  return app;
}
