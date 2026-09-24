import { prisma } from "@/lib/prisma";
import LetterDisplay from "@/components/letter/LetterDisplay";
import LetterManager from "@/components/letter/LetterManager";

export default async function LetterPage() {
  const activeLetter = await prisma.letter.findFirst({
    where: { isActive: true },
  });

  const allLetters = await prisma.letter.findMany({
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-8 animate-fade-in-up">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-[family-name:var(--font-heading)] font-bold text-warm-gray">
            Love Letter
          </h1>
          <p className="text-warm-gray/60 mt-1">A little surprise, wrapped with love</p>
        </div>
      </div>

      {activeLetter ? (
        <LetterDisplay letter={activeLetter} />
      ) : (
        <div className="glass rounded-2xl p-12 text-center">
          <p className="text-5xl mb-4">💌</p>
          <h3 className="text-xl font-[family-name:var(--font-heading)] font-bold text-warm-gray mb-2">
            No letter yet
          </h3>
          <p className="text-warm-gray/60">
            Create a love letter with a hidden message
          </p>
        </div>
      )}

      <LetterManager letters={allLetters} />
    </div>
  );
}
