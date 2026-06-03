import { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";
import type { Express, Request, Response } from "express";
import * as db from "../db";
import { getSessionCookieOptions } from "./cookies";
import { sdk } from "./sdk";
import axios from "axios";
import { ENV } from "./env";

function getQueryParam(req: Request, key: string): string | undefined {
  const value = req.query[key];
  return typeof value === "string" ? value : undefined;
}

export function registerOAuthRoutes(app: Express) {
  app.get("/api/oauth/callback", async (req: Request, res: Response) => {
    const code = getQueryParam(req, "code");
    const state = getQueryParam(req, "state");

    if (!code || !state) {
      res.status(400).json({ error: "code and state are required" });
      return;
    }

    try {
      // Direct GitHub OAuth exchange
      const response = await axios.post(
        ENV.oAuthServerUrl,
        {
          client_id: ENV.appId,
          client_secret: ENV.githubClientSecret,
          code,
          redirect_uri: atob(state),
        },
        {
          headers: {
            Accept: "application/json",
          },
        }
      );

      const { access_token } = response.data;
      if (!access_token) {
        console.error("[OAuth] No access token in response:", response.data);
        throw new Error("Failed to obtain access token");
      }

      // Get user info from GitHub
      const userResponse = await axios.get("https://api.github.com/user", {
        headers: {
          Authorization: `Bearer ${access_token}`,
        },
      });

      const userInfo = userResponse.data;
      const openId = `github-${userInfo.id}`;

      await db.upsertUser({
        openId,
        name: userInfo.name || userInfo.login,
        email: userInfo.email ?? null,
        loginMethod: "github",
        lastSignedIn: new Date(),
      });

      const sessionToken = await sdk.createSessionToken(openId, {
        name: userInfo.name || userInfo.login,
        expiresInMs: ONE_YEAR_MS,
      });

      const cookieOptions = getSessionCookieOptions(req);
      res.cookie(COOKIE_NAME, sessionToken, { ...cookieOptions, maxAge: ONE_YEAR_MS });
      res.redirect(302, "/");
    } catch (error) {
      console.error("[OAuth] Callback failed", error);
      res.status(500).json({ error: "OAuth callback failed" });
    }
  });
}
