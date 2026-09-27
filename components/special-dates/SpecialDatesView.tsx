"use client";

import { useState } from "react";
import { createSpecialDate, updateSpecialDate, deleteSpecialDate } from "@/app/actions/special-dates";

type SpecialDate = {
  id: string;
  label: string;
  date: Date;
  recurring: boolean;
  type: string;
  notes: string | null;
};

function getNextOccurrence(date: Date): Date {
  const now = new Date();
  const next = new Date(now.getFullYear(), new Date(date).getMonth(), new Date(date).getDate());
  if (next < now) next.setFullYear(next.getFullYear() + 1);
  return next;
}

function daysUntil(date: Date): number {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const target = new Date(date);
  target.setHours(0, 0, 0, 0);
  return Math.ceil((target.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
}

const typeEmojis: Record<string, string> = {
  birthday: "🎂",
  anniversary: "💍",
  holiday: "🎉",
  custom: "💕",
};

const typeAccents: Record<string, string> = {
  birthday: "#ff3fa4",
  anniversary: "#ff3fa4",
  holiday: "#ffd700",
  custom: "#4fd8f0",
};

export default function SpecialDatesView({ specialDates }: { specialDates: SpecialDate[] }) {
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<SpecialDate | null>(null);

  const enriched = specialDates
    .map((sd) => ({
      ...sd,
      nextOccurrence: sd.recurring ? getNextOccurrence(sd.date) : new Date(sd.date),
    }))
    .map((sd) => ({ ...sd, daysUntil: daysUntil(sd.nextOccurrence) }))
    .sort((a, b) => a.daysUntil - b.daysUntil);

  async function handleSubmit(formData: FormData) {
    if (editing) {
      await updateSpecialDate(editing.id, formData);
    } else {
      await createSpecialDate(formData);
    }
    setShowForm(false);
    setEditing(null);
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this special date?")) return;
    await deleteSpecialDate(id);
  }

  return (
    <div>
      {/* Add button */}
      <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 16 }}>
        <button
          id="special-dates-add-btn"
          onClick={() => { setEditing(null); setShowForm(true); }}
          className="pixel-btn"
        >
          + Add Date
        </button>
      </div>

      {/* Form modal */}
      {showForm && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 50,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "rgba(0,0,0,0.7)",
            padding: 16,
          }}
        >
          <div
            className="window-card animate-fade-in-up"
            style={{ width: "100%", maxWidth: 460 }}
          >
            <div className="window-card-titlebar">
              <span className="window-card-title">
                {editing ? "✎ Edit Date" : "+ New Special Date"}
              </span>
              <div className="window-card-controls">
                <button
                  className="window-btn"
                  onClick={() => { setShowForm(false); setEditing(null); }}
                  aria-label="Close"
                >
                  ×
                </button>
              </div>
            </div>
            <div className="window-card-body">
              <form action={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                <div>
                  <label htmlFor="sd-label" className="pixel-label">Label *</label>
                  <input
                    id="sd-label"
                    name="label"
                    required
                    defaultValue={editing?.label || ""}
                    placeholder="e.g. Her Birthday"
                    className="pixel-input"
                  />
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                  <div>
                    <label htmlFor="sd-date" className="pixel-label">Date *</label>
                    <input
                      id="sd-date"
                      name="date"
                      type="date"
                      required
                      defaultValue={editing ? new Date(editing.date).toISOString().split("T")[0] : ""}
                      className="pixel-input"
                    />
                  </div>
                  <div>
                    <label htmlFor="sd-type" className="pixel-label">Type *</label>
                    <select
                      id="sd-type"
                      name="type"
                      required
                      defaultValue={editing?.type || ""}
                      className="pixel-select"
                    >
                      <option value="">Select...</option>
                      <option value="birthday">🎂 Birthday</option>
                      <option value="anniversary">💍 Anniversary</option>
                      <option value="holiday">🎉 Holiday</option>
                      <option value="custom">💕 Custom</option>
                    </select>
                  </div>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <input
                    id="sd-recurring"
                    name="recurring"
                    type="checkbox"
                    value="true"
                    defaultChecked={editing?.recurring ?? true}
                    style={{ width: 16, height: 16, accentColor: "#ff3fa4", cursor: "pointer" }}
                  />
                  <label
                    htmlFor="sd-recurring"
                    style={{ fontFamily: "var(--font-vt323)", fontSize: 18, color: "#fff", cursor: "pointer" }}
                  >
                    Recurring every year
                  </label>
                </div>

                <div>
                  <label htmlFor="sd-notes" className="pixel-label">Notes</label>
                  <textarea
                    id="sd-notes"
                    name="notes"
                    rows={2}
                    defaultValue={editing?.notes || ""}
                    placeholder="Any notes..."
                    className="pixel-input"
                    style={{ resize: "none" }}
                  />
                </div>

                <div style={{ display: "flex", gap: 10 }}>
                  <button
                    type="button"
                    onClick={() => { setShowForm(false); setEditing(null); }}
                    className="pixel-btn pixel-btn-cyan"
                    style={{ flex: 1 }}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="pixel-btn" style={{ flex: 1 }}>
                    {editing ? "Update" : "Add"} Date
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Cards grid */}
      {enriched.length === 0 ? (
        <div style={{ textAlign: "center", padding: "48px 0" }}>
          <p style={{ fontSize: 48, marginBottom: 12 }}>📅</p>
          <p
            style={{
              fontFamily: "var(--font-pixel)",
              fontSize: 8,
              color: "#ff3fa4",
              lineHeight: 2,
              marginBottom: 8,
            }}
          >
            no special dates yet
          </p>
          <p style={{ fontFamily: "var(--font-vt323)", fontSize: 20, color: "rgba(255,255,255,0.6)", marginBottom: 16 }}>
            add birthdays, anniversaries, and other dates you want to remember
          </p>
          <button onClick={() => setShowForm(true)} className="pixel-btn">
            Add First Date
          </button>
        </div>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
            gap: 16,
          }}
          className="stagger-children"
        >
          {enriched.map((sd) => {
            const accent = typeAccents[sd.type] ?? "#ff3fa4";
            return (
              <div
                key={sd.id}
                className="countdown-card"
                style={{ borderColor: accent, boxShadow: `3px 3px 0 ${accent}60` }}
              >
                {/* Header row */}
                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 12 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <span style={{ fontSize: 24 }}>{typeEmojis[sd.type] ?? "💕"}</span>
                    <div>
                      <p style={{ fontFamily: "var(--font-pixel)", fontSize: 7, color: accent, lineHeight: 1.8 }}>
                        {sd.label}
                      </p>
                      <p style={{ fontFamily: "var(--font-vt323)", fontSize: 16, color: "rgba(255,255,255,0.5)" }}>
                        {sd.type}{sd.recurring ? " • recurring" : ""}
                      </p>
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: 4 }}>
                    <button
                      onClick={() => { setEditing(sd); setShowForm(true); }}
                      className="pixel-btn pixel-btn-sm pixel-btn-cyan"
                      style={{ padding: "3px 7px", fontSize: 10 }}
                      title="Edit"
                    >
                      ✎
                    </button>
                    <button
                      onClick={() => handleDelete(sd.id)}
                      className="pixel-btn pixel-btn-sm"
                      style={{ padding: "3px 7px", fontSize: 10 }}
                      title="Delete"
                    >
                      ✕
                    </button>
                  </div>
                </div>

                {/* Countdown */}
                <div
                  style={{
                    textAlign: "center",
                    padding: "16px 8px",
                    border: `2px solid ${accent}40`,
                    marginBottom: 10,
                  }}
                >
                  {sd.daysUntil === 0 ? (
                    <p className="countdown-number animate-pulse-soft" style={{ fontSize: 20 }}>
                      Today! 🎉
                    </p>
                  ) : sd.daysUntil === 1 ? (
                    <p className="countdown-number" style={{ fontSize: 18 }}>
                      Tomorrow!
                    </p>
                  ) : sd.daysUntil < 0 ? (
                    <>
                      <p className="countdown-number" style={{ color: "rgba(255,255,255,0.6)" }}>{Math.abs(sd.daysUntil)}</p>
                      <p style={{ fontFamily: "var(--font-vt323)", fontSize: 18, color: "rgba(255,255,255,0.5)" }}>
                        days ago
                      </p>
                    </>
                  ) : (
                    <>
                      <p className="countdown-number">{sd.daysUntil}</p>
                      <p style={{ fontFamily: "var(--font-vt323)", fontSize: 18, color: "rgba(255,255,255,0.5)" }}>
                        days to go
                      </p>
                    </>
                  )}
                </div>

                <p style={{ fontFamily: "var(--font-vt323)", fontSize: 16, color: "rgba(255,255,255,0.4)", textAlign: "center" }}>
                  {sd.nextOccurrence.toLocaleDateString("en-US", {
                    weekday: "long",
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                  })}
                </p>

                {sd.notes && (
                  <p style={{ fontFamily: "var(--font-vt323)", fontSize: 17, color: "rgba(255,255,255,0.6)", marginTop: 8, fontStyle: "italic" }}>
                    {sd.notes}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
