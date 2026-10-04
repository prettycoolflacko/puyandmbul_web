"use client";

import { useEffect, useState, useTransition } from "react";
import { usePathname } from "next/navigation";
import MinecraftHeart from "./MinecraftHeart";

const CUTE_PHRASES = [
  "crafting sweet memories with you...",
  "mining diamonds & stealing kisses...",
  "spawning infinite love in our world...",
  "generating our cozy little universe...",
  "brewing potions of pure affection...",
  "planting red tulips along our path...",
  "taming cats & baking cake for us...",
  "holding your hand tightly in 8-bit...",
  "building our dream treehouse together...",
  "syncing our heartbeats in stereo...",
  "enchanting our love with Unbreaking III...",
  "lighting torches so you feel safe...",
  "collecting warm hugs for the adventure...",
  "loading our favorite city pop playlist...",
];

export default function PixelLoadingScreen() {
  const pathname = usePathname();
  const [isVisible, setIsVisible] = useState(true);
  const [isFading, setIsFading] = useState(false);
  const [phraseIndex, setPhraseIndex] = useState(0);
  const [progress, setProgress] = useState(15);
  const [, startTransition] = useTransition();

  // Rotate cute phrases periodically while loading
  useEffect(() => {
    const interval = setInterval(() => {
      setPhraseIndex((prev) => (prev + 1) % CUTE_PHRASES.length);
    }, 1800);
    return () => clearInterval(interval);
  }, []);

  // First load handling
  useEffect(() => {
    // Progress increment animation
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 95) {
          clearInterval(progressInterval);
          return 95;
        }
        return prev + Math.floor(Math.random() * 15) + 5;
      });
    }, 100);

    const timer = setTimeout(() => {
      setProgress(100);
      setIsFading(true);
      setTimeout(() => {
        setIsVisible(false);
      }, 350);
    }, 900);

    return () => {
      clearInterval(progressInterval);
      clearTimeout(timer);
    };
  }, []);

  // Intercept internal link clicks to trigger the loading screen on route changes
  useEffect(() => {
    const handleLinkClick = (e: MouseEvent) => {
      const target = (e.target as HTMLElement).closest("a");
      if (!target) return;

      const href = target.getAttribute("href");
      if (
        href &&
        href.startsWith("/") &&
        !href.startsWith("/#") &&
        !href.startsWith("/api") &&
        href !== pathname
      ) {
        // Pick a random phrase for the new navigation
        setPhraseIndex(Math.floor(Math.random() * CUTE_PHRASES.length));
        setProgress(30);
        setIsFading(false);
        setIsVisible(true);

        const progressInterval = setInterval(() => {
          setProgress((prev) => {
            if (prev >= 90) {
              clearInterval(progressInterval);
              return 90;
            }
            return prev + 20;
          });
        }, 80);

        startTransition(() => {
          // When route completes
        });
      }
    };

    document.addEventListener("click", handleLinkClick, true);
    return () => document.removeEventListener("click", handleLinkClick, true);
  }, [pathname]);

  // When pathname finishes updating, complete the progress and hide
  useEffect(() => {
    setProgress(100);
    setIsFading(true);
    const timeout = setTimeout(() => {
      setIsVisible(false);
    }, 300);

    return () => clearTimeout(timeout);
  }, [pathname]);

  if (!isVisible) return null;

  return (
    <div
      id="retro-pixel-loading-screen"
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 99999,
        background: "radial-gradient(ellipse at center, #1e1240 0%, #0d061c 100%)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 16,
        opacity: isFading ? 0 : 1,
        transition: "opacity 0.35s ease-out",
        pointerEvents: isFading ? "none" : "auto",
        userSelect: "none",
      }}
    >
      {/* Retro Starry Pixel Grid overlay */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage:
            "linear-gradient(rgba(255, 63, 164, 0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(79, 216, 240, 0.05) 1px, transparent 1px)",
          backgroundSize: "24px 24px",
          pointerEvents: "none",
        }}
      />

      {/* Floating pixel sparkles */}
      <div
        style={{
          position: "absolute",
          top: "22%",
          left: "25%",
          animation: "pixelFloatParticle 2.2s ease-in-out infinite",
        }}
      >
        <MinecraftHeart size={16} />
      </div>
      <div
        style={{
          position: "absolute",
          top: "28%",
          right: "22%",
          animation: "pixelFloatParticle 2.8s ease-in-out infinite 0.9s",
        }}
      >
        <MinecraftHeart size={18} />
      </div>
      <div
        style={{
          position: "absolute",
          bottom: "24%",
          left: "28%",
          animation: "pixelFloatParticle 2.5s ease-in-out infinite 1.4s",
        }}
      >
        <MinecraftHeart size={14} />
      </div>

      {/* Centered Retro Window Card */}
      <div
        style={{
          position: "relative",
          width: "100%",
          maxWidth: 440,
          background: "#1a103c",
          border: "4px solid #ff3fa4",
          boxShadow: "6px 6px 0 #2e1f5e, 0 0 24px rgba(255,63,164,0.35)",
          borderRadius: 4,
          overflow: "hidden",
        }}
      >
        {/* Retro Window Title Bar */}
        <div
          style={{
            background: "linear-gradient(90deg, #ff3fa4 0%, #a82070 100%)",
            padding: "6px 10px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            borderBottom: "2px solid #2e1f5e",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <MinecraftHeart size={14} />
            <span
              style={{
                fontFamily: "var(--font-pixel)",
                fontSize: 8,
                color: "#fff",
                letterSpacing: 0.5,
              }}
            >
              PUY & MBUL WORLD v2.0
            </span>
          </div>

          <div style={{ display: "flex", gap: 4 }}>
            <span
              style={{
                display: "inline-block",
                width: 10,
                height: 10,
                background: "#4fd8f0",
                border: "1px solid #000",
                fontSize: 6,
                textAlign: "center",
                lineHeight: "9px",
                color: "#000",
              }}
            >
              _
            </span>
            <span
              style={{
                display: "inline-block",
                width: 10,
                height: 10,
                background: "#ffd700",
                border: "1px solid #000",
                fontSize: 6,
                textAlign: "center",
                lineHeight: "9px",
                color: "#000",
              }}
            >
              □
            </span>
            <span
              style={{
                display: "inline-block",
                width: 10,
                height: 10,
                background: "#ff3fa4",
                border: "1px solid #000",
                fontSize: 6,
                textAlign: "center",
                lineHeight: "9px",
                color: "#fff",
              }}
            >
              ✕
            </span>
          </div>
        </div>

        {/* Window Body */}
        <div
          style={{
            padding: "24px 20px 20px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 16,
            textAlign: "center",
          }}
        >
          {/* Minecraft Health Bar (5 Bouncing Hearts Wave) */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
            }}
          >
            {[0, 1, 2, 3, 4].map((i) => (
              <MinecraftHeart
                key={i}
                size={i === 2 ? 40 : 30}
                bounce
                delay={i * 0.12}
              />
            ))}
          </div>

          {/* Rotating Cute Rephrased Words */}
          <div style={{ minHeight: 38, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <p
              style={{
                fontFamily: "var(--font-vt323)",
                fontSize: 24,
                color: "#4fd8f0",
                textShadow: "0 0 8px rgba(79, 216, 240, 0.6)",
                letterSpacing: 1,
                lineHeight: 1.2,
                margin: 0,
              }}
            >
              ✦ {CUTE_PHRASES[phraseIndex]}
              <span className="animate-blink" style={{ color: "#ff3fa4", marginLeft: 2 }}>
                _
              </span>
            </p>
          </div>

          {/* Minecraft / Retro XP Progress Bar */}
          <div style={{ width: "100%" }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginBottom: 4,
                padding: "0 2px",
              }}
            >
              <span
                style={{
                  fontFamily: "var(--font-pixel)",
                  fontSize: 7,
                  color: "#ff3fa4",
                  textTransform: "uppercase",
                }}
              >
                LEVEL 99 LOVE
              </span>
              <span
                style={{
                  fontFamily: "var(--font-pixel)",
                  fontSize: 7,
                  color: "#4fd8f0",
                }}
              >
                {progress}%
              </span>
            </div>

            {/* Pixel Bar Container */}
            <div
              style={{
                height: 18,
                background: "#080414",
                border: "2px solid #ff3fa4",
                boxShadow: "2px 2px 0 #2e1f5e",
                padding: 2,
                position: "relative",
                overflow: "hidden",
              }}
            >
              {/* Progress Fill with animated stripes */}
              <div
                style={{
                  height: "100%",
                  width: `${progress}%`,
                  background:
                    "repeating-linear-gradient(45deg, #1DB954, #1DB954 8px, #189844 8px, #189844 16px)",
                  boxShadow: "0 0 10px rgba(29, 185, 84, 0.8)",
                  animation: "pixelBarStripes 1s linear infinite",
                  transition: "width 0.2s ease-out",
                }}
              />
            </div>
          </div>

          {/* Bottom subtitle info */}
          <p
            style={{
              fontFamily: "var(--font-vt323)",
              fontSize: 16,
              color: "rgba(255, 255, 255, 0.5)",
              margin: 0,
            }}
          >
            ♡ loading our memories... please wait ♡
          </p>
        </div>
      </div>
    </div>
  );
}
