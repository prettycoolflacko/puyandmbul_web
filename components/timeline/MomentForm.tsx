"use client";

import { useRef } from "react";
import { createMoment, updateMoment } from "@/app/actions/moments";

type Moment = {
  id: string;
  title: string;
  description: string | null;
  date: Date;
  category: string | null;
  parentId: string | null;
};

export default function MomentForm({
  moment,
  parentOptions,
  onDone,
}: {
  moment: Moment | null;
  parentOptions: { id: string; title: string }[];
  onDone: () => void;
}) {
  const formRef = useRef<HTMLFormElement>(null);

  async function handleSubmit(formData: FormData) {
    if (moment) {
      await updateMoment(moment.id, formData);
    } else {
      await createMoment(formData);
    }
    onDone();
  }

  return (
    <form ref={formRef} action={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="moment-title" className="block text-sm font-medium text-warm-gray mb-1">Title *</label>
        <input
          id="moment-title"
          name="title"
          type="text"
          required
          defaultValue={moment?.title || ""}
          placeholder="What happened?"
          className="w-full px-4 py-3 bg-white/60 border border-rose-200 rounded-xl text-warm-gray placeholder:text-warm-gray/30 focus:outline-none focus:ring-2 focus:ring-rose-300"
        />
      </div>

      <div>
        <label htmlFor="moment-description" className="block text-sm font-medium text-warm-gray mb-1">Description</label>
        <textarea
          id="moment-description"
          name="description"
          rows={3}
          defaultValue={moment?.description || ""}
          placeholder="Tell the story..."
          className="w-full px-4 py-3 bg-white/60 border border-rose-200 rounded-xl text-warm-gray placeholder:text-warm-gray/30 focus:outline-none focus:ring-2 focus:ring-rose-300 resize-none"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="moment-date" className="block text-sm font-medium text-warm-gray mb-1">Date *</label>
          <input
            id="moment-date"
            name="date"
            type="date"
            required
            defaultValue={moment ? new Date(moment.date).toISOString().split("T")[0] : ""}
            className="w-full px-4 py-3 bg-white/60 border border-rose-200 rounded-xl text-warm-gray focus:outline-none focus:ring-2 focus:ring-rose-300"
          />
        </div>
        <div>
          <label htmlFor="moment-category" className="block text-sm font-medium text-warm-gray mb-1">Category</label>
          <select
            id="moment-category"
            name="category"
            defaultValue={moment?.category || ""}
            className="w-full px-4 py-3 bg-white/60 border border-rose-200 rounded-xl text-warm-gray focus:outline-none focus:ring-2 focus:ring-rose-300"
          >
            <option value="">None</option>
            <option value="date">💑 Date</option>
            <option value="trip">✈️ Trip</option>
            <option value="milestone">🏆 Milestone</option>
            <option value="everyday">📸 Everyday</option>
          </select>
        </div>
      </div>

      <div>
        <label htmlFor="moment-parent" className="block text-sm font-medium text-warm-gray mb-1">Parent Moment</label>
        <select
          id="moment-parent"
          name="parentId"
          defaultValue={moment?.parentId || ""}
          className="w-full px-4 py-3 bg-white/60 border border-rose-200 rounded-xl text-warm-gray focus:outline-none focus:ring-2 focus:ring-rose-300"
        >
          <option value="">None (top-level)</option>
          {parentOptions
            .filter((p) => p.id !== moment?.id)
            .map((p) => (
              <option key={p.id} value={p.id}>{p.title}</option>
            ))}
        </select>
      </div>

      <div>
        <label htmlFor="moment-photos" className="block text-sm font-medium text-warm-gray mb-1">Photos</label>
        <input
          id="moment-photos"
          name="photos"
          type="file"
          accept="image/*"
          multiple
          className="w-full px-4 py-3 bg-white/60 border border-rose-200 rounded-xl text-warm-gray file:mr-4 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-sm file:bg-rose-100 file:text-rose-500 file:cursor-pointer focus:outline-none focus:ring-2 focus:ring-rose-300"
        />
      </div>

      <div className="flex gap-3 pt-2">
        <button
          type="button"
          onClick={onDone}
          className="flex-1 py-3 border border-rose-200 text-warm-gray rounded-xl font-medium hover:bg-rose-50 cursor-pointer"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="flex-1 py-3 bg-gradient-to-r from-rose-400 to-rose-500 text-white rounded-xl font-medium shadow-md hover:shadow-lg cursor-pointer"
        >
          {moment ? "Update" : "Create"} Moment
        </button>
      </div>
    </form>
  );
}
