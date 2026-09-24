import { prisma } from "@/lib/prisma";
import TimelineView from "@/components/timeline/TimelineView";

export default async function TimelinePage() {
  const moments = await prisma.moment.findMany({
    include: {
      photos: true,
      children: {
        include: {
          photos: true,
          children: {
            include: { photos: true },
          },
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
    <div className="space-y-6 animate-fade-in-up">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-[family-name:var(--font-heading)] font-bold text-warm-gray">
            Our Timeline
          </h1>
          <p className="text-warm-gray/60 mt-1">Every moment we&apos;ve shared together</p>
        </div>
      </div>
      <TimelineView moments={moments} allMoments={allMoments} />
    </div>
  );
}
