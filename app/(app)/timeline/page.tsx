import { prisma } from "@/lib/prisma";
import TimelineView from "@/components/timeline/TimelineView";
import WindowCard from "@/components/WindowCard";

export default async function TimelinePage() {
  const moments = await prisma.moment.findMany({
    include: {
      photos: true,
      children: {
        include: {
          photos: true,
          children: { include: { photos: true } },
        },
        orderBy: { date: "desc" },
      },
    },
    where: { parentId: null },
    orderBy: { date: "desc" },
  });

  const allMoments = await prisma.moment.findMany({
    select: { id: true, title: true },
    orderBy: { date: "desc" },
  });

  return (
    <div className="animate-fade-in-up" style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {/* Page header */}
      <div style={{ marginBottom: 4 }}>
        <h1
          className="gradient-heading"
          style={{ fontFamily: "var(--font-pixel)", fontSize: 10, lineHeight: 2.4 }}
        >
          ✦ our timeline
        </h1>
        <p style={{ fontFamily: "var(--font-vt323)", fontSize: 20, color: "#3b2a6b", marginTop: 4 }}>
          every moment we&apos;ve shared together
        </p>
      </div>

      <WindowCard title="Timeline — tree of moments" icon="🌳">
        <TimelineView moments={moments} allMoments={allMoments} />
      </WindowCard>
    </div>
  );
}
