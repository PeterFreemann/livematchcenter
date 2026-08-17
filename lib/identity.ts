const USER_ID_KEY = "lmc_user_id";
const USERNAME_KEY = "lmc_username";

function randomId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `user_${Math.random().toString(36).slice(2)}_${Date.now()}`;
}

/** Gets (or creates) a stable anonymous user id for this browser. */
export function getUserId(): string {
  if (typeof window === "undefined") return "";
  let id = window.localStorage.getItem(USER_ID_KEY);
  if (!id) {
    id = randomId();
    window.localStorage.setItem(USER_ID_KEY, id);
  }
  return id;
}

export function getStoredUsername(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(USERNAME_KEY);
}

export function setStoredUsername(username: string): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(USERNAME_KEY, username.trim());
}
