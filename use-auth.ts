import { useState, useEffect, useCallback } from "react";
import type { AuthUser } from "@workspace/api-client-react";

export type { AuthUser };

interface AuthState {
  user: AuthUser | null;
  isLoading: boolean;
  /**
   * True when there is a valid Replit session — irrespective of
   * whether the user is on the staff allow-list. Use `isAuthorized`
   * (below) to decide whether to render protected admissions data.
   */
  isAuthenticated: boolean;
  /**
   * True when the signed-in user is on the `ALLOWED_EMAILS`
   * allow-list and may use the CRM. False when nobody is signed in or
   * when the signed-in user is not on the list.
   */
  isAuthorized: boolean;
  /**
   * True when the signed-in user is an admin (in `ADMIN_EMAILS`, or —
   * if that env var is unset — any allow-listed staffer). Admins can
   * moderate other users' content (e.g. edit/delete any note).
   */
  isAdmin: boolean;
  login: () => void;
  logout: () => void;
}

export function useAuth(): AuthState {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    fetch("/api/auth/user", { credentials: "include" })
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json() as Promise<{
          user: AuthUser | null;
          isAuthorized?: boolean;
          isAdmin?: boolean;
        }>;
      })
      .then((data) => {
        if (!cancelled) {
          setUser(data.user ?? null);
          setIsAuthorized(!!data.isAuthorized);
          setIsAdmin(!!data.isAdmin);
          setIsLoading(false);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setUser(null);
          setIsAuthorized(false);
          setIsAdmin(false);
          setIsLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const login = useCallback(() => {
    const meta = import.meta as unknown as { env?: { BASE_URL?: string } };
    const base = (meta.env?.BASE_URL ?? "/").replace(/\/+$/, "") || "/";
    window.location.href = `/api/login?returnTo=${encodeURIComponent(base)}`;
  }, []);

  const logout = useCallback(() => {
    window.location.href = "/api/logout";
  }, []);

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
    isAuthorized,
    isAdmin,
    login,
    logout,
  };
}
