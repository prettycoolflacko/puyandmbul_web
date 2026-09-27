import { prisma } from "@/lib/prisma";
import LetterDisplay from "@/components/letter/LetterDisplay";
import LetterManager from "@/components/letter/LetterManager";
import WindowCard from "@/components/WindowCard";

export default async function LetterPage() {
  const activeLetter = await prisma.letter.findFirst({
    where: { isActive: true },
  });

  const allLetters = await prisma.letter.findMany({
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="animate-fade-in-up" style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <div style={{ marginBottom: 4 }}>
        <h1
          className="gradient-heading"
          style={{ fontFamily: "var(--font-pixel)", fontSize: 10, lineHeight: 2.4 }}
        >
          ✦ love letter
        </h1>
        <p style={{ fontFamily: "var(--font-vt323)", fontSize: 20, color: "#3b2a6b", marginTop: 4 }}>
          a little surprise, wrapped with love
        </p>
      </div>

      <WindowCard title="Letter — open with care ♡" icon="💌">
        {activeLetter ? (
          <LetterDisplay letter={activeLetter} />
        ) : (
          <div style={{ textAlign: "center", padding: "40px 0" }}>
            <p style={{ fontSize: 48, marginBottom: 12 }}>💌</p>
            <p
              style={{
                fontFamily: "var(--font-pixel)",
                fontSize: 9,
                color: "#ff3fa4",
                lineHeight: 2,
                marginBottom: 8,
              }}
            >
              no letter yet
            </p>
            <p style={{ fontFamily: "var(--font-vt323)", fontSize: 20, color: "rgba(255,255,255,0.6)" }}>
              create a love letter with a hidden message
            </p>
          </div>
        )}
      </WindowCard>

      <LetterManager letters={allLetters} />
    </div>
  );
}
