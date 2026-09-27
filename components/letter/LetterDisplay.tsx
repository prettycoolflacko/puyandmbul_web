"use client";

import { useState } from "react";
import type { Letter } from "@/lib/types";

export default function LetterDisplay({ letter }: { letter: Letter }) {
  const [opened, setOpened] = useState(false);
  const [opening, setOpening] = useState(false);

  const handleOpen = () => {
    setOpening(true);
    setTimeout(() => {
      setOpened(true);
    }, 600);
  };

  return (
    <div style={{ maxWidth: 600, margin: "0 auto" }}>
      {/* Heading */}
      <div style={{ textAlign: "center", marginBottom: 24 }}>
        <h2
          className="gradient-heading"
          style={{
            fontFamily: "var(--font-pixel)",
            fontSize: 12,
            lineHeight: 2.2,
            marginBottom: 8,
          }}
        >
          {letter.heading}
        </h2>
        {letter.subheading && (
          <p style={{ fontFamily: "var(--font-vt323)", fontSize: 20, color: "#4fd8f0" }}>
            {letter.subheading}
          </p>
        )}
      </div>

      {/* Interactive zone */}
      <div
        style={{
          minHeight: 280,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {!opened ? (
          /* ── Pixel envelope (closed) ── */
          <div style={{ textAlign: "center" }}>
            <button
              id="letter-envelope-btn"
              onClick={handleOpen}
              disabled={opening}
              style={{ background: "none", border: "none", cursor: "pointer", display: "block", margin: "0 auto" }}
              aria-label="Open the envelope"
            >
              {/*
                ENVELOPE PLACEHOLDER
                — Replace this div with <img src="/your-envelope.png" …> when you have pixel art ready.
                The current version is a pure-CSS pixel envelope.
              */}
              <div
                className={`pixel-envelope${opening ? " animate-float" : ""}`}
                style={{ margin: "0 auto" }}
              >
                {/* Envelope flap (top V shape via clip-path) */}
                <div
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    right: 0,
                    height: 80,
                    clipPath: "polygon(0 0, 50% 55%, 100% 0)",
                    background: "#ff3fa4",
                    zIndex: 2,
                    transformOrigin: "top center",
                    ...(opening ? { animation: "envelopeOpen 0.6s ease-in-out forwards" } : {}),
                  }}
                />
                {/* Bottom triangle */}
                <div
                  style={{
                    position: "absolute",
                    bottom: 0,
                    left: 0,
                    right: 0,
                    height: 80,
                    clipPath: "polygon(0 100%, 50% 40%, 100% 100%)",
                    background: "#3b2a6b",
                  }}
                />
                {/* Left triangle */}
                <div
                  style={{
                    position: "absolute",
                    top: 0,
                    bottom: 0,
                    left: 0,
                    width: "50%",
                    clipPath: "polygon(0 0, 0 100%, 100% 50%)",
                    background: "#4a3880",
                  }}
                />
                {/* Right triangle */}
                <div
                  style={{
                    position: "absolute",
                    top: 0,
                    bottom: 0,
                    right: 0,
                    width: "50%",
                    clipPath: "polygon(100% 0, 100% 100%, 0 50%)",
                    background: "#4a3880",
                  }}
                />
                {/* Heart seal */}
                <div
                  style={{
                    position: "absolute",
                    top: "50%",
                    left: "50%",
                    transform: "translate(-50%, -50%)",
                    width: 40,
                    height: 40,
                    background: "#ff3fa4",
                    border: "3px solid #fff",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 18,
                    zIndex: 3,
                    boxShadow: "0 0 12px rgba(255,63,164,0.8)",
                  }}
                >
                  ♡
                </div>
              </div>
            </button>

            <p
              style={{
                fontFamily: "var(--font-vt323)",
                fontSize: 20,
                color: "#ff3fa4",
                marginTop: 16,
              }}
              className={`animate-pulse-soft${opening ? " opacity-0" : ""}`}
            >
              {opening ? "..." : "tap to open ♡"}
            </p>
          </div>
        ) : (
          /* ── Revealed letter ── */
          <div className="letter-reveal" style={{ width: "100%" }}>
            {/* "Surprise!" header */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                marginBottom: 20,
              }}
            >
              <span style={{ fontSize: 28 }}>🎀</span>
              <h3
                className="gradient-heading"
                style={{
                  fontFamily: "var(--font-pixel)",
                  fontSize: 10,
                  lineHeight: 2,
                }}
              >
                i love you ♡
              </h3>
            </div>

            {/* Message */}
            <div
              style={{
                border: "2px solid rgba(79,216,240,0.4)",
                padding: "20px",
                marginBottom: 16,
                background: "rgba(0,0,0,0.4)",
              }}
            >
              <p
                style={{
                  fontFamily: "var(--font-vt323)",
                  fontSize: 22,
                  color: "#fff",
                  lineHeight: 1.6,
                  whiteSpace: "pre-wrap",
                }}
              >
                {letter.message}
              </p>
            </div>

            {/* Signature */}
            <p style={{ fontFamily: "var(--font-vt323)", fontSize: 20, color: "#ff3fa4", fontStyle: "italic", textAlign: "right" }}>
              with all my love ♡
            </p>

            {/* GIF / image */}
            {letter.gifPath && (
              <div style={{ marginTop: 20, textAlign: "center" }}>
                <div
                  style={{
                    display: "inline-block",
                    border: "4px solid #ff3fa4",
                    boxShadow: "4px 4px 0 #e0289a",
                    padding: 4,
                    background: "#000",
                    transform: "rotate(2deg)",
                    transition: "transform 0.3s",
                  }}
                >
                  <img
                    src={letter.gifPath}
                    alt="A cute surprise"
                    style={{ display: "block", maxWidth: "100%", maxHeight: 240 }}
                  />
                </div>
              </div>
            )}

            {/* Re-close button */}
            <div style={{ textAlign: "center", marginTop: 20 }}>
              <button
                id="letter-rewrap-btn"
                onClick={() => { setOpened(false); setOpening(false); }}
                className="pixel-btn pixel-btn-sm pixel-btn-cyan"
              >
                ↩ re-seal envelope
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
