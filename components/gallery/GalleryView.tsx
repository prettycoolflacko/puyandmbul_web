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

  const filtered = filter === "all"
    ? photos
    : photos.filter((p) => p.moment.category === filter);

  return (
    <div>
      {/* Filters */}
      {categories.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-6">
          <button
            onClick={() => setFilter("all")}
            className={`px-4 py-2 rounded-xl text-sm font-medium cursor-pointer ${
              filter === "all"
                ? "bg-gradient-to-r from-rose-400 to-rose-500 text-white shadow-sm"
                : "bg-white/60 text-warm-gray/60 hover:text-warm-gray hover:bg-white/80"
            }`}
          >
            All ({photos.length})
          </button>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className={`px-4 py-2 rounded-xl text-sm font-medium cursor-pointer capitalize ${
                filter === cat
                  ? "bg-gradient-to-r from-rose-400 to-rose-500 text-white shadow-sm"
                  : "bg-white/60 text-warm-gray/60 hover:text-warm-gray hover:bg-white/80"
              }`}
            >
              {cat} ({photos.filter((p) => p.moment.category === cat).length})
            </button>
          ))}
        </div>
      )}

      {/* Grid */}
      {filtered.length === 0 ? (
        <div className="glass rounded-2xl p-12 text-center">
          <p className="text-5xl mb-4">📷</p>
          <h3 className="text-xl font-[family-name:var(--font-heading)] font-bold text-warm-gray mb-2">
            No photos yet
          </h3>
          <p className="text-warm-gray/60">
            Upload photos when creating moments in the timeline
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {filtered.map((photo, index) => (
            <button
              key={photo.id}
              onClick={() => setLightboxIndex(index)}
              className="aspect-square rounded-xl overflow-hidden shadow-sm hover:shadow-lg hover:-translate-y-1 group relative cursor-pointer"
            >
              <img
                src={photo.filePath}
                alt={photo.caption || photo.moment.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="absolute bottom-2 left-2 right-2">
                  <p className="text-white text-xs font-medium truncate">{photo.moment.title}</p>
                </div>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Lightbox */}
      {lightboxIndex !== null && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center"
          onClick={() => setLightboxIndex(null)}
        >
          <button
            onClick={() => setLightboxIndex(null)}
            className="absolute top-4 right-4 text-white/70 hover:text-white p-2 cursor-pointer z-10"
          >
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
            </svg>
          </button>

          {/* Previous */}
          {lightboxIndex > 0 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                setLightboxIndex(lightboxIndex - 1);
              }}
              className="absolute left-4 text-white/70 hover:text-white p-2 cursor-pointer"
            >
              <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
              </svg>
            </button>
          )}

          {/* Next */}
          {lightboxIndex < filtered.length - 1 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                setLightboxIndex(lightboxIndex + 1);
              }}
              className="absolute right-4 text-white/70 hover:text-white p-2 cursor-pointer"
            >
              <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
              </svg>
            </button>
          )}

          <div className="max-w-5xl max-h-[85vh] p-4" onClick={(e) => e.stopPropagation()}>
            <img
              src={filtered[lightboxIndex].filePath}
              alt={filtered[lightboxIndex].caption || ""}
              className="max-w-full max-h-[80vh] object-contain mx-auto rounded-lg"
            />
            <div className="text-center mt-3">
              <p className="text-white font-medium">{filtered[lightboxIndex].moment.title}</p>
              {filtered[lightboxIndex].caption && (
                <p className="text-white/60 text-sm mt-1">{filtered[lightboxIndex].caption}</p>
              )}
              <p className="text-white/40 text-xs mt-1">
                {lightboxIndex + 1} / {filtered.length}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
