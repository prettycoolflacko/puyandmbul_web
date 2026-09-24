"use server";

import { createSession, deleteSession, verifyPassword } from "@/lib/auth";
import { redirect } from "next/navigation";

export async function login(
  _prevState: { error?: string } | undefined,
  formData: FormData
) {
  const password = formData.get("password") as string;

  if (!password) {
    return { error: "Please enter a password" };
  }

  const valid = await verifyPassword(password);
  if (!valid) {
    return { error: "Incorrect password" };
  }

  await createSession();
  redirect("/");
}

export async function logout() {
  await deleteSession();
  redirect("/login");
}
