"use client";

import { useState } from "react";
import { deleteMoment, deletePhoto } from "@/app/actions/moments";
import type { Moment } from "@/lib/types";

const categoryColors: Record<string, string> = {
  date: "from-pink-400 to-rose-400",
  trip: "from-blue-400 to-cyan-400",
  milestone: "from-amber-400 to-yellow-400",
  everyday: "from-green-400 to-emerald-400",
};

const categoryEmojis: Record<string, string> = {
  date: "💑",
  trip: "✈️",
  milestone: "🏆",
  everyday: "📸",
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
  const gradient = categoryColors[moment.category || ""] || "from-rose-400 to-rose-500";

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
    <div className={compact ? "" : depth > 0 ? "ml-6 border-l-2 border-rose-100 pl-4" : ""}>
      <div className="glass rounded-2xl p-5 hover:shadow-md group">
        <div className="flex items-start gap-4">
          {/* Category badge */}
          <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center text-lg shrink-0 shadow-sm`}>
            {categoryEmojis[moment.category || ""] || "💕"}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div>
                <h3 className="font-semibold text-warm-gray text-lg leading-tight">{moment.title}</h3>
                <p className="text-xs text-warm-gray/50 mt-0.5">
                  {new Date(moment.date).toLocaleDateString("en-US", {
                    weekday: "short",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                  {moment.category && (
                    <span className="ml-2 px-2 py-0.5 bg-rose-100 text-rose-500 rounded-full text-[10px] uppercase tracking-wider font-medium">
                      {moment.category}
                    </span>
                  )}
                </p>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100">
                <button
                  onClick={() => onEdit(moment)}
                  className="p-1.5 hover:bg-rose-50 rounded-lg cursor-pointer"
                  title="Edit"
                >
                  <svg className="w-4 h-4 text-warm-gray/50" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
                  </svg>
                </button>
                <button
                  onClick={handleDelete}
                  disabled={deleting}
                  className="p-1.5 hover:bg-rose-50 rounded-lg cursor-pointer"
                  title="Delete"
                >
                  <svg className="w-4 h-4 text-rose-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                  </svg>
                </button>
              </div>
            </div>

            {moment.description && (
              <p className="text-warm-gray/70 text-sm mt-2 leading-relaxed">{moment.description}</p>
            )}

            {/* Photos thumbnail strip */}
            {moment.photos.length > 0 && (
              <div className="mt-3">
                <button
                  onClick={() => setShowPhotos(!showPhotos)}
                  className="flex items-center gap-2 text-xs text-rose-400 hover:text-rose-500 cursor-pointer"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909" />
                  </svg>
                  {moment.photos.length} photo{moment.photos.length !== 1 ? "s" : ""}
                </button>
                {showPhotos && (
                  <div className="flex flex-wrap gap-2 mt-2 animate-fade-in-up">
                    {moment.photos.map((photo) => (
                      <div key={photo.id} className="relative group/photo">
                        <img
                          src={photo.filePath}
                          alt={photo.caption || ""}
                          className="w-20 h-20 object-cover rounded-lg shadow-sm"
                        />
                        <button
                          onClick={() => handleDeletePhoto(photo.id)}
                          className="absolute -top-1 -right-1 w-5 h-5 bg-rose-500 text-white rounded-full text-xs flex items-center justify-center opacity-0 group-hover/photo:opacity-100 cursor-pointer"
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

          {/* Expand/collapse for tree */}
          {hasChildren && !compact && (
            <button
              onClick={() => setExpanded(!expanded)}
              className="p-1.5 hover:bg-rose-50 rounded-lg shrink-0 cursor-pointer"
            >
              <svg
                className={`w-4 h-4 text-warm-gray/50 transition-transform ${expanded ? "rotate-90" : ""}`}
                fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Children */}
      {hasChildren && expanded && !compact && (
        <div className="mt-2 space-y-2">
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
