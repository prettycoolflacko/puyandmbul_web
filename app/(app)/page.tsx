import { prisma } from "@/lib/prisma";
import Link from "next/link";
import WindowCard from "@/components/WindowCard";

async function getStats() {
  const [momentCount, photoCount, specialDateCount, activeLetter] = await Promise.all([
    prisma.moment.count(),
    prisma.photo.count(),
    prisma.specialDate.count(),
    prisma.letter.findFirst({ where: { isActive: true } }),
  ]);

  const specialDates = await prisma.specialDate.findMany({
    orderBy: { date: "asc" },
    take: 3,
  });

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
  if (next < now) next.setFullYear(next.getFullYear() + 1);
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
  const { momentCount, photoCount, specialDateCount, activeLetter, specialDates, recentMoments } =
    await getStats();

  const upcomingDates = specialDates
    .map((sd) => ({
      ...sd,
      nextOccurrence: sd.recurring ? getNextOccurrence(sd.date) : sd.date,
    }))
    .map((sd) => ({ ...sd, daysUntil: daysUntil(sd.nextOccurrence) }))
    .filter((sd) => sd.daysUntil >= 0)
    .sort((a, b) => a.daysUntil - b.daysUntil)
    .slice(0, 3);

  const statCards = [
    { href: "/timeline",      value: momentCount,    label: "Moments",      color: "#ff3fa4" },
    { href: "/gallery",       value: photoCount,     label: "Photos",       color: "#4fd8f0" },
    { href: "/special-dates", value: specialDateCount, label: "Milestones", color: "#ff3fa4" },
    {
      href: "/letter",
      value: activeLetter ? "💌" : "—",
      label: activeLetter ? "Letter waiting" : "No letter yet",
      color: "#4fd8f0",
    },
  ];

  return (
    <div className="animate-fade-in-up" style={{ display: "flex", flexDirection: "column", gap: 24 }}>

      {/* ── Hero greeting ─────────────────────────────────── */}
      <div style={{ textAlign: "center", padding: "8px 0" }}>
        <h1
          className="gradient-heading"
          style={{ fontFamily: "var(--font-pixel)", fontSize: 11, lineHeight: 2.4, marginBottom: 8 }}
        >
          welcome back ♡
        </h1>
        <p style={{ fontFamily: "var(--font-vt323)", fontSize: 22, color: "#3b2a6b" }}>
          here&apos;s a snapshot of our journey together
        </p>
      </div>

      {/* ── Stat cards ────────────────────────────────────── */}
      <div
        className="stagger-children"
        style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 16 }}
      >

        {statCards.map((card) => (
          <Link key={card.href} href={card.href}>
            <div
              className="window-card"
              style={{ cursor: "pointer" }}
            >
              <div className="window-card-titlebar">
                <span className="window-card-title">{card.label}</span>
                <div className="window-card-controls">
                  <span className="window-btn">×</span>
                </div>
              </div>
              <div
                className="window-card-body"
                style={{ textAlign: "center", padding: "20px 12px" }}
              >
                <div
                  style={{
                    fontFamily: "var(--font-pixel)",
                    fontSize: typeof card.value === "number" ? 24 : 28,
                    color: card.color,
                    lineHeight: 1.2,
                    textShadow: `0 0 10px ${card.color}80`,
                  }}
                >
                  {card.value}
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* ── Upcoming dates + Recent moments ───────────────── */}
      <div className="grid-two-col" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>

        {/* Upcoming dates */}
        <WindowCard title="Upcoming Dates" icon="📅">
          <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 12 }}>
            <Link href="/special-dates" className="text-cyan" style={{ fontFamily: "var(--font-vt323)", fontSize: 18 }}>
              view all →
            </Link>
          </div>
          {upcomingDates.length === 0 ? (
            <div style={{ textAlign: "center", padding: "24px 0" }}>
              <p style={{ fontSize: 32, marginBottom: 8 }}>📅</p>
              <p style={{ fontFamily: "var(--font-vt323)", fontSize: 18, color: "rgba(255,255,255,0.5)" }}>
                no special dates yet
              </p>
              <Link href="/special-dates" style={{ fontFamily: "var(--font-vt323)", fontSize: 18, color: "#ff3fa4" }}>
                add your first date →
              </Link>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {upcomingDates.map((sd) => (
                <div
                  key={sd.id}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    border: "2px solid rgba(79,216,240,0.3)",
                    padding: "8px 10px",
                    background: "rgba(0,0,0,0.3)",
                  }}
                >
                  <span style={{ fontSize: 20 }}>
                    {sd.type === "birthday" ? "🎂" : sd.type === "anniversary" ? "💍" : sd.type === "holiday" ? "🎉" : "💕"}
                  </span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontFamily: "var(--font-vt323)", fontSize: 18, color: "#fff", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{sd.label}</p>
                    <p style={{ fontFamily: "var(--font-vt323)", fontSize: 16, color: "rgba(255,255,255,0.5)" }}>
                      {sd.nextOccurrence.toLocaleDateString("en-US", { month: "long", day: "numeric" })}
                    </p>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <p style={{ fontFamily: "var(--font-pixel)", fontSize: 12, color: "#ff3fa4" }}>{sd.daysUntil}</p>
                    <p style={{ fontFamily: "var(--font-vt323)", fontSize: 14, color: "rgba(255,255,255,0.4)" }}>days</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </WindowCard>

        {/* Recent moments */}
        <WindowCard title="Recent Moments" icon="✨">
          <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 12 }}>
            <Link href="/timeline" className="text-cyan" style={{ fontFamily: "var(--font-vt323)", fontSize: 18 }}>
              view all →
            </Link>
          </div>
          {recentMoments.length === 0 ? (
            <div style={{ textAlign: "center", padding: "24px 0" }}>
              <p style={{ fontSize: 32, marginBottom: 8 }}>✨</p>
              <p style={{ fontFamily: "var(--font-vt323)", fontSize: 18, color: "rgba(255,255,255,0.5)" }}>
                no moments yet
              </p>
              <Link href="/timeline" style={{ fontFamily: "var(--font-vt323)", fontSize: 18, color: "#ff3fa4" }}>
                create your first moment →
              </Link>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {recentMoments.map((m) => (
                <Link
                  key={m.id}
                  href="/timeline"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    border: "2px solid rgba(255,63,164,0.3)",
                    padding: "8px 10px",
                    background: "rgba(0,0,0,0.3)",
                    textDecoration: "none",
                  }}
                >
                  <div
                    style={{
                      width: 40,
                      height: 40,
                      border: "2px solid #ff3fa4",
                      overflow: "hidden",
                      flexShrink: 0,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 18,
                      background: "#000",
                    }}
                  >
                    {m.photos[0] ? (
                      <img src={m.photos[0].filePath} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    ) : (
                      m.category === "date" ? "💑" : m.category === "trip" ? "✈️" : m.category === "milestone" ? "🏆" : "📸"
                    )}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontFamily: "var(--font-vt323)", fontSize: 18, color: "#fff", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{m.title}</p>
                    <p style={{ fontFamily: "var(--font-vt323)", fontSize: 16, color: "rgba(255,255,255,0.5)" }}>
                      {m.date.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </WindowCard>

      </div>
    </div>
  );
}
