import "dotenv/config";

export type AppEnvironment = "development" | "test" | "production";

export const nodeEnv: AppEnvironment = (process.env.NODE_ENV as AppEnvironment) || "development";

export const pingMessage: string = process.env.PING_MESSAGE || "ping";

export const publicSiteUrl: string | undefined = process.env.PUBLIC_SITE_URL;

export const corsOrigins: string[] = nodeEnv === "production"
  ? [publicSiteUrl || "https://fusion-starter-1758821892.netlify.app"]
  : ["http://localhost:8080", "http://localhost:5173"];

export const socketOrigins: string[] = nodeEnv === "production"
  ? [publicSiteUrl || "https://fusion-starter-1758821892.netlify.app"]
  : ["http://localhost:8080", "http://localhost:5173"];


