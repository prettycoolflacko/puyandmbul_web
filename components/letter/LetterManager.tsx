"use client";

import { useState } from "react";
import { createLetter, deleteLetter } from "@/app/actions/letters";
import type { Letter } from "@/lib/types";
import WindowCard from "@/components/WindowCard";

export default function LetterManager({ letters }: { letters: Letter[] }) {
  const [showForm, setShowForm] = useState(false);

  async function handleSubmit(formData: FormData) {
    await createLetter(formData);
    setShowForm(false);
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this letter?")) return;
    await deleteLetter(id);
  }

  return (
    <WindowCard title="Manage Letters" icon="⚙">
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
        <p style={{ fontFamily: "var(--font-vt323)", fontSize: 18, color: "rgba(255,255,255,0.6)" }}>
          {letters.length} letter{letters.length !== 1 ? "s" : ""} saved
        </p>
        <button
          id="letter-new-btn"
          onClick={() => setShowForm(!showForm)}
          className="pixel-btn pixel-btn-sm"
        >
          {showForm ? "✕ Cancel" : "+ New Letter"}
        </button>
      </div>

      {/* Create form */}
      {showForm && (
        <div
          className="animate-fade-in-up"
          style={{
            border: "2px solid rgba(79,216,240,0.4)",
            padding: 16,
            marginBottom: 20,
            background: "rgba(0,0,0,0.4)",
          }}
        >
          <p style={{ fontFamily: "var(--font-pixel)", fontSize: 7, color: "#4fd8f0", marginBottom: 12, lineHeight: 2 }}>
            create new letter
          </p>
          <p style={{ fontFamily: "var(--font-vt323)", fontSize: 17, color: "rgba(255,255,255,0.5)", marginBottom: 16 }}>
            Creating a new letter will make it the active one displayed above.
          </p>
          <form action={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div>
              <label htmlFor="letter-heading" className="pixel-label">Heading *</label>
              <input
                id="letter-heading"
                name="heading"
                required
                placeholder='e.g. "happy birthday, my love"'
                className="pixel-input"
              />
            </div>
            <div>
              <label htmlFor="letter-subheading" className="pixel-label">Subheading</label>
              <input
                id="letter-subheading"
                name="subheading"
                placeholder='e.g. "a little world, made for you"'
                className="pixel-input"
              />
            </div>
            <div>
              <label htmlFor="letter-message" className="pixel-label">Hidden Message *</label>
              <textarea
                id="letter-message"
                name="message"
                required
                rows={4}
                placeholder="The message revealed when the envelope is opened..."
                className="pixel-input"
                style={{ resize: "none" }}
              />
            </div>
            <div>
              <label htmlFor="letter-gif" className="pixel-label">GIF / Image</label>
              <input
                id="letter-gif"
                name="gif"
                type="file"
                accept="image/*"
                className="pixel-input"
              />
            </div>
            <div style={{ display: "flex", gap: 10 }}>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="pixel-btn pixel-btn-sm pixel-btn-cyan"
                style={{ flex: 1 }}
              >
                Cancel
              </button>
              <button type="submit" className="pixel-btn pixel-btn-sm" style={{ flex: 1 }}>
                Create Letter
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Letter list */}
      {letters.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {letters.map((letter) => (
            <div
              key={letter.id}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                border: `2px solid ${letter.isActive ? "#ff3fa4" : "rgba(79,216,240,0.3)"}`,
                padding: "10px 12px",
                background: "rgba(0,0,0,0.3)",
                gap: 12,
              }}
            >
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <p
                    style={{
                      fontFamily: "var(--font-vt323)",
                      fontSize: 20,
                      color: "#fff",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {letter.heading}
                  </p>
                  {letter.isActive && (
                    <span
                      style={{
                        fontFamily: "var(--font-pixel)",
                        fontSize: 6,
                        color: "#ff3fa4",
                        border: "1px solid #ff3fa4",
                        padding: "1px 4px",
                        flexShrink: 0,
                      }}
                    >
                      ACTIVE
                    </span>
                  )}
                </div>
                <p style={{ fontFamily: "var(--font-vt323)", fontSize: 16, color: "rgba(255,255,255,0.4)" }}>
                  Created {new Date(letter.createdAt).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })}
                </p>
              </div>
              <button
                onClick={() => handleDelete(letter.id)}
                className="pixel-btn pixel-btn-sm"
                style={{ padding: "3px 8px", fontSize: 10, flexShrink: 0 }}
                title="Delete"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      )}
    </WindowCard>
  );
}
