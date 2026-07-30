const blockedAuthPaths = new Set(["/login", "/signup"]);

export function getSafeNextPath(value: string | undefined): string | undefined {
  if (!value) return undefined;
  if (!value.startsWith("/") || value.startsWith("//")) return undefined;
  if (value.includes("\\")) return undefined;

  const pathOnly = value.split("?")[0] ?? value;
  if (blockedAuthPaths.has(pathOnly)) return undefined;
  if (pathOnly.startsWith("/api") || pathOnly.startsWith("/_next")) {
    return undefined;
  }

  return value;
}

export function getPostAuthFallbackPath(role: string): string {
  return role === "admin" ? "/admin" : "/profile";
}
