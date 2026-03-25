/**
 * Auth API — uses same-origin requests via Next.js proxy rewrites.
 * No cross-origin cookies needed; CSRF token is read from cookie.
 */

interface LoginData {
  email: string;
  password: string;
}

interface RegisterData {
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
}

export interface User {
  id: number;
  name: string;
  email: string;
  role: "admin" | "customer";
  email_verified_at: string | null;
  created_at: string;
  updated_at: string;
}

/**
 * Read the XSRF-TOKEN cookie value.
 * Laravel URL-encodes it — we decode before sending as header.
 */
function getXsrfToken(): string {
  const match = document.cookie
    .split("; ")
    .find((row) => row.startsWith("XSRF-TOKEN="));
  if (!match) return "";
  return decodeURIComponent(match.split("=")[1]);
}

/**
 * Fetch the CSRF cookie from Sanctum.
 */
export async function getCsrfCookie(): Promise<void> {
  await fetch("/sanctum/csrf-cookie", {
    method: "GET",
    credentials: "include",
  });
}

/**
 * Login with email/password. Returns user data.
 */
export async function login(data: LoginData): Promise<User> {
  await getCsrfCookie();

  const res = await fetch("/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      "X-XSRF-TOKEN": getXsrfToken(),
    },
    credentials: "include",
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.message || "Login failed");
  }

  return res.json();
}

/**
 * Register a new user. Returns user data.
 */
export async function register(data: RegisterData): Promise<User> {
  await getCsrfCookie();

  const res = await fetch("/register", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      "X-XSRF-TOKEN": getXsrfToken(),
    },
    credentials: "include",
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.message || "Registration failed");
  }

  return res.json();
}

/**
 * Logout the current user.
 */
export async function logout(): Promise<void> {
  await fetch("/logout", {
    method: "POST",
    headers: {
      Accept: "application/json",
      "X-XSRF-TOKEN": getXsrfToken(),
    },
    credentials: "include",
  });
}

/**
 * Get the currently authenticated user (session check).
 */
export async function getUser(): Promise<User> {
  const res = await fetch("/api/user", {
    method: "GET",
    headers: {
      Accept: "application/json",
    },
    credentials: "include",
  });

  if (!res.ok) {
    throw new Error("Not authenticated");
  }

  return res.json();
}

/**
 * Fetch the Google OAuth redirect URL.
 */
export async function getGoogleAuthUrl(): Promise<string> {
  const res = await fetch("/api/auth/google/redirect", {
    method: "GET",
    headers: {
      Accept: "application/json",
    },
  });

  if (!res.ok) {
    throw new Error("Failed to initialize Google Login");
  }

  const data = await res.json();
  return data.url;
}
