import { prisma } from "@/lib/prisma";
import GalleryView from "@/components/gallery/GalleryView";

export default async function GalleryPage() {
  const photos = await prisma.photo.findMany({
    include: {
      moment: {
        select: { id: true, title: true, category: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  const categories = await prisma.moment.findMany({
    where: { category: { not: null } },
    select: { category: true },
    distinct: ["category"],
  });

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div>
        <h1 className="text-3xl font-[family-name:var(--font-heading)] font-bold text-warm-gray">
          Gallery
        </h1>
        <p className="text-warm-gray/60 mt-1">All our photos in one place</p>
      </div>
      <GalleryView
        photos={photos}
        categories={categories.map((c) => c.category!).filter(Boolean)}
      />
    </div>
  );
}
