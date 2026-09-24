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
  if (next < now) {
    next.setFullYear(next.getFullYear() + 1);
  }
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

const typeColors: Record<string, string> = {
  birthday: "from-pink-400 to-rose-400",
  anniversary: "from-red-400 to-rose-500",
  holiday: "from-amber-400 to-orange-400",
  custom: "from-purple-400 to-pink-400",
};

export default function SpecialDatesView({ specialDates }: { specialDates: SpecialDate[] }) {
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<SpecialDate | null>(null);

  const enriched = specialDates
    .map((sd) => ({
      ...sd,
      nextOccurrence: sd.recurring ? getNextOccurrence(sd.date) : new Date(sd.date),
    }))
    .map((sd) => ({
      ...sd,
      daysUntil: daysUntil(sd.nextOccurrence),
    }))
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
      <div className="flex justify-end mb-6">
        <button
          onClick={() => {
            setEditing(null);
            setShowForm(true);
          }}
          className="px-5 py-2.5 bg-gradient-to-r from-rose-400 to-rose-500 text-white rounded-xl text-sm font-medium shadow-md hover:shadow-lg hover:-translate-y-0.5 cursor-pointer"
        >
          + Add Date
        </button>
      </div>

      {/* Form modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm p-4">
          <div className="glass rounded-2xl p-6 w-full max-w-md shadow-2xl animate-fade-in-up">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-[family-name:var(--font-heading)] font-bold text-warm-gray">
                {editing ? "Edit Date" : "New Special Date"}
              </h2>
              <button onClick={() => { setShowForm(false); setEditing(null); }} className="p-2 hover:bg-rose-50 rounded-lg cursor-pointer">
                <svg className="w-5 h-5 text-warm-gray" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form action={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="sd-label" className="block text-sm font-medium text-warm-gray mb-1">Label *</label>
                <input id="sd-label" name="label" required defaultValue={editing?.label || ""} placeholder="e.g. Her Birthday" className="w-full px-4 py-3 bg-white/60 border border-rose-200 rounded-xl text-warm-gray placeholder:text-warm-gray/30 focus:outline-none focus:ring-2 focus:ring-rose-300" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="sd-date" className="block text-sm font-medium text-warm-gray mb-1">Date *</label>
                  <input id="sd-date" name="date" type="date" required defaultValue={editing ? new Date(editing.date).toISOString().split("T")[0] : ""} className="w-full px-4 py-3 bg-white/60 border border-rose-200 rounded-xl text-warm-gray focus:outline-none focus:ring-2 focus:ring-rose-300" />
                </div>
                <div>
                  <label htmlFor="sd-type" className="block text-sm font-medium text-warm-gray mb-1">Type *</label>
                  <select id="sd-type" name="type" required defaultValue={editing?.type || ""} className="w-full px-4 py-3 bg-white/60 border border-rose-200 rounded-xl text-warm-gray focus:outline-none focus:ring-2 focus:ring-rose-300">
                    <option value="">Select...</option>
                    <option value="birthday">🎂 Birthday</option>
                    <option value="anniversary">💍 Anniversary</option>
                    <option value="holiday">🎉 Holiday</option>
                    <option value="custom">💕 Custom</option>
                  </select>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <input id="sd-recurring" name="recurring" type="checkbox" value="true" defaultChecked={editing?.recurring ?? true} className="w-4 h-4 text-rose-400 rounded focus:ring-rose-300" />
                <label htmlFor="sd-recurring" className="text-sm text-warm-gray">Recurring every year</label>
              </div>
              <div>
                <label htmlFor="sd-notes" className="block text-sm font-medium text-warm-gray mb-1">Notes</label>
                <textarea id="sd-notes" name="notes" rows={2} defaultValue={editing?.notes || ""} placeholder="Any notes..." className="w-full px-4 py-3 bg-white/60 border border-rose-200 rounded-xl text-warm-gray placeholder:text-warm-gray/30 focus:outline-none focus:ring-2 focus:ring-rose-300 resize-none" />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => { setShowForm(false); setEditing(null); }} className="flex-1 py-3 border border-rose-200 text-warm-gray rounded-xl font-medium hover:bg-rose-50 cursor-pointer">Cancel</button>
                <button type="submit" className="flex-1 py-3 bg-gradient-to-r from-rose-400 to-rose-500 text-white rounded-xl font-medium shadow-md hover:shadow-lg cursor-pointer">
                  {editing ? "Update" : "Add"} Date
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Cards grid */}
      {enriched.length === 0 ? (
        <div className="glass rounded-2xl p-12 text-center">
          <p className="text-5xl mb-4">📅</p>
          <h3 className="text-xl font-[family-name:var(--font-heading)] font-bold text-warm-gray mb-2">
            No special dates yet
          </h3>
          <p className="text-warm-gray/60 mb-4">
            Add birthdays, anniversaries, and other dates you want to remember
          </p>
          <button onClick={() => setShowForm(true)} className="px-6 py-3 bg-gradient-to-r from-rose-400 to-rose-500 text-white rounded-xl font-medium shadow-md hover:shadow-lg cursor-pointer">
            Add First Date
          </button>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 stagger-children">
          {enriched.map((sd) => (
            <div key={sd.id} className="glass rounded-2xl p-5 hover:shadow-lg group relative overflow-hidden">
              {/* Background gradient */}
              <div className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl ${typeColors[sd.type] || "from-rose-400 to-pink-400"} opacity-10 rounded-bl-[60px]`} />

              <div className="relative">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${typeColors[sd.type] || "from-rose-400 to-pink-400"} flex items-center justify-center text-xl shadow-sm`}>
                      {typeEmojis[sd.type] || "💕"}
                    </div>
                    <div>
                      <h3 className="font-semibold text-warm-gray">{sd.label}</h3>
                      <p className="text-xs text-warm-gray/50 capitalize">{sd.type}{sd.recurring ? " • recurring" : ""}</p>
                    </div>
                  </div>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100">
                    <button onClick={() => { setEditing(sd); setShowForm(true); }} className="p-1.5 hover:bg-rose-50 rounded-lg cursor-pointer" title="Edit">
                      <svg className="w-3.5 h-3.5 text-warm-gray/50" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Z" />
                      </svg>
                    </button>
                    <button onClick={() => handleDelete(sd.id)} className="p-1.5 hover:bg-rose-50 rounded-lg cursor-pointer" title="Delete">
                      <svg className="w-3.5 h-3.5 text-rose-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                      </svg>
                    </button>
                  </div>
                </div>

                {/* Countdown */}
                <div className="mt-4 text-center py-4 bg-white/40 rounded-xl">
                  {sd.daysUntil === 0 ? (
                    <div>
                      <p className="text-3xl font-bold text-rose-500 font-[family-name:var(--font-heading)] animate-pulse-soft">
                        Today! 🎉
                      </p>
                    </div>
                  ) : sd.daysUntil === 1 ? (
                    <div>
                      <p className="text-3xl font-bold text-rose-500 font-[family-name:var(--font-heading)]">
                        Tomorrow!
                      </p>
                    </div>
                  ) : (
                    <div>
                      <p className="text-4xl font-bold text-rose-500 font-[family-name:var(--font-heading)]">
                        {sd.daysUntil}
                      </p>
                      <p className="text-xs text-warm-gray/50 mt-1">days to go</p>
                    </div>
                  )}
                </div>

                <p className="text-xs text-warm-gray/40 text-center mt-2">
                  {sd.nextOccurrence.toLocaleDateString("en-US", {
                    weekday: "long",
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                  })}
                </p>

                {sd.notes && (
                  <p className="text-sm text-warm-gray/60 mt-3 italic">{sd.notes}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
