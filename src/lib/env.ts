import "server-only";

export type AppEnv = "local" | "test" | "dev" | "staging" | "prod";
const APP_ENVS: readonly AppEnv[] = ["local", "test", "dev", "staging", "prod"];

export type Env = {
  apiInternalUrl: string;
  siteUrl: string;
  appEnv: AppEnv;
  /** false only when SESSION_COOKIE_SECURE=false (local http development) */
  cookieSecure: boolean;
};

let cached: Env | undefined;

/**
 * Validate server-only environment once, lazily (so `next build` does not need runtime
 * values). Errors name the offending keys, never their values.
 */
export function getEnv(): Env {
  if (cached) return cached;
  const e = process.env;
  const problems: string[] = [];
  const need = (key: string) => {
    const v = e[key]?.trim();
    if (!v) problems.push(`${key} is missing`);
    return v ?? "";
  };
  const api = need("API_INTERNAL_URL");
  const site = need("SITE_URL");
  const appEnv = need("APP_ENV");
  for (const [key, v] of [["API_INTERNAL_URL", api], ["SITE_URL", site]] as const) {
    if (v && !/^https?:\/\/[^/]/.test(v)) problems.push(`${key} must be an http(s) URL`);
  }
  if (appEnv && !APP_ENVS.includes(appEnv as AppEnv)) problems.push(`APP_ENV must be one of ${APP_ENVS.join("|")}`);
  if (problems.length) {
    throw new Error(`Invalid storefront environment: ${problems.join("; ")}. See .env.local.example.`);
  }
  cached = {
    apiInternalUrl: api.replace(/\/+$/, ""),
    siteUrl: site.replace(/\/+$/, ""),
    appEnv: appEnv as AppEnv,
    cookieSecure: e.SESSION_COOKIE_SECURE?.trim() !== "false",
  };
  return cached;
}

/** The mock payment page and dev endpoints exist only here. */
export const isMockPaymentAllowed = (): boolean => ["local", "test"].includes(getEnv().appEnv);
