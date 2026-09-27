"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { logout } from "@/app/actions/auth";
import { useState } from "react";
import SpotifyWebPlayer from "@/components/SpotifyWebPlayer";

const mainNav = [
  { href: "/timeline",      label: "✦ Timeline" },
  { href: "/gallery",       label: "✦ Gallery" },
  { href: "/special-dates", label: "✦ Milestones" },
  { href: "/letter",        label: "✦ Letter" },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  function isActive(href: string) {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  }

  return (
    <>
      {/* ── Mobile top bar ─────────────────────────────────── */}
      <div className="mobile-topbar">
        {/* Site name */}
        <Link
          href="/"
          style={{ fontFamily: "var(--font-pixel)", fontSize: 8, color: "#ff3fa4" }}
          onClick={() => setMobileOpen(false)}
        >
          puyandmbul ♡
        </Link>

        {/* Hamburger */}
        <button
          id="sidebar-mobile-toggle"
          onClick={() => setMobileOpen(!mobileOpen)}
          style={{
            background: "none",
            border: "2px solid #ff3fa4",
            color: "#fff",
            padding: "4px 8px",
            cursor: "pointer",
            fontFamily: "var(--font-pixel)",
            fontSize: 10,
          }}
          aria-label="Toggle menu"
        >
          {mobileOpen ? "✕" : "☰"}
        </button>
      </div>

      {/* ── Mobile overlay ─────────────────────────────────── */}
      {mobileOpen && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.5)",
            zIndex: 39,
          }}
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* ── Sidebar ────────────────────────────────────────── */}
      <aside className={`sidebar${mobileOpen ? " mobile-open" : ""}`}>

        {/* Avatar slot + site name */}
        <div style={{ padding: "20px 16px 12px", textAlign: "center", borderBottom: "2px solid rgba(255,63,164,0.3)" }}>
          {/* 64×64 avatar placeholder — swap in your own image here */}
          <div
            id="sidebar-avatar"
            style={{
              width: 64,
              height: 64,
              border: "3px solid #ff3fa4",
              background: "#000",
              margin: "0 auto 12px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 28,
              boxShadow: "3px 3px 0 #e0289a",
              backgroundImage:
                "radial-gradient(circle, rgba(255,255,255,0.6) 1px, transparent 1px)",
              backgroundSize: "16px 16px",
            }}
            title="Avatar — replace with your image"
          >
            {/* Replace this div with an <img> when you have your avatar ready */}
            ♡
          </div>

          {/* Site wordmark */}
          <div
            style={{
              fontFamily: "var(--font-pixel)",
              fontSize: 8,
              color: "#fff",
              textDecoration: "underline",
              lineHeight: 2,
            }}
          >
            puyandmbul
          </div>
          <div style={{ fontFamily: "var(--font-vt323)", fontSize: 16, color: "#ff3fa4", marginTop: 2 }}>
            made with love ♡
          </div>
        </div>

        {/* Home link */}
        <Link
          href="/"
          className={`sidebar-nav-link${isActive("/") && pathname === "/" ? " active" : ""}`}
          onClick={() => setMobileOpen(false)}
        >
          ⌂ Home
        </Link>

        <hr className="sidebar-divider" />

        {/* Main nav */}
        <div className="sidebar-nav-header">Pages</div>
        {mainNav.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`sidebar-nav-link${isActive(item.href) ? " active" : ""}`}
            onClick={() => setMobileOpen(false)}
          >
            {item.label}
          </Link>
        ))}

        <hr className="sidebar-divider" />

        {/* Now playing / Spotify widget */}
        <div className="sidebar-nav-header">♪ Now Playing</div>
        <div style={{ padding: "0 0 8px" }}>
          <SpotifyWebPlayer />
        </div>

        {/* Push logout to bottom */}
        <div style={{ flex: 1 }} />

        <hr className="sidebar-divider" />

        {/* Logout */}
        <form action={logout} style={{ padding: "8px 16px 16px" }}>
          <button
            id="sidebar-logout-btn"
            type="submit"
            className="pixel-btn pixel-btn-sm"
            style={{ width: "100%", textAlign: "center" }}
          >
            ⇥ Log out
          </button>
        </form>
      </aside>
    </>
  );
}
