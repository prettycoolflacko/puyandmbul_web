"use client";

import { useState } from "react";

type Photo = {
  id: string;
  filePath: string;
  caption: string | null;
  moment: {
    id: string;
    title: string;
    category: string | null;
  };
};

export default function GalleryView({
  photos,
  categories,
}: {
  photos: Photo[];
  categories: string[];
}) {
  const [filter, setFilter] = useState<string>("all");
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const filtered =
    filter === "all" ? photos : photos.filter((p) => p.moment.category === filter);

  return (
    <div>
      {/* Category filters */}
      {categories.length > 0 && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 20 }}>
          <button
            id="gallery-filter-all"
            onClick={() => setFilter("all")}
            className={`pixel-btn pixel-btn-sm${filter === "all" ? "" : " pixel-btn-cyan"}`}
          >
            All ({photos.length})
          </button>
          {categories.map((cat) => (
            <button
              key={cat}
              id={`gallery-filter-${cat}`}
              onClick={() => setFilter(cat)}
              className={`pixel-btn pixel-btn-sm${filter === cat ? "" : " pixel-btn-cyan"}`}
            >
              {cat} ({photos.filter((p) => p.moment.category === cat).length})
            </button>
          ))}
        </div>
      )}

      {/* Grid */}
      {filtered.length === 0 ? (
        <div style={{ textAlign: "center", padding: "48px 0" }}>
          <p style={{ fontSize: 48, marginBottom: 12 }}>📷</p>
          <p
            style={{
              fontFamily: "var(--font-pixel)",
              fontSize: 8,
              color: "#ff3fa4",
              lineHeight: 2,
              marginBottom: 8,
            }}
          >
            no photos yet
          </p>
          <p style={{ fontFamily: "var(--font-vt323)", fontSize: 20, color: "rgba(255,255,255,0.6)" }}>
            upload photos when creating moments in the timeline
          </p>
        </div>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))",
            gap: 12,
          }}
        >
          {filtered.map((photo, index) => (
            <button
              key={photo.id}
              id={`gallery-photo-${photo.id}`}
              onClick={() => setLightboxIndex(index)}
              className="gallery-thumb"
              title={photo.caption || photo.moment.title}
            >
              <img
                src={photo.filePath}
                alt={photo.caption || photo.moment.title}
              />
              {/* Overlay on hover */}
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  background: "linear-gradient(to top, rgba(0,0,0,0.7) 0%, transparent 60%)",
                  display: "flex",
                  alignItems: "flex-end",
                  padding: 6,
                  opacity: 0,
                  transition: "opacity 0.2s",
                }}
                className="gallery-thumb-overlay"
              >
                <p
                  style={{
                    fontFamily: "var(--font-vt323)",
                    fontSize: 14,
                    color: "#fff",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                    width: "100%",
                  }}
                >
                  {photo.moment.title}
                </p>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Lightbox — window card style */}
      {lightboxIndex !== null && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 50,
            background: "rgba(0,0,0,0.92)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 16,
          }}
          onClick={() => setLightboxIndex(null)}
        >
          {/* Window card wrapper */}
          <div
            className="window-card animate-fade-in-up"
            style={{ maxWidth: 800, width: "100%", maxHeight: "90vh" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="window-card-titlebar">
              <span className="window-card-title">
                {filtered[lightboxIndex].moment.title}
                {" — "}
                {lightboxIndex + 1}/{filtered.length}
              </span>
              <div className="window-card-controls">
                <button
                  className="window-btn"
                  onClick={() => setLightboxIndex(null)}
                  aria-label="Close lightbox"
                >
                  ×
                </button>
              </div>
            </div>
            <div className="window-card-body" style={{ padding: 0, display: "flex", flexDirection: "column", alignItems: "center" }}>
              <img
                src={filtered[lightboxIndex].filePath}
                alt={filtered[lightboxIndex].caption || ""}
                style={{
                  maxWidth: "100%",
                  maxHeight: "65vh",
                  objectFit: "contain",
                  display: "block",
                }}
              />
              {/* Caption + nav */}
              <div style={{ padding: "12px 20px", textAlign: "center", width: "100%" }}>
                {filtered[lightboxIndex].caption && (
                  <p style={{ fontFamily: "var(--font-vt323)", fontSize: 20, color: "#fff", marginBottom: 8 }}>
                    {filtered[lightboxIndex].caption}
                  </p>
                )}
                <div style={{ display: "flex", justifyContent: "center", gap: 12 }}>
                  <button
                    onClick={() => setLightboxIndex(Math.max(0, lightboxIndex - 1))}
                    disabled={lightboxIndex === 0}
                    className="pixel-btn pixel-btn-sm pixel-btn-cyan"
                  >
                    ◀ Prev
                  </button>
                  <button
                    onClick={() => setLightboxIndex(Math.min(filtered.length - 1, lightboxIndex + 1))}
                    disabled={lightboxIndex === filtered.length - 1}
                    className="pixel-btn pixel-btn-sm"
                  >
                    Next ▶
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Inject hover style for overlay — pure CSS workaround since inline :hover isn't possible */}
      <style>{`
        .gallery-thumb:hover .gallery-thumb-overlay { opacity: 1 !important; }
      `}</style>
    </div>
  );
}
