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
    <form ref={formRef} action={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {/* Title */}
      <div>
        <label htmlFor="moment-title" className="pixel-label">Title *</label>
        <input
          id="moment-title"
          name="title"
          type="text"
          required
          defaultValue={moment?.title || ""}
          placeholder="What happened?"
          className="pixel-input"
        />
      </div>

      {/* Description */}
      <div>
        <label htmlFor="moment-description" className="pixel-label">Description</label>
        <textarea
          id="moment-description"
          name="description"
          rows={3}
          defaultValue={moment?.description || ""}
          placeholder="Tell the story..."
          className="pixel-input"
          style={{ resize: "none" }}
        />
      </div>

      {/* Date + Category */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <div>
          <label htmlFor="moment-date" className="pixel-label">Date *</label>
          <input
            id="moment-date"
            name="date"
            type="date"
            required
            defaultValue={moment ? new Date(moment.date).toISOString().split("T")[0] : ""}
            className="pixel-input"
          />
        </div>
        <div>
          <label htmlFor="moment-category" className="pixel-label">Category</label>
          <select
            id="moment-category"
            name="category"
            defaultValue={moment?.category || ""}
            className="pixel-select"
          >
            <option value="">None</option>
            <option value="date">💑 Date</option>
            <option value="trip">✈️ Trip</option>
            <option value="milestone">🏆 Milestone</option>
            <option value="everyday">📸 Everyday</option>
          </select>
        </div>
      </div>

      {/* Parent */}
      <div>
        <label htmlFor="moment-parent" className="pixel-label">Parent Moment</label>
        <select
          id="moment-parent"
          name="parentId"
          defaultValue={moment?.parentId || ""}
          className="pixel-select"
        >
          <option value="">None (top-level)</option>
          {parentOptions
            .filter((p) => p.id !== moment?.id)
            .map((p) => (
              <option key={p.id} value={p.id}>{p.title}</option>
            ))}
        </select>
      </div>

      {/* Photos */}
      <div>
        <label htmlFor="moment-photos" className="pixel-label">Photos</label>
        <input
          id="moment-photos"
          name="photos"
          type="file"
          accept="image/*"
          multiple
          className="pixel-input"
          style={{
            cursor: "pointer",
          }}
        />
      </div>

      {/* Actions */}
      <div style={{ display: "flex", gap: 10, paddingTop: 4 }}>
        <button
          type="button"
          onClick={onDone}
          className="pixel-btn pixel-btn-cyan"
          style={{ flex: 1 }}
        >
          Cancel
        </button>
        <button
          type="submit"
          className="pixel-btn"
          style={{ flex: 1 }}
        >
          {moment ? "Update" : "Create"} Moment
        </button>
      </div>
    </form>
  );
}
