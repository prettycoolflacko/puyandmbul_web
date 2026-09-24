import { prisma } from "@/lib/prisma";
import Link from "next/link";

async function getStats() {
  const [momentCount, photoCount, specialDateCount, activeLetter] = await Promise.all([
    prisma.moment.count(),
    prisma.photo.count(),
    prisma.specialDate.count(),
    prisma.letter.findFirst({ where: { isActive: true } }),
  ]);

  // Get upcoming special dates
  const specialDates = await prisma.specialDate.findMany({
    orderBy: { date: "asc" },
    take: 3,
  });

  // Get recent moments
  const recentMoments = await prisma.moment.findMany({
    orderBy: { date: "desc" },
    take: 5,
    include: { photos: { take: 1 } },
  });

  return { momentCount, photoCount, specialDateCount, activeLetter, specialDates, recentMoments };
}

function getNextOccurrence(date: Date): Date {
  const now = new Date();
  const next = new Date(now.getFullYear(), date.getMonth(), date.getDate());
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

export default async function HomePage() {
  const { momentCount, photoCount, specialDateCount, activeLetter, specialDates, recentMoments } = await getStats();

  const upcomingDates = specialDates
    .map((sd) => ({
      ...sd,
      nextOccurrence: sd.recurring ? getNextOccurrence(sd.date) : sd.date,
    }))
    .map((sd) => ({
      ...sd,
      daysUntil: daysUntil(sd.nextOccurrence),
    }))
    .filter((sd) => sd.daysUntil >= 0)
    .sort((a, b) => a.daysUntil - b.daysUntil)
    .slice(0, 3);

  return (
    <div className="space-y-8 animate-fade-in-up">
      {/* Hero greeting */}
      <div className="text-center lg:text-left">
        <h1 className="text-4xl lg:text-5xl font-[family-name:var(--font-heading)] font-bold text-warm-gray mb-2">
          Welcome back ♡
        </h1>
        <p className="text-warm-gray/60 text-lg">
          Here&apos;s a snapshot of our journey together
        </p>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 stagger-children">
        <Link href="/timeline" className="glass rounded-2xl p-5 hover:shadow-lg hover:-translate-y-1 group">
          <div className="text-3xl font-bold text-rose-500 font-[family-name:var(--font-heading)]">
            {momentCount}
          </div>
          <div className="text-sm text-warm-gray/60 mt-1 group-hover:text-warm-gray">Moments</div>
        </Link>
        <Link href="/gallery" className="glass rounded-2xl p-5 hover:shadow-lg hover:-translate-y-1 group">
          <div className="text-3xl font-bold text-gold font-[family-name:var(--font-heading)]">
            {photoCount}
          </div>
          <div className="text-sm text-warm-gray/60 mt-1 group-hover:text-warm-gray">Photos</div>
        </Link>
        <Link href="/special-dates" className="glass rounded-2xl p-5 hover:shadow-lg hover:-translate-y-1 group">
          <div className="text-3xl font-bold text-rose-400 font-[family-name:var(--font-heading)]">
            {specialDateCount}
          </div>
          <div className="text-sm text-warm-gray/60 mt-1 group-hover:text-warm-gray">Special Dates</div>
        </Link>
        <Link href="/letter" className="glass rounded-2xl p-5 hover:shadow-lg hover:-translate-y-1 group">
          <div className="text-3xl font-bold text-burgundy font-[family-name:var(--font-heading)]">
            {activeLetter ? "💌" : "—"}
          </div>
          <div className="text-sm text-warm-gray/60 mt-1 group-hover:text-warm-gray">
            {activeLetter ? "Letter waiting" : "No letter yet"}
          </div>
        </Link>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Upcoming dates */}
        <div className="glass rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-[family-name:var(--font-heading)] font-bold text-warm-gray">
              Upcoming Dates
            </h2>
            <Link href="/special-dates" className="text-sm text-rose-400 hover:text-rose-500">
              View all →
            </Link>
          </div>
          {upcomingDates.length === 0 ? (
            <div className="text-center py-8 text-warm-gray/40">
              <p className="text-4xl mb-2">📅</p>
              <p>No special dates yet</p>
              <Link href="/special-dates" className="text-rose-400 text-sm hover:text-rose-500 mt-1 inline-block">
                Add your first date →
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {upcomingDates.map((sd) => (
                <div key={sd.id} className="flex items-center gap-4 p-3 rounded-xl bg-white/40 hover:bg-white/60">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-rose-100 to-rose-200 flex items-center justify-center text-lg">
                    {sd.type === "birthday" ? "🎂" : sd.type === "anniversary" ? "💍" : sd.type === "holiday" ? "🎉" : "💕"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-warm-gray truncate">{sd.label}</p>
                    <p className="text-xs text-warm-gray/50">
                      {sd.nextOccurrence.toLocaleDateString("en-US", { month: "long", day: "numeric" })}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-rose-500">{sd.daysUntil}</p>
                    <p className="text-xs text-warm-gray/50">days</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent moments */}
        <div className="glass rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-[family-name:var(--font-heading)] font-bold text-warm-gray">
              Recent Moments
            </h2>
            <Link href="/timeline" className="text-sm text-rose-400 hover:text-rose-500">
              View all →
            </Link>
          </div>
          {recentMoments.length === 0 ? (
            <div className="text-center py-8 text-warm-gray/40">
              <p className="text-4xl mb-2">✨</p>
              <p>No moments yet</p>
              <Link href="/timeline" className="text-rose-400 text-sm hover:text-rose-500 mt-1 inline-block">
                Create your first moment →
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {recentMoments.map((m) => (
                <Link key={m.id} href={`/timeline`} className="flex items-center gap-4 p-3 rounded-xl bg-white/40 hover:bg-white/60 group">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-gold-light to-gold flex items-center justify-center overflow-hidden">
                    {m.photos[0] ? (
                      <img src={m.photos[0].filePath} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-lg">
                        {m.category === "date" ? "💑" : m.category === "trip" ? "✈️" : m.category === "milestone" ? "🏆" : "📸"}
                      </span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-warm-gray truncate group-hover:text-rose-500">{m.title}</p>
                    <p className="text-xs text-warm-gray/50">
                      {m.date.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
