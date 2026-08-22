/**
 * Secure browser cookie helper for user-specific chatbot sessions.
 */

const COOKIE_NAME = "rag_session_id";
const COOKIE_MAX_AGE = 365 * 24 * 60 * 60; // 1 year in seconds

export function getCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const nameEQ = name + "=";
  const ca = document.cookie.split(";");
  for (let i = 0; i < ca.length; i++) {
    let c = ca[i];
    while (c.charAt(0) === " ") c = c.substring(1, c.length);
    if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
  }
  return null;
}

export function setCookie(name: string, value: string, maxAgeSeconds: number = COOKIE_MAX_AGE): void {
  if (typeof document === "undefined") return;
  const isHttps = typeof window !== "undefined" && window.location.protocol === "https:";
  const secureFlag = isHttps ? "; Secure" : "";
  document.cookie = `${name}=${encodeURIComponent(value)}; path=/; max-age=${maxAgeSeconds}; SameSite=Lax${secureFlag}`;
}

export function generateUUID(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return `sess_${Date.now()}_${Math.random().toString(36).substring(2, 10)}${Math.random().toString(36).substring(2, 10)}`;
}

export function getOrCreateSessionId(): string {
  let sessionId = getCookie(COOKIE_NAME);
  if (!sessionId) {
    sessionId = generateUUID();
    setCookie(COOKIE_NAME, sessionId);
  }
  return sessionId;
}

export function createNewSessionId(): string {
  const newSessionId = generateUUID();
  setCookie(COOKIE_NAME, newSessionId);
  return newSessionId;
}
