import { prisma } from "@/lib/prisma";
import GalleryView from "@/components/gallery/GalleryView";
import WindowCard from "@/components/WindowCard";

export default async function GalleryPage() {
  const photos = await prisma.photo.findMany({
    include: {
      moment: { select: { id: true, title: true, category: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  const categories = await prisma.moment.findMany({
    where: { category: { not: null } },
    select: { category: true },
    distinct: ["category"],
  });

  return (
    <div className="animate-fade-in-up" style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div style={{ marginBottom: 4 }}>
        <h1
          className="gradient-heading"
          style={{ fontFamily: "var(--font-pixel)", fontSize: 10, lineHeight: 2.4 }}
        >
          ✦ gallery
        </h1>
        <p style={{ fontFamily: "var(--font-vt323)", fontSize: 20, color: "#3b2a6b", marginTop: 4 }}>
          all our photos in one place
        </p>
      </div>

      <WindowCard title="Photo Gallery" icon="📷">
        <GalleryView
          photos={photos}
          categories={categories.map((c) => c.category!).filter(Boolean)}
        />
      </WindowCard>
    </div>
  );
}
