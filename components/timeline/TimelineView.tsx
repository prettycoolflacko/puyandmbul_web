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
      <div className="flex flex-wrap items-center gap-3 mb-6">
        <div className="flex bg-white/60 rounded-xl p-1">
          <button
            onClick={() => setViewMode("tree")}
            className={`px-4 py-2 rounded-lg text-sm font-medium cursor-pointer ${
              viewMode === "tree"
                ? "bg-gradient-to-r from-rose-400 to-rose-500 text-white shadow-sm"
                : "text-warm-gray/60 hover:text-warm-gray"
            }`}
          >
            🌳 Tree
          </button>
          <button
            onClick={() => setViewMode("linear")}
            className={`px-4 py-2 rounded-lg text-sm font-medium cursor-pointer ${
              viewMode === "linear"
                ? "bg-gradient-to-r from-rose-400 to-rose-500 text-white shadow-sm"
                : "text-warm-gray/60 hover:text-warm-gray"
            }`}
          >
            📜 Linear
          </button>
        </div>
        <button
          onClick={() => {
            setEditingMoment(null);
            setShowForm(true);
          }}
          className="ml-auto px-5 py-2.5 bg-gradient-to-r from-rose-400 to-rose-500 text-white rounded-xl text-sm font-medium shadow-md hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 cursor-pointer"
        >
          + New Moment
        </button>
      </div>

      {/* Form modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm p-4">
          <div className="glass rounded-2xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl animate-fade-in-up">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-[family-name:var(--font-heading)] font-bold text-warm-gray">
                {editingMoment ? "Edit Moment" : "New Moment"}
              </h2>
              <button onClick={() => setShowForm(false)} className="p-2 hover:bg-rose-50 rounded-lg cursor-pointer">
                <svg className="w-5 h-5 text-warm-gray" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <MomentForm
              moment={editingMoment}
              parentOptions={allMoments}
              onDone={() => {
                setShowForm(false);
                setEditingMoment(null);
              }}
            />
          </div>
        </div>
      )}

      {/* Content */}
      {moments.length === 0 ? (
        <div className="glass rounded-2xl p-12 text-center">
          <p className="text-5xl mb-4">✨</p>
          <h3 className="text-xl font-[family-name:var(--font-heading)] font-bold text-warm-gray mb-2">
            No moments yet
          </h3>
          <p className="text-warm-gray/60 mb-4">
            Start recording your beautiful journey together
          </p>
          <button
            onClick={() => setShowForm(true)}
            className="px-6 py-3 bg-gradient-to-r from-rose-400 to-rose-500 text-white rounded-xl font-medium shadow-md hover:shadow-lg cursor-pointer"
          >
            Create First Moment
          </button>
        </div>
      ) : viewMode === "tree" ? (
        <div className="space-y-4 stagger-children">
          {moments.map((moment) => (
            <MomentCard
              key={moment.id}
              moment={moment}
              onEdit={(m) => {
                setEditingMoment(m);
                setShowForm(true);
              }}
              depth={0}
            />
          ))}
        </div>
      ) : (
        <div className="relative pl-8 space-y-6">
          {/* Timeline line */}
          <div className="absolute left-3 top-2 bottom-2 w-0.5 bg-gradient-to-b from-rose-300 to-rose-100" />
          {allMomentsFlat
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
            .map((moment) => (
              <div key={moment.id} className="relative">
                {/* Timeline dot */}
                <div className="absolute -left-5 top-4 w-3 h-3 bg-rose-400 rounded-full border-2 border-white shadow-sm" />
                <MomentCard
                  moment={moment}
                  onEdit={(m) => {
                    setEditingMoment(m);
                    setShowForm(true);
                  }}
                  depth={0}
                  compact
                />
              </div>
            ))}
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
