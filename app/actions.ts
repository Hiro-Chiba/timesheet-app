"use server";

import { cookies } from "next/headers";
import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";

// Mock user database
const MOCK_USER = {
  email: "admin@example.com",
  // "password123" hashed with salt rounds 10
  passwordHash: "$2a$10$X.vjV.O.X.X.X.X.X.X.X.X.X.X.X.X.X.X.X.X.X.X.X.X.X", // Placeholder, will generate real one
};

// Generate a real hash for "password123" to be safe
// In a real app, this would be in a DB seed
const SALT_ROUNDS = 10;
const REAL_HASH = bcrypt.hashSync("password123", SALT_ROUNDS);

export async function login(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  if (!email || !password) {
    return { error: "メールアドレスとパスワードを入力してください" };
  }

  // Simulate DB lookup
  if (email === "admin@example.com") {
    const isValid = await bcrypt.compare(password, REAL_HASH);
    
    if (isValid) {
      // Set session cookie
      (await cookies()).set("auth_token", "valid_token", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        maxAge: 60 * 60 * 24 * 7, // 1 week
        path: "/",
      });
      redirect("/");
    }
  }

  return { error: "メールアドレスまたはパスワードが間違っています" };
}

export async function logout() {
  (await cookies()).delete("auth_token");
  redirect("/login");
}
