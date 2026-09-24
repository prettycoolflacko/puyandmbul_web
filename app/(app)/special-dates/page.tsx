import { prisma } from "@/lib/prisma";
import SpecialDatesView from "@/components/special-dates/SpecialDatesView";

export default async function SpecialDatesPage() {
  const specialDates = await prisma.specialDate.findMany({
    orderBy: { date: "asc" },
  });

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div>
        <h1 className="text-3xl font-[family-name:var(--font-heading)] font-bold text-warm-gray">
          Special Dates
        </h1>
        <p className="text-warm-gray/60 mt-1">Counting down to every moment that matters</p>
      </div>
      <SpecialDatesView specialDates={specialDates} />
    </div>
  );
}
