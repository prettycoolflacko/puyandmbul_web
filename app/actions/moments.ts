"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { writeFile, mkdir, unlink } from "fs/promises";
import path from "path";
import { v4 as uuidv4 } from "uuid";

export async function createMoment(formData: FormData) {
  const title = formData.get("title") as string;
  const description = formData.get("description") as string | null;
  const dateStr = formData.get("date") as string;
  const category = formData.get("category") as string | null;
  const parentId = formData.get("parentId") as string | null;

  if (!title || !dateStr) {
    return { error: "Title and date are required" };
  }

  const moment = await prisma.moment.create({
    data: {
      title,
      description: description || null,
      date: new Date(dateStr),
      category: category || null,
      parentId: parentId || null,
    },
  });

  // Handle photo uploads
  const photos = formData.getAll("photos") as File[];
  for (const photo of photos) {
    if (photo.size > 0) {
      await savePhoto(photo, moment.id);
    }
  }

  revalidatePath("/timeline");
  revalidatePath("/");
  return { success: true, id: moment.id };
}

export async function updateMoment(id: string, formData: FormData) {
  const title = formData.get("title") as string;
  const description = formData.get("description") as string | null;
  const dateStr = formData.get("date") as string;
  const category = formData.get("category") as string | null;
  const parentId = formData.get("parentId") as string | null;

  if (!title || !dateStr) {
    return { error: "Title and date are required" };
  }

  await prisma.moment.update({
    where: { id },
    data: {
      title,
      description: description || null,
      date: new Date(dateStr),
      category: category || null,
      parentId: parentId || null,
    },
  });

  // Handle new photo uploads
  const photos = formData.getAll("photos") as File[];
  for (const photo of photos) {
    if (photo.size > 0) {
      await savePhoto(photo, id);
    }
  }

  revalidatePath("/timeline");
  revalidatePath("/");
  return { success: true };
}

export async function deleteMoment(id: string) {
  // Get all photos for this moment to delete files
  const photos = await prisma.photo.findMany({ where: { momentId: id } });
  for (const photo of photos) {
    try {
      await unlink(path.join(process.cwd(), "public", photo.filePath));
    } catch {
      // File might not exist
    }
  }

  await prisma.moment.delete({ where: { id } });
  revalidatePath("/timeline");
  revalidatePath("/gallery");
  revalidatePath("/");
  return { success: true };
}

export async function deletePhoto(id: string) {
  const photo = await prisma.photo.findUnique({ where: { id } });
  if (photo) {
    try {
      await unlink(path.join(process.cwd(), "public", photo.filePath));
    } catch {
      // File might not exist
    }
    await prisma.photo.delete({ where: { id } });
  }
  revalidatePath("/timeline");
  revalidatePath("/gallery");
  return { success: true };
}

async function savePhoto(file: File, momentId: string) {
  // Validate file type
  const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
  if (!allowedTypes.includes(file.type)) {
    return { error: "Only image files (JPEG, PNG, WebP, GIF) are allowed" };
  }

  // Validate file size (10MB)
  if (file.size > 10 * 1024 * 1024) {
    return { error: "File size must be under 10MB" };
  }

  const ext = file.name.split(".").pop() || "jpg";
  const filename = `${uuidv4()}.${ext}`;
  const uploadDir = path.join(process.cwd(), "public", "uploads");

  await mkdir(uploadDir, { recursive: true });

  const buffer = Buffer.from(await file.arrayBuffer());
  const filePath = path.join(uploadDir, filename);
  await writeFile(filePath, buffer);

  await prisma.photo.create({
    data: {
      momentId,
      filePath: `/uploads/${filename}`,
      caption: null,
    },
  });

  return { success: true };
}
