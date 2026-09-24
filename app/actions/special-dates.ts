"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function createSpecialDate(formData: FormData) {
  const label = formData.get("label") as string;
  const dateStr = formData.get("date") as string;
  const type = formData.get("type") as string;
  const recurring = formData.get("recurring") === "true";
  const notes = formData.get("notes") as string | null;

  if (!label || !dateStr || !type) {
    return { error: "Label, date, and type are required" };
  }

  await prisma.specialDate.create({
    data: {
      label,
      date: new Date(dateStr),
      type,
      recurring,
      notes: notes || null,
    },
  });

  revalidatePath("/special-dates");
  revalidatePath("/");
  return { success: true };
}

export async function updateSpecialDate(id: string, formData: FormData) {
  const label = formData.get("label") as string;
  const dateStr = formData.get("date") as string;
  const type = formData.get("type") as string;
  const recurring = formData.get("recurring") === "true";
  const notes = formData.get("notes") as string | null;

  if (!label || !dateStr || !type) {
    return { error: "Label, date, and type are required" };
  }

  await prisma.specialDate.update({
    where: { id },
    data: {
      label,
      date: new Date(dateStr),
      type,
      recurring,
      notes: notes || null,
    },
  });

  revalidatePath("/special-dates");
  revalidatePath("/");
  return { success: true };
}

export async function deleteSpecialDate(id: string) {
  await prisma.specialDate.delete({ where: { id } });
  revalidatePath("/special-dates");
  revalidatePath("/");
  return { success: true };
}
