import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Link from "next/link";
import { cn } from "@/lib/utils";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Simple Time Tracker",
  description: "Minimalist time tracking application",
};

import { logout } from "./actions/auth";
import { Button } from "@/components/ui/Button";
import { getCurrentUser } from "@/app/actions";

export const dynamic = "force-dynamic";

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const currentUser = await getCurrentUser();
  const isLoggedIn = Boolean(currentUser);
  const displayName = currentUser?.name ?? currentUser?.email ?? "ユーザー";

  return (
    <html lang="ja">
      <body className={cn(inter.className, "bg-slate-50 min-h-screen flex flex-col")}>
        <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
            <div className="flex items-center gap-8">
              <Link href="/" className="text-xl font-bold text-blue-600 tracking-tight">
                TimeTracker
              </Link>
              {isLoggedIn && (
                <nav className="hidden md:flex gap-6">
                  <Link href="/" className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">
                    打刻 (Home)
                  </Link>
                  <Link href="/calendar" className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">
                    シフト (Calendar)
                  </Link>
                  <Link href="/admin" className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">
                    管理 (Admin)
                  </Link>
                  <Link href="/profile" className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">
                    プロフィール
                  </Link>
                </nav>
              )}
            </div>
            <div className="flex items-center gap-4">
              {isLoggedIn ? (
                <>
                  {currentUser && (
                    <div className="text-sm text-gray-500 hidden sm:block">
                      User: <span className="font-medium text-gray-900">{displayName}</span>
                      <span className="ml-2 inline-flex items-center rounded-full border border-gray-200 px-2 py-0.5 text-[11px] text-gray-600 bg-gray-50">
                        {currentUser.role}
                      </span>
                    </div>
                  )}
                  <form action={logout}>
                    <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700 hover:bg-red-50">
                      ログアウト
                    </Button>
                  </form>
                </>
              ) : (
                <Link href="/login">
                  <Button size="sm">ログイン</Button>
                </Link>
              )}
            </div>
          </div>
        </header>
        <main className="flex-1 flex flex-col max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {children}
        </main>
      </body>
    </html>
  );
}
