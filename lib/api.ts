import type { Match, MatchDetail } from "./types";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "https://profootball.srv883830.hstgr.cloud";

interface ApiEnvelope<T> {
  success: boolean;
  data: T;
}

class ApiError extends Error {
  status?: number;
  constructor(message: string, status?: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  let res: Response;
  try {
    res = await fetch(`${API_BASE_URL}${path}`, {
      ...init,
      // Match data changes every second server-side; never let the browser
      // or a CDN cache these responses.
      cache: "no-store",
      // No Content-Type header here: these are all GET requests with no
      // body, and adding Content-Type: application/json turns them into
      // a "non-simple" CORS request, forcing a preflight OPTIONS call.
      // The backend doesn't implement OPTIONS on these routes, so the
      // preflight 404s and the real request never goes out.
      headers: { ...(init?.headers ?? {}) },
    });
  } catch (err) {
    throw new ApiError(
      "Could not reach the match server. Check your connection and try again."
    );
  }

  if (!res.ok) {
    throw new ApiError(`Request to ${path} failed with status ${res.status}`, res.status);
  }

  const body = (await res.json()) as ApiEnvelope<T>;
  if (!body.success) {
    throw new ApiError(`Request to ${path} was not successful`);
  }
  return body.data;
}

export async function getHealth(): Promise<{ status: string }> {
  return request("/health");
}

export async function getMatches(): Promise<{ matches: Match[]; total: number }> {
  return request("/api/matches");
}

export async function getLiveMatches(): Promise<{ matches: Match[]; total: number }> {
  return request("/api/matches/live");
}

export async function getMatchById(id: string): Promise<MatchDetail> {
  return request(`/api/matches/${id}`);
}

export { ApiError, API_BASE_URL };
