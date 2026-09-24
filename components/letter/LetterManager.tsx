"use client";

import { useState } from "react";
import { createLetter, deleteLetter } from "@/app/actions/letters";

import type { Letter } from "@/lib/types";

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
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-[family-name:var(--font-heading)] font-bold text-warm-gray">
          Manage Letters
        </h2>
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-5 py-2.5 bg-gradient-to-r from-rose-400 to-rose-500 text-white rounded-xl text-sm font-medium shadow-md hover:shadow-lg hover:-translate-y-0.5 cursor-pointer"
        >
          + New Letter
        </button>
      </div>

      {/* Create form */}
      {showForm && (
        <div className="glass rounded-2xl p-6 mb-6 animate-fade-in-up">
          <h3 className="text-lg font-semibold text-warm-gray mb-4">Create New Letter</h3>
          <p className="text-xs text-warm-gray/50 mb-4">Creating a new letter will make it the active one displayed above.</p>
          <form action={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="letter-heading" className="block text-sm font-medium text-warm-gray mb-1">Heading *</label>
              <input id="letter-heading" name="heading" required placeholder='e.g. "Happy Birthday, my love"' className="w-full px-4 py-3 bg-white/60 border border-rose-200 rounded-xl text-warm-gray placeholder:text-warm-gray/30 focus:outline-none focus:ring-2 focus:ring-rose-300" />
            </div>
            <div>
              <label htmlFor="letter-subheading" className="block text-sm font-medium text-warm-gray mb-1">Subheading</label>
              <input id="letter-subheading" name="subheading" placeholder='e.g. "a little world, made for you"' className="w-full px-4 py-3 bg-white/60 border border-rose-200 rounded-xl text-warm-gray placeholder:text-warm-gray/30 focus:outline-none focus:ring-2 focus:ring-rose-300" />
            </div>
            <div>
              <label htmlFor="letter-message" className="block text-sm font-medium text-warm-gray mb-1">Hidden Message *</label>
              <textarea id="letter-message" name="message" required rows={4} placeholder="The message revealed when the envelope is opened..." className="w-full px-4 py-3 bg-white/60 border border-rose-200 rounded-xl text-warm-gray placeholder:text-warm-gray/30 focus:outline-none focus:ring-2 focus:ring-rose-300 resize-none" />
            </div>
            <div>
              <label htmlFor="letter-gif" className="block text-sm font-medium text-warm-gray mb-1">GIF / Image</label>
              <input id="letter-gif" name="gif" type="file" accept="image/*" className="w-full px-4 py-3 bg-white/60 border border-rose-200 rounded-xl text-warm-gray file:mr-4 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-sm file:bg-rose-100 file:text-rose-500 file:cursor-pointer focus:outline-none focus:ring-2 focus:ring-rose-300" />
            </div>
            <div className="flex gap-3 pt-2">
              <button type="button" onClick={() => setShowForm(false)} className="flex-1 py-3 border border-rose-200 text-warm-gray rounded-xl font-medium hover:bg-rose-50 cursor-pointer">Cancel</button>
              <button type="submit" className="flex-1 py-3 bg-gradient-to-r from-rose-400 to-rose-500 text-white rounded-xl font-medium shadow-md hover:shadow-lg cursor-pointer">Create Letter</button>
            </div>
          </form>
        </div>
      )}

      {/* Letter history */}
      {letters.length > 0 && (
        <div className="space-y-2">
          {letters.map((letter) => (
            <div key={letter.id} className="glass rounded-xl p-4 flex items-center justify-between group">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h4 className="font-medium text-warm-gray truncate">{letter.heading}</h4>
                  {letter.isActive && (
                    <span className="shrink-0 px-2 py-0.5 bg-green-100 text-green-600 rounded-full text-[10px] uppercase tracking-wider font-medium">
                      Active
                    </span>
                  )}
                </div>
                <p className="text-xs text-warm-gray/50 mt-0.5">
                  Created {new Date(letter.createdAt).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })}
                </p>
              </div>
              <button
                onClick={() => handleDelete(letter.id)}
                className="p-2 hover:bg-rose-50 rounded-lg opacity-0 group-hover:opacity-100 cursor-pointer"
                title="Delete"
              >
                <svg className="w-4 h-4 text-rose-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                </svg>
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
