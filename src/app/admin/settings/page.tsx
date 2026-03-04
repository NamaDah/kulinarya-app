"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { updateAdminProfile, updateAdminPassword } from "@/lib/admin-api";

export default function AdminSettingsPage() {
  const { user } = useAuth();

  // Profile Form State
  const [profileName, setProfileName] = useState("");
  const [profileEmail, setProfileEmail] = useState("");
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);

  // Password Form State
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);

  useEffect(() => {
    if (user) {
      setProfileName(user.name);
      setProfileEmail(user.email);
    }
  }, [user]);

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdatingProfile(true);
    try {
      await updateAdminProfile({ name: profileName, email: profileEmail });
      alert("Profile updated successfully!");
      // Reload to ensure Context and Sidebar grab the new name
      window.location.reload();
    } catch (err: any) {
      alert(err.message || "Failed to update profile");
    }
    setIsUpdatingProfile(false);
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      alert("New passwords do not match.");
      return;
    }

    setIsUpdatingPassword(true);
    try {
      await updateAdminPassword({
        current_password: currentPassword,
        password: newPassword,
        password_confirmation: confirmPassword,
      });
      alert("Password updated successfully!");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: any) {
      alert(err.message || "Failed to update password");
    }
    setIsUpdatingPassword(false);
  };

  return (
    <div style={{ maxWidth: 800 }}>
      <div style={{ marginBottom: "2rem" }}>
        <h1
          style={{
            fontFamily: "var(--font-heading)",
            fontWeight: 700,
            fontSize: "1.75rem",
            color: "#1e293b",
            marginBottom: "0.5rem",
          }}
        >
          Administrator Settings
        </h1>
        <p style={{ fontSize: "0.9rem", color: "#64748b" }}>
          Update your profile information and secure your account.
        </p>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
        {/* Profile Details Card */}
        <section className="admin-card" style={{ padding: "2rem" }}>
          <h2
            style={{
              fontFamily: "var(--font-heading)",
              fontWeight: 600,
              fontSize: "1.2rem",
              color: "#1e293b",
              marginBottom: "0.5rem",
            }}
          >
            Profile Details
          </h2>
          <p
            style={{
              color: "#64748b",
              fontSize: "0.85rem",
              marginBottom: "1.5rem",
            }}
          >
            Update your administrator account's name and email address.
          </p>

          <form
            onSubmit={handleProfileSubmit}
            style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}
          >
            <div>
              <label
                style={{
                  display: "block",
                  fontSize: "0.85rem",
                  fontWeight: 600,
                  color: "#475569",
                  marginBottom: "0.5rem",
                }}
              >
                Full Name
              </label>
              <input
                type="text"
                required
                value={profileName}
                onChange={(e) => setProfileName(e.target.value)}
                style={{
                  width: "100%",
                  padding: "0.6rem 1rem",
                  borderRadius: "0.5rem",
                  border: "1px solid #cbd5e1",
                  fontSize: "0.95rem",
                  fontFamily: "inherit",
                }}
              />
            </div>

            <div>
              <label
                style={{
                  display: "block",
                  fontSize: "0.85rem",
                  fontWeight: 600,
                  color: "#475569",
                  marginBottom: "0.5rem",
                }}
              >
                Email Address
              </label>
              <input
                type="email"
                required
                value={profileEmail}
                onChange={(e) => setProfileEmail(e.target.value)}
                style={{
                  width: "100%",
                  padding: "0.6rem 1rem",
                  borderRadius: "0.5rem",
                  border: "1px solid #cbd5e1",
                  fontSize: "0.95rem",
                  fontFamily: "inherit",
                }}
              />
            </div>

            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                marginTop: "0.5rem",
              }}
            >
              <button
                type="submit"
                disabled={isUpdatingProfile}
                style={{
                  background: isUpdatingProfile ? "#94a3b8" : "#d97706",
                  color: "#fff",
                  border: "none",
                  padding: "0.6rem 1.5rem",
                  borderRadius: "0.5rem",
                  fontWeight: 600,
                  cursor: isUpdatingProfile ? "not-allowed" : "pointer",
                  transition: "background 0.2s",
                }}
              >
                {isUpdatingProfile ? "Saving..." : "Save Profile"}
              </button>
            </div>
          </form>
        </section>

        {/* Change Password Card */}
        <section className="admin-card" style={{ padding: "2rem" }}>
          <h2
            style={{
              fontFamily: "var(--font-heading)",
              fontWeight: 600,
              fontSize: "1.2rem",
              color: "#1e293b",
              marginBottom: "0.5rem",
            }}
          >
            Change Password
          </h2>
          <p
            style={{
              color: "#64748b",
              fontSize: "0.85rem",
              marginBottom: "1.5rem",
            }}
          >
            Ensure your account is using a long, random password to stay secure.
          </p>

          <form
            onSubmit={handlePasswordSubmit}
            style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}
          >
            <div>
              <label
                style={{
                  display: "block",
                  fontSize: "0.85rem",
                  fontWeight: 600,
                  color: "#475569",
                  marginBottom: "0.5rem",
                }}
              >
                Current Password
              </label>
              <input
                type="password"
                required
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                style={{
                  width: "100%",
                  padding: "0.6rem 1rem",
                  borderRadius: "0.5rem",
                  border: "1px solid #cbd5e1",
                  fontSize: "0.95rem",
                  fontFamily: "inherit",
                }}
              />
            </div>

            <div>
              <label
                style={{
                  display: "block",
                  fontSize: "0.85rem",
                  fontWeight: 600,
                  color: "#475569",
                  marginBottom: "0.5rem",
                }}
              >
                New Password
              </label>
              <input
                type="password"
                required
                minLength={8}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                style={{
                  width: "100%",
                  padding: "0.6rem 1rem",
                  borderRadius: "0.5rem",
                  border: "1px solid #cbd5e1",
                  fontSize: "0.95rem",
                  fontFamily: "inherit",
                }}
              />
            </div>

            <div>
              <label
                style={{
                  display: "block",
                  fontSize: "0.85rem",
                  fontWeight: 600,
                  color: "#475569",
                  marginBottom: "0.5rem",
                }}
              >
                Confirm New Password
              </label>
              <input
                type="password"
                required
                minLength={8}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                style={{
                  width: "100%",
                  padding: "0.6rem 1rem",
                  borderRadius: "0.5rem",
                  border: "1px solid #cbd5e1",
                  fontSize: "0.95rem",
                  fontFamily: "inherit",
                }}
              />
            </div>

            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                marginTop: "0.5rem",
              }}
            >
              <button
                type="submit"
                disabled={isUpdatingPassword}
                style={{
                  background: isUpdatingPassword ? "#94a3b8" : "#d97706",
                  color: "#fff",
                  border: "none",
                  padding: "0.6rem 1.5rem",
                  borderRadius: "0.5rem",
                  fontWeight: 600,
                  cursor: isUpdatingPassword ? "not-allowed" : "pointer",
                  transition: "background 0.2s",
                }}
              >
                {isUpdatingPassword ? "Updating..." : "Update Password"}
              </button>
            </div>
          </form>
        </section>
      </div>
    </div>
  );
}
