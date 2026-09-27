import { prisma } from "@/lib/prisma";
import SpecialDatesView from "@/components/special-dates/SpecialDatesView";
import WindowCard from "@/components/WindowCard";

export default async function SpecialDatesPage() {
  const specialDates = await prisma.specialDate.findMany({
    orderBy: { date: "asc" },
  });

  return (
    <div className="animate-fade-in-up" style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div style={{ marginBottom: 4 }}>
        <h1
          className="gradient-heading"
          style={{ fontFamily: "var(--font-pixel)", fontSize: 10, lineHeight: 2.4 }}
        >
          ✦ milestones
        </h1>
        <p style={{ fontFamily: "var(--font-vt323)", fontSize: 20, color: "#3b2a6b", marginTop: 4 }}>
          counting down to every moment that matters
        </p>
      </div>

      <WindowCard title="Special Dates & Countdowns" icon="💕">
        <SpecialDatesView specialDates={specialDates} />
      </WindowCard>
    </div>
  );
}
