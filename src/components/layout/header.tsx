"use client";

import Link from "next/link";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { useState } from "react";
import CartDrawer from "@/components/ui/CartDrawer";

export default function Header() {
  const { totalItems } = useCart();
  const { user, logout, openAuthModal } = useAuth();
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const handleLogout = async () => {
    setIsProfileOpen(false);
    await logout();
  };

  return (
    <>
      <header className="sticky top-0 z-50 w-full backdrop-blur-lg bg-white/80 border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2 group">
              <span className="text-2xl">🍜</span>
              <span className="text-xl font-bold font-heading bg-linear-to-r from-primary to-accent bg-clip-text text-transparent">
                Kulinarya
              </span>
            </Link>

            {/* Desktop Nav */}
            <nav className="hidden md:flex items-center gap-8">
              <Link
                href="/"
                className="text-sm font-medium text-muted hover:text-primary transition-colors"
              >
                Home
              </Link>
              <Link
                href="/shop"
                className="text-sm font-medium text-muted hover:text-primary transition-colors"
              >
                Shop
              </Link>
              <Link
                href="/recipes"
                className="text-sm font-medium text-muted hover:text-primary transition-colors"
              >
                Recipes
              </Link>
              {user && (
                <Link
                  href="/orders"
                  className="text-sm font-medium text-muted hover:text-primary transition-colors"
                >
                  My Orders
                </Link>
              )}
            </nav>

            {/* Right: Auth + Cart + Mobile Menu */}
            <div className="flex items-center gap-3">
              {/* Auth: User Profile or Login */}
              {user ? (
                <div style={{ position: "relative" }}>
                  <button
                    onClick={() => setIsProfileOpen(!isProfileOpen)}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-surface-warm hover:bg-stone-200 transition-colors cursor-pointer"
                  >
                    <div
                      className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold"
                      style={{
                        background: "linear-gradient(135deg, #d97706, #ea580c)",
                      }}
                    >
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                    <span className="text-sm font-medium text-foreground hidden sm:inline">
                      {user.name}
                    </span>
                    <svg
                      width="12"
                      height="12"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="text-muted"
                    >
                      <path d="m6 9 6 6 6-6" />
                    </svg>
                  </button>

                  {/* Dropdown */}
                  {isProfileOpen && (
                    <>
                      <div
                        className="fixed inset-0 z-40"
                        onClick={() => setIsProfileOpen(false)}
                      />
                      <div
                        className="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl shadow-lg border border-border py-1 z-50"
                        style={{ animation: "fadeIn 0.15s ease" }}
                      >
                        <div className="px-4 py-2 border-b border-border">
                          <p className="text-sm font-medium text-foreground">
                            {user.name}
                          </p>
                          <p className="text-xs text-muted">{user.email}</p>
                        </div>
                        {user.role === "admin" && (
                          <Link
                            href="/admin"
                            className="block px-4 py-2 text-sm text-muted hover:text-primary hover:bg-surface-warm transition-colors"
                            onClick={() => setIsProfileOpen(false)}
                          >
                            Admin Dashboard
                          </Link>
                        )}
                        <button
                          onClick={handleLogout}
                          className="w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-red-50 transition-colors cursor-pointer"
                        >
                          Sign Out
                        </button>
                      </div>
                    </>
                  )}
                </div>
              ) : (
                <button
                  onClick={openAuthModal}
                  className="text-sm font-medium text-primary hover:text-accent transition-colors px-3 py-1.5 rounded-full hover:bg-surface-warm cursor-pointer"
                >
                  Login
                </button>
              )}

              {/* Cart */}
              <button
                id="cart-toggle"
                onClick={() => setIsCartOpen(true)}
                className="relative p-2 rounded-full hover:bg-surface-warm transition-colors cursor-pointer"
                aria-label="Open cart"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6 text-foreground"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={1.5}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z"
                  />
                </svg>
                {totalItems > 0 && (
                  <span className="absolute -top-1 -right-1 bg-secondary text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                    {totalItems}
                  </span>
                )}
              </button>

              {/* Mobile hamburger */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="md:hidden p-2 rounded-full hover:bg-surface-warm transition-colors cursor-pointer"
                aria-label="Toggle menu"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={1.5}
                >
                  {isMobileMenuOpen ? (
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M6 18L18 6M6 6l12 12"
                    />
                  ) : (
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
                    />
                  )}
                </svg>
              </button>
            </div>
          </div>

          {/* Mobile Nav */}
          {isMobileMenuOpen && (
            <nav className="md:hidden pb-4 border-t border-border pt-4 flex flex-col gap-3">
              <Link
                href="/"
                className="text-sm font-medium text-muted hover:text-primary"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Home
              </Link>
              <Link
                href="/shop"
                className="text-sm font-medium text-muted hover:text-primary"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Shop
              </Link>
              <Link
                href="/recipes"
                className="text-sm font-medium text-muted hover:text-primary"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Recipes
              </Link>
              {user && (
                <Link
                  href="/orders"
                  className="text-sm font-medium text-muted hover:text-primary"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  My Orders
                </Link>
              )}
            </nav>
          )}
        </div>
      </header>

      <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </>
  );
}
