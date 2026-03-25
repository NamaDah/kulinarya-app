"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";
import { getGoogleAuthUrl } from "@/lib/auth-api";

export default function AuthModal() {
  const { authModalOpen, closeAuthModal, login, register } = useAuth();
  const { t } = useLanguage();
  const [tab, setTab] = useState<"login" | "register">("login");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Login fields
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Register fields
  const [name, setName] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [regConfirm, setRegConfirm] = useState("");

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") closeAuthModal();
    },
    [closeAuthModal],
  );

  useEffect(() => {
    if (authModalOpen) {
      document.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [authModalOpen, handleKeyDown]);

  // Reset form when modal opens
  useEffect(() => {
    if (authModalOpen) {
      setError("");
      setEmail("");
      setPassword("");
      setName("");
      setRegEmail("");
      setRegPassword("");
      setRegConfirm("");
      setTab("login");
    }
  }, [authModalOpen]);

  if (!authModalOpen) return null;

  const handleGoogleLogin = async () => {
    try {
      setLoading(true);
      setError("");
      const url = await getGoogleAuthUrl();
      window.location.href = url;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to connect to Google");
      setLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(email, password);
      closeAuthModal();
    } catch (err) {
      setError(err instanceof Error ? err.message : t("auth.loginFailed"));
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (regPassword !== regConfirm) {
      setError(t("auth.passwordsNoMatch"));
      return;
    }

    setLoading(true);
    try {
      await register(name, regEmail, regPassword, regConfirm);
      closeAuthModal();
    } catch (err) {
      setError(err instanceof Error ? err.message : t("auth.registrationFailed"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-modal-overlay" onClick={closeAuthModal}>
      <div className="auth-modal" onClick={(e) => e.stopPropagation()}>
        {/* Close button */}
        <button
          onClick={closeAuthModal}
          className="auth-modal-close"
          aria-label="Close"
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M18 6 6 18" />
            <path d="m6 6 12 12" />
          </svg>
        </button>

        {/* Logo */}
        <div className="auth-modal-logo">
          <span style={{ fontSize: "2rem" }}>🍜</span>
          <h2>Kulinarya</h2>
          <p>{t("auth.signInToShop")}</p>
        </div>

        {/* Tabs */}
        <div className="auth-tabs">
          <button
            className={`auth-tab ${tab === "login" ? "active" : ""}`}
            onClick={() => {
              setTab("login");
              setError("");
            }}
          >
            {t("auth.login")}
          </button>
          <button
            className={`auth-tab ${tab === "register" ? "active" : ""}`}
            onClick={() => {
              setTab("register");
              setError("");
            }}
          >
            {t("auth.register")}
          </button>
        </div>

        {/* Error */}
        {error && <div className="auth-error">{error}</div>}

        {/* Login Form */}
        {tab === "login" && (
          <form onSubmit={handleLogin} className="auth-form">
            <div className="auth-field">
              <label htmlFor="login-email">{t("auth.email")}</label>
              <input
                id="login-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                autoFocus
              />
            </div>
            <div className="auth-field">
              <label htmlFor="login-password">{t("auth.password")}</label>
              <input
                id="login-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
              />
            </div>
            <button type="submit" className="auth-submit" disabled={loading}>
              {loading ? t("auth.signingIn") : t("auth.signInBtn")}
            </button>
            <div style={{ textAlign: "center", margin: "1rem 0", color: "var(--color-muted)", fontSize: "0.85rem", position: "relative" }}>
              <div style={{ position: "absolute", top: "50%", left: 0, right: 0, borderTop: "1px solid var(--color-border)", zIndex: 0 }}></div>
              <span style={{ position: "relative", zIndex: 1, background: "var(--color-surface)", padding: "0 10px" }}>Or Auth With</span>
            </div>
            <button type="button" onClick={handleGoogleLogin} disabled={loading} style={{ width: "100%", padding: "0.75rem", borderRadius: "0.75rem", border: "1px solid var(--color-border)", background: "transparent", color: "var(--color-text)", fontWeight: 600, display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem", cursor: "pointer", transition: "all 0.2s" }} onMouseOver={(e) => e.currentTarget.style.background = "var(--color-surface-warm)"} onMouseOut={(e) => e.currentTarget.style.background = "transparent"}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              Google
            </button>
          </form>
        )}

        {/* Register Form */}
        {tab === "register" && (
          <form onSubmit={handleRegister} className="auth-form">
            <div className="auth-field">
              <label htmlFor="reg-name">{t("auth.fullName")}</label>
              <input
                id="reg-name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="John Doe"
                required
                autoFocus
              />
            </div>
            <div className="auth-field">
              <label htmlFor="reg-email">{t("auth.email")}</label>
              <input
                id="reg-email"
                type="email"
                value={regEmail}
                onChange={(e) => setRegEmail(e.target.value)}
                placeholder="you@example.com"
                required
              />
            </div>
            <div className="auth-field">
              <label htmlFor="reg-password">{t("auth.password")}</label>
              <input
                id="reg-password"
                type="password"
                value={regPassword}
                onChange={(e) => setRegPassword(e.target.value)}
                placeholder="••••••••"
                required
              />
            </div>
            <div className="auth-field">
              <label htmlFor="reg-confirm">{t("auth.confirmPassword")}</label>
              <input
                id="reg-confirm"
                type="password"
                value={regConfirm}
                onChange={(e) => setRegConfirm(e.target.value)}
                placeholder="••••••••"
                required
              />
            </div>
            <button type="submit" className="auth-submit" disabled={loading}>
              {loading ? t("auth.creatingAccount") : t("auth.createAccount")}
            </button>
            <div style={{ textAlign: "center", margin: "1rem 0", color: "var(--color-muted)", fontSize: "0.85rem", position: "relative" }}>
              <div style={{ position: "absolute", top: "50%", left: 0, right: 0, borderTop: "1px solid var(--color-border)", zIndex: 0 }}></div>
              <span style={{ position: "relative", zIndex: 1, background: "var(--color-surface)", padding: "0 10px" }}>Or</span>
            </div>
            <button type="button" onClick={handleGoogleLogin} disabled={loading} style={{ width: "100%", padding: "0.75rem", borderRadius: "0.75rem", border: "1px solid var(--color-border)", background: "transparent", color: "var(--color-text)", fontWeight: 600, display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem", cursor: "pointer", transition: "all 0.2s" }} onMouseOver={(e) => e.currentTarget.style.background = "var(--color-surface-warm)"} onMouseOut={(e) => e.currentTarget.style.background = "transparent"}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              Google
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
