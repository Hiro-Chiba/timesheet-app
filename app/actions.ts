"use server";

import { cookies } from "next/headers";
import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import { startOfDay, endOfDay } from "date-fns";

// --- Authentication ---

export async function login(formData: FormData) {
  const email = (formData.get("email") as string | null)?.toLowerCase();
  const password = formData.get("password") as string;

  if (!email || !password) {
    return { error: "メールアドレスとパスワードを入力してください" };
  }

  try {
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (user && (await bcrypt.compare(password, user.password))) {
      // Set session cookie
      (await cookies()).set("auth_token", user.id, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        maxAge: 60 * 60 * 24 * 7, // 1 week
        path: "/",
      });
      redirect("/");
    }
  } catch (error) {
    console.error("Login error:", error);
    // Fallback for demo if DB is not set up or empty
    if (email === "admin@example.com" && password === "password123") {
       (await cookies()).set("auth_token", "demo_user_id", {
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

export async function register(formData: FormData) {
  const name = (formData.get("name") as string | null)?.trim();
  const email = (formData.get("email") as string | null)?.toLowerCase();
  const password = formData.get("password") as string | null;

  if (!name || !email || !password) {
    return { error: "名前、メールアドレス、パスワードを入力してください" };
  }

  if (password.length < 8) {
    return { error: "パスワードは8文字以上にしてください" };
  }

  try {
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return { error: "このメールアドレスは既に登録されています" };
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: "user",
      },
    });

    (await cookies()).set("auth_token", user.id, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
    });

    redirect("/");
  } catch (error) {
    console.error("Register error:", error);
    return { error: "登録に失敗しました。時間をおいて再度お試しください" };
  }
}



export async function getCurrentUser() {
  const token = (await cookies()).get("auth_token")?.value;
  if (!token) return null;

  // Demo fallback
  if (token === "demo_user_id") {
    return { id: "demo_user_id", name: "山田 太郎", email: "admin@example.com", role: "admin" };
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: token },
      select: { id: true, name: true, email: true, role: true },
    });
    return user;
  } catch (error) {
    return null;
  }
}

// --- Demo data helpers ---

type DemoAttendance = {
  date: string;
  startTime: string | null;
  endTime: string | null;
  breakStartTime: string | null;
  breakEndTime: string | null;
  status: "working" | "break" | "left";
};

async function getDemoAttendanceStore() {
  const cookieStore = await cookies();
  const raw = cookieStore.get("demo_attendance")?.value;
  return raw ? (JSON.parse(raw) as Record<string, DemoAttendance>) : {};
}

async function setDemoAttendanceStore(data: Record<string, DemoAttendance>) {
  const cookieStore = await cookies();
  cookieStore.set("demo_attendance", JSON.stringify(data), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24 * 7,
    path: "/",
  });
}

async function updateDemoAttendance(
  date: string,
  update: Partial<DemoAttendance>
) {
  const store = await getDemoAttendanceStore();
  const existing = store[date] ?? {
    date,
    startTime: null,
    endTime: null,
    breakStartTime: null,
    breakEndTime: null,
    status: "left" as const,
  };

  store[date] = { ...existing, ...update } as DemoAttendance;
  await setDemoAttendanceStore(store);
  return store[date];
}

const isDemoUser = (userId: string) => userId === "demo_user_id";

// --- Attendance ---

export async function getTodayAttendance() {
  const user = await getCurrentUser();
  if (!user) return null;

  const today = new Date().toISOString().split('T')[0];

  // Demo fallback
  if (isDemoUser(user.id)) {
    const store = await getDemoAttendanceStore();
    return store[today] ?? null;
  }

  try {
    const attendance = await prisma.attendance.findUnique({
      where: {
        userId_date: {
          userId: user.id,
          date: today,
        },
      },
    });
    return attendance;
  } catch (error) {
    console.error("Error fetching attendance:", error);
    return null;
  }
}

export async function clockIn() {
  const user = await getCurrentUser();
  if (!user) return;

  const now = new Date();
  const today = now.toISOString().split('T')[0];

  if (isDemoUser(user.id)) {
    await updateDemoAttendance(today, {
      startTime: now.toISOString(),
      status: "working",
    });
    return;
  }

  try {
    await prisma.attendance.create({
      data: {
        userId: user.id,
        date: today,
        startTime: now,
        status: "working",
      },
    });
  } catch (error) {
    console.error("Clock in error:", error);
  }
}

export async function clockOut() {
  const user = await getCurrentUser();
  if (!user) return;

  const now = new Date();
  const today = now.toISOString().split('T')[0];

  if (isDemoUser(user.id)) {
    await updateDemoAttendance(today, {
      endTime: now.toISOString(),
      status: "left",
    });
    return;
  }

  try {
    await prisma.attendance.update({
      where: {
        userId_date: {
          userId: user.id,
          date: today,
        },
      },
      data: {
        endTime: now,
        status: "left",
      },
    });
  } catch (error) {
    console.error("Clock out error:", error);
  }
}

export async function startBreak() {
  const user = await getCurrentUser();
  if (!user) return;

  const now = new Date();
  const today = now.toISOString().split('T')[0];

  if (isDemoUser(user.id)) {
    await updateDemoAttendance(today, {
      breakStartTime: now.toISOString(),
      status: "break",
    });
    return;
  }

  try {
    await prisma.attendance.update({
      where: {
        userId_date: {
          userId: user.id,
          date: today,
        },
      },
      data: {
        breakStartTime: now,
        status: "break",
      },
    });
  } catch (error) {
    console.error("Start break error:", error);
  }
}

