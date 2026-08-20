import { frontendEnv } from "./env";

/**
 * In production the app is served by Firebase Hosting, which rewrites
 * /api/** to the Cloud Function — so relative paths work with no base URL.
 *
 * In development VITE_API_URL points at the Functions emulator:
 *   http://localhost:5001/<project-id>/europe-west1/api
 */
const apiBaseUrl = frontendEnv.apiUrl
  ? frontendEnv.apiUrl.replace(/\/$/, "")
  : "";

export function getApiUrl(pathname: string) {
  const path = pathname.startsWith("/") ? pathname : `/${pathname}`;
  return `${apiBaseUrl}${path}`;
}

export async function apiGet<T>(
  pathname: string,
  init?: RequestInit,
): Promise<T> {
  const response = await fetch(getApiUrl(pathname), {
    ...init,
    headers: {
      "content-type": "application/json",
      ...(init?.headers ?? {}),
    },
  });

  if (!response.ok) {
    throw new Error(`API request failed with status ${response.status}`);
  }

  return (await response.json()) as T;
}
