"use client";

import { useState } from "react";
import MomentForm from "./MomentForm";
import MomentCard from "./MomentCard";
import type { Moment, SimpleMoment } from "@/lib/types";

export default function TimelineView({
  moments,
  allMoments,
}: {
  moments: Moment[];
  allMoments: SimpleMoment[];
}) {
  const [showForm, setShowForm] = useState(false);
  const [editingMoment, setEditingMoment] = useState<Moment | null>(null);
  const [viewMode, setViewMode] = useState<"tree" | "linear">("tree");

  const allMomentsFlat = flattenMoments(moments);

  return (
    <div>
      {/* Controls */}
      <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 12, marginBottom: 20 }}>
        {/* View toggle */}
        <div style={{ display: "flex", gap: 8 }}>
          <button
            id="timeline-tree-btn"
            onClick={() => setViewMode("tree")}
            className={`pixel-btn pixel-btn-sm${viewMode === "tree" ? "" : " pixel-btn-cyan"}`}
          >
            🌳 Tree
          </button>
          <button
            id="timeline-linear-btn"
            onClick={() => setViewMode("linear")}
            className={`pixel-btn pixel-btn-sm${viewMode === "linear" ? "" : " pixel-btn-cyan"}`}
          >
            📜 Linear
          </button>
        </div>

        {/* New moment button */}
        <button
          id="timeline-new-moment-btn"
          onClick={() => { setEditingMoment(null); setShowForm(true); }}
          className="pixel-btn"
          style={{ marginLeft: "auto" }}
        >
          + New Moment
        </button>
      </div>

      {/* Form modal (window card style) */}
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
            style={{ width: "100%", maxWidth: 520, maxHeight: "90vh", overflow: "auto" }}
          >
            <div className="window-card-titlebar">
              <span className="window-card-title">
                {editingMoment ? "✎ Edit Moment" : "+ New Moment"}
              </span>
              <div className="window-card-controls">
                <button
                  className="window-btn"
                  onClick={() => setShowForm(false)}
                  aria-label="Close"
                >
                  ×
                </button>
              </div>
            </div>
            <div className="window-card-body">
              <MomentForm
                moment={editingMoment}
                parentOptions={allMoments}
                onDone={() => { setShowForm(false); setEditingMoment(null); }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Content */}
      {moments.length === 0 ? (
        <div style={{ textAlign: "center", padding: "48px 0" }}>
          <p style={{ fontSize: 48, marginBottom: 12 }}>✨</p>
          <p
            style={{
              fontFamily: "var(--font-pixel)",
              fontSize: 8,
              color: "#ff3fa4",
              lineHeight: 2,
              marginBottom: 8,
            }}
          >
            no moments yet
          </p>
          <p style={{ fontFamily: "var(--font-vt323)", fontSize: 20, color: "rgba(255,255,255,0.6)", marginBottom: 16 }}>
            start recording your beautiful journey together
          </p>
          <button
            onClick={() => setShowForm(true)}
            className="pixel-btn"
          >
            Create First Moment
          </button>
        </div>
      ) : viewMode === "tree" ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }} className="stagger-children">
          {moments.map((moment) => (
            <MomentCard
              key={moment.id}
              moment={moment}
              onEdit={(m) => { setEditingMoment(m); setShowForm(true); }}
              depth={0}
            />
          ))}
        </div>
      ) : (
        /* Linear view */
        <div style={{ position: "relative", paddingLeft: 32 }}>
          {/* Vertical line */}
          <div
            style={{
              position: "absolute",
              left: 10,
              top: 8,
              bottom: 8,
              width: 2,
              background: "linear-gradient(to bottom, #ff3fa4, rgba(255,63,164,0.1))",
            }}
          />
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {[...allMomentsFlat]
              .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
              .map((moment) => (
                <div key={moment.id} style={{ position: "relative" }}>
                  {/* Timeline dot */}
                  <div
                    style={{
                      position: "absolute",
                      left: -27,
                      top: 14,
                      width: 10,
                      height: 10,
                      background: "#ff3fa4",
                      border: "2px solid #000",
                      boxShadow: "0 0 6px rgba(255,63,164,0.8)",
                    }}
                  />
                  <MomentCard
                    moment={moment}
                    onEdit={(m) => { setEditingMoment(m); setShowForm(true); }}
                    depth={0}
                    compact
                  />
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
}

function flattenMoments(moments: Moment[]): Moment[] {
  const result: Moment[] = [];
  for (const m of moments) {
    result.push(m);
    if (m.children && m.children.length > 0) {
      result.push(...flattenMoments(m.children as Moment[]));
    }
  }
  return result;
}