export async function endBreak() {
  const user = await getCurrentUser();
  if (!user) return;

  const now = new Date();
  const today = now.toISOString().split('T')[0];

  if (isDemoUser(user.id)) {
    await updateDemoAttendance(today, {
      breakEndTime: now.toISOString(),
      status: "working",
    });
    return;
  }

  try {
    await prisma.attendance.update({
      where: {
        userId_date: {
          userId: user.id,
          date: today,
        },
      },
      data: {
        breakEndTime: now,
        status: "working",
      },
    });
  } catch (error) {
    console.error("End break error:", error);
  }
}

export async function getRecentAttendance() {
  const user = await getCurrentUser();
  if (!user) return [];

  if (isDemoUser(user.id)) {
    const store = await getDemoAttendanceStore();
    const records = Object.values(store)
      .sort((a, b) => (a.date < b.date ? 1 : -1))
      .slice(0, 3);
    return records;
  }

  try {
    const records = await prisma.attendance.findMany({
      where: { userId: user.id },
      orderBy: { date: 'desc' },
      take: 3,
    });
    return records;
  } catch (error) {
    console.error("Error fetching recent attendance:", error);
    return [];
  }
}

export async function updateAttendance(
  date: string,
  startTime: string | null,
  endTime: string | null,
  breakStartTime: string | null,
  breakEndTime: string | null
) {
  const user = await getCurrentUser();
  if (!user) return;

  // Demo fallback
  if (isDemoUser(user.id)) {
    const toIso = (timeStr: string | null) => {
      if (!timeStr) return null;
      return new Date(`${date}T${timeStr}`).toISOString();
    };

    await updateDemoAttendance(date, {
      startTime: toIso(startTime),
      endTime: toIso(endTime),
      breakStartTime: toIso(breakStartTime),
      breakEndTime: toIso(breakEndTime),
      status: endTime ? "left" : "working",
    });
    return;
  }

  try {
    // Helper to combine date string and time string into ISO Date
    const toDate = (timeStr: string | null) => {
      if (!timeStr) return null;
      return new Date(`${date}T${timeStr}`);
    };

    await prisma.attendance.upsert({
      where: {
        userId_date: {
          userId: user.id,
          date: date,
        },
      },
      update: {
        startTime: toDate(startTime),
        endTime: toDate(endTime),
        breakStartTime: toDate(breakStartTime),
        breakEndTime: toDate(breakEndTime),
      },
      create: {
        userId: user.id,
        date: date,
        startTime: toDate(startTime),
        endTime: toDate(endTime),
        breakStartTime: toDate(breakStartTime),
        breakEndTime: toDate(breakEndTime),
        status: 'left', // Default to left if manually creating past record
      },
    });
  } catch (error) {
    console.error("Update attendance error:", error);
    throw error;
  }
}

// --- Shifts ---

export async function getShifts(year: number, month: number) {
  const user = await getCurrentUser();
  if (!user) return [];

  // Demo fallback
  if (user.id === "demo_user_id") return [];

  const startDate = new Date(year, month, 1).toISOString().split('T')[0];
  const endDate = new Date(year, month + 1, 0).toISOString().split('T')[0];

  try {
    const shifts = await prisma.shift.findMany({
      where: {
        userId: user.id,
        date: {
          gte: startDate,
          lte: endDate,
        },
      },
    });
    return shifts;
  } catch (error) {
    console.error("Error fetching shifts:", error);
    return [];
  }
}

export async function getAllShifts(year: number, month: number) {
  const user = await getCurrentUser();
  if (!user) return [];
  if (user.id === "demo_user_id") return [];

  const startDate = new Date(year, month, 1).toISOString().split('T')[0];
  const endDate = new Date(year, month + 1, 0).toISOString().split('T')[0];

  try {
    const shifts = await prisma.shift.findMany({
      where: {
        date: {
          gte: startDate,
          lte: endDate,
        },
      },
      include: {
        user: {
          select: { name: true },
        },
      },
    });
    return shifts;
  } catch (error) {
    console.error("Error fetching all shifts:", error);
    return [];
  }
}

export async function addShift(date: string, startTime: string, endTime: string) {
  const user = await getCurrentUser();
  if (!user || user.id === "demo_user_id") return;

  try {
    // Upsert shift for that day
    await prisma.shift.upsert({
      where: {
        userId_date: {
          userId: user.id,
          date: date,
        },
      },
      update: {
        startTime,
        endTime,
      },
      create: {
        userId: user.id,
        date,
        startTime,
        endTime,
      },
    });
  } catch (error) {
    console.error("Add shift error:", error);
  }
}

export async function deleteShift(id: string) {
  const user = await getCurrentUser();
  if (!user || user.id === "demo_user_id") return;

  try {
    await prisma.shift.delete({
      where: { id },
    });
  } catch (error) {
    console.error("Delete shift error:", error);
  }
}

// --- Admin ---

export async function getAllAttendance(year: number, month: number) {
  const user = await getCurrentUser();
  if (!user) return []; // Should verify role here

  // Demo fallback
  if (user.id === "demo_user_id") {
      // Return mock data structure if needed, or just empty
      return [];
  }

  const startDate = new Date(year, month, 1).toISOString().split('T')[0];
  const endDate = new Date(year, month + 1, 0).toISOString().split('T')[0];

  try {
    const users = await prisma.user.findMany({
      include: {
        attendances: {
          where: {
            date: {
              gte: startDate,
              lte: endDate,
            },
          },
        },
      },
    });
    return users;
  } catch (error) {
    console.error("Error fetching all attendance:", error);
    return [];
  }
}
