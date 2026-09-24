"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { writeFile, mkdir, unlink } from "fs/promises";
import path from "path";
import { v4 as uuidv4 } from "uuid";

export async function createLetter(formData: FormData) {
  const heading = formData.get("heading") as string;
  const subheading = formData.get("subheading") as string | null;
  const message = formData.get("message") as string;
  const gif = formData.get("gif") as File | null;

  if (!heading || !message) {
    return { error: "Heading and message are required" };
  }

  // Deactivate all existing letters
  await prisma.letter.updateMany({
    where: { isActive: true },
    data: { isActive: false },
  });

  let gifPath: string | null = null;
  if (gif && gif.size > 0) {
    gifPath = await saveGif(gif);
  }

  await prisma.letter.create({
    data: {
      heading,
      subheading: subheading || null,
      message,
      gifPath,
      isActive: true,
    },
  });

  revalidatePath("/letter");
  revalidatePath("/");
  return { success: true };
}

export async function updateLetter(id: string, formData: FormData) {
  const heading = formData.get("heading") as string;
  const subheading = formData.get("subheading") as string | null;
  const message = formData.get("message") as string;
  const gif = formData.get("gif") as File | null;

  if (!heading || !message) {
    return { error: "Heading and message are required" };
  }

  const updateData: Record<string, unknown> = {
    heading,
    subheading: subheading || null,
    message,
  };

  if (gif && gif.size > 0) {
    // Delete old gif if exists
    const existing = await prisma.letter.findUnique({ where: { id } });
    if (existing?.gifPath) {
      try {
        await unlink(path.join(process.cwd(), "public", existing.gifPath));
      } catch {
        // File might not exist
      }
    }
    updateData.gifPath = await saveGif(gif);
  }

  await prisma.letter.update({
    where: { id },
    data: updateData,
  });

  revalidatePath("/letter");
  return { success: true };
}

export async function deleteLetter(id: string) {
  const letter = await prisma.letter.findUnique({ where: { id } });
  if (letter?.gifPath) {
    try {
      await unlink(path.join(process.cwd(), "public", letter.gifPath));
    } catch {
      // File might not exist
    }
  }

  await prisma.letter.delete({ where: { id } });
  revalidatePath("/letter");
  revalidatePath("/");
  return { success: true };
}

async function saveGif(file: File): Promise<string> {
  const allowedTypes = ["image/gif", "image/jpeg", "image/png", "image/webp"];
  if (!allowedTypes.includes(file.type)) {
    throw new Error("Only image files are allowed");
  }
  if (file.size > 10 * 1024 * 1024) {
    throw new Error("File must be under 10MB");
  }

  const ext = file.name.split(".").pop() || "gif";
  const filename = `letter-${uuidv4()}.${ext}`;
  const uploadDir = path.join(process.cwd(), "public", "uploads");
  await mkdir(uploadDir, { recursive: true });

  const buffer = Buffer.from(await file.arrayBuffer());
  await writeFile(path.join(uploadDir, filename), buffer);

  return `/uploads/${filename}`;
}
