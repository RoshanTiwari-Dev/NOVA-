import "dotenv/config";
import express, { type Express } from "express";
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
  if (process.env.VERCEL) {
    const indexPath = path.join(process.cwd(), "public", "index.html");
    app.get("*", (req, res, next) => {
      if (req.path.startsWith("/api")) {
        next();
        return;
      }
      if (fs.existsSync(indexPath)) {
        res.sendFile(indexPath);
        return;
      }
      res.status(404).send("Not found");
    });
  }

  return app;
}
