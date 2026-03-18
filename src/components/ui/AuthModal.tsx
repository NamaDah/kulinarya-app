"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";

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
          </form>
        )}
      </div>
    </div>
  );
}
