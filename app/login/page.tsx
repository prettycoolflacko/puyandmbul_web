"use client";

import { useActionState } from "react";
import { login } from "@/app/actions/auth";
import WindowCard from "@/components/WindowCard";

export default function LoginPage() {
  const [state, action, pending] = useActionState(login, undefined);

  return (
    /* Full-screen page bg: diagonal pink→blue gradient */
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #f5c4f0 0%, #d4aaee 40%, #a8d8f0 100%)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "16px",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Floating pixel star decorations */}
      <div
        style={{ position: "absolute", top: 40,  left: 60,  fontSize: 20, color: "#ff3fa4", animation: "float 3s ease-in-out infinite" }}
        aria-hidden
      >★</div>
      <div
        style={{ position: "absolute", top: 120, right: 80, fontSize: 14, color: "#4fd8f0", animation: "float 3s ease-in-out infinite", animationDelay: "1s" }}
        aria-hidden
      >✦</div>
      <div
        style={{ position: "absolute", bottom: 80, left: 120, fontSize: 18, color: "#ff3fa4", animation: "float 3s ease-in-out infinite", animationDelay: "2s" }}
        aria-hidden
      >♡</div>
      <div
        style={{ position: "absolute", bottom: 40, right: 60, fontSize: 16, color: "#4fd8f0", animation: "float 3s ease-in-out infinite", animationDelay: "0.5s" }}
        aria-hidden
      >★</div>

      {/* Login window card */}
      <div
        style={{ width: "100%", maxWidth: 420 }}
        className="animate-fade-in-up"
      >
        <WindowCard title="puyandmbul.love — enter password" icon="🔐">
          <div style={{ textAlign: "center", padding: "8px 0 20px" }}>
            {/* Pixel art avatar placeholder */}
            <div
              style={{
                width: 64,
                height: 64,
                border: "3px solid #ff3fa4",
                background: "#000",
                margin: "0 auto 16px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 28,
                boxShadow: "3px 3px 0 #e0289a",
              }}
            >
              ♡
            </div>

            {/* Heading */}
            <h1
              style={{
                fontFamily: "var(--font-pixel)",
                fontSize: 10,
                color: "#ff3fa4",
                marginBottom: 8,
                lineHeight: 2,
                textShadow: "0 0 12px rgba(255,63,164,0.6)",
              }}
            >
              hewo!! ♡
            </h1>
            <p style={{ fontFamily: "var(--font-vt323)", fontSize: 20, color: "#4fd8f0", marginBottom: 24 }}>
              ready to come in? enter our secret~
            </p>

            <form action={action}>
              <input
                id="login-password"
                name="password"
                type="password"
                placeholder="enter password..."
                className="pixel-input"
                style={{ textAlign: "center", fontSize: 20, marginBottom: 8 }}
                autoFocus
              />

              {state?.error && (
                <p
                  className="animate-fade-in-up"
                  style={{
                    fontFamily: "var(--font-vt323)",
                    fontSize: 18,
                    color: "#ff3fa4",
                    marginBottom: 8,
                    textShadow: "0 0 8px rgba(255,63,164,0.6)",
                  }}
                >
                  ✗ {state.error}
                </p>
              )}

              <div style={{ marginTop: 16 }}>
                <button
                  id="login-submit-btn"
                  type="submit"
                  disabled={pending}
                  className="pixel-btn"
                  style={{ width: "100%", padding: "12px 16px", fontSize: 9 }}
                >
                  {pending ? (
                    <span style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
                      <span className="animate-spin" style={{ display: "inline-block" }}>◌</span>
                      opening...
                    </span>
                  ) : (
                    "enter ♡"
                  )}
                </button>
              </div>
            </form>
          </div>
        </WindowCard>
      </div>
    </div>
  );
}
