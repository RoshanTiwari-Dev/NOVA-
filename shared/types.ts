/**
 * Unified type exports
 * Import shared types from this single entry point.
 */

export type * from "../drizzle/schema";
export * from "./_core/errors";

// AppRouter type - placeholder to avoid importing server code in frontend
// The actual type is defined in server/routers.ts
export type AppRouter = any;
