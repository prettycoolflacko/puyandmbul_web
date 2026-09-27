"use client";

import { useState } from "react";
import { deleteMoment, deletePhoto } from "@/app/actions/moments";
import type { Moment } from "@/lib/types";

const categoryEmojis: Record<string, string> = {
  date: "💑",
  trip: "✈️",
  milestone: "🏆",
  everyday: "📸",
};

const categoryColors: Record<string, string> = {
  date: "#ff3fa4",
  trip: "#4fd8f0",
  milestone: "#ffd700",
  everyday: "#a8f0ff",
};

export default function MomentCard({
  moment,
  onEdit,
  depth,
  compact,
}: {
  moment: Moment;
  onEdit: (m: Moment) => void;
  depth: number;
  compact?: boolean;
}) {
  const [expanded, setExpanded] = useState(depth === 0);
  const [showPhotos, setShowPhotos] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const hasChildren = moment.children && moment.children.length > 0;
  const accentColor = categoryColors[moment.category ?? ""] ?? "#ff3fa4";

  async function handleDelete() {
    if (!confirm(`Delete "${moment.title}" and all its photos?`)) return;
    setDeleting(true);
    await deleteMoment(moment.id);
  }

  async function handleDeletePhoto(photoId: string) {
    if (!confirm("Delete this photo?")) return;
    await deletePhoto(photoId);
  }

  return (
    <div className={compact ? "" : depth > 0 ? "timeline-connector" : ""}>
      {/* The node card */}
      <div
        className="timeline-node"
        style={{ borderColor: accentColor, boxShadow: `3px 3px 0 ${accentColor}60` }}
      >
        <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
          {/* Category emoji badge */}
          <div
            style={{
              width: 36,
              height: 36,
              border: `2px solid ${accentColor}`,
              background: "#000",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 18,
              flexShrink: 0,
            }}
          >
            {categoryEmojis[moment.category ?? ""] ?? "💕"}
          </div>

          <div style={{ flex: 1, minWidth: 0 }}>
            {/* Title row */}
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 8 }}>
              <div>
                <h3
                  className="timeline-node-title"
                  style={{ color: accentColor }}
                >
                  {moment.title}
                </h3>
                <p style={{ fontFamily: "var(--font-vt323)", fontSize: 16, color: "rgba(255,255,255,0.5)", marginTop: 2 }}>
                  {new Date(moment.date).toLocaleDateString("en-US", {
                    weekday: "short",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                  {moment.category && (
                    <span
                      style={{
                        marginLeft: 8,
                        padding: "0 6px",
                        border: `1px solid ${accentColor}`,
                        color: accentColor,
                        fontSize: 14,
                      }}
                    >
                      {moment.category}
                    </span>
                  )}
                </p>
              </div>

              {/* Actions */}
              <div style={{ display: "flex", gap: 4, flexShrink: 0 }}>
                <button
                  onClick={() => onEdit(moment)}
                  title="Edit"
                  className="pixel-btn pixel-btn-sm pixel-btn-cyan"
                  style={{ padding: "3px 7px", fontSize: 10 }}
                >
                  ✎
                </button>
                <button
                  onClick={handleDelete}
                  disabled={deleting}
                  title="Delete"
                  className="pixel-btn pixel-btn-sm"
                  style={{ padding: "3px 7px", fontSize: 10 }}
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Description */}
            {moment.description && (
              <p style={{ fontFamily: "var(--font-vt323)", fontSize: 18, color: "rgba(255,255,255,0.8)", marginTop: 6, lineHeight: 1.5 }}>
                {moment.description}
              </p>
            )}

            {/* Photos */}
            {moment.photos.length > 0 && (
              <div style={{ marginTop: 8 }}>
                <button
                  onClick={() => setShowPhotos(!showPhotos)}
                  className="pixel-btn pixel-btn-sm pixel-btn-cyan"
                  style={{ fontSize: 12 }}
                >
                  {showPhotos ? "▲" : "▼"} {moment.photos.length} photo{moment.photos.length !== 1 ? "s" : ""}
                </button>
                {showPhotos && (
                  <div className="animate-fade-in-up" style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 8 }}>
                    {moment.photos.map((photo) => (
                      <div key={photo.id} style={{ position: "relative" }}>
                        <img
                          src={photo.filePath}
                          alt={photo.caption || ""}
                          style={{
                            width: 72,
                            height: 72,
                            objectFit: "cover",
                            border: "2px solid #ff3fa4",
                            display: "block",
                          }}
                        />
                        <button
                          onClick={() => handleDeletePhoto(photo.id)}
                          style={{
                            position: "absolute",
                            top: -4,
                            right: -4,
                            width: 16,
                            height: 16,
                            background: "#ff3fa4",
                            color: "#fff",
                            border: "none",
                            cursor: "pointer",
                            fontSize: 10,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontFamily: "var(--font-pixel)",
                          }}
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Expand/collapse for tree children */}
          {hasChildren && !compact && (
            <button
              onClick={() => setExpanded(!expanded)}
              className="pixel-btn pixel-btn-sm"
              style={{ flexShrink: 0, padding: "4px 8px", fontSize: 10 }}
              title={expanded ? "Collapse" : "Expand"}
            >
              {expanded ? "▲" : "▼"}
            </button>
          )}
        </div>
      </div>

      {/* Children */}
      {hasChildren && expanded && !compact && (
        <div style={{ marginTop: 4 }}>
          {moment.children?.map((child) => (
            <MomentCard
              key={child.id}
              moment={child as Moment}
              onEdit={onEdit}
              depth={depth + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
}
