"use client";

import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { login } from "@/app/actions";
import Link from "next/link";
import { useState } from "react";
import { useFormStatus } from "react-dom";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button className="w-full" disabled={pending}>
      {pending ? "ログイン中..." : "ログイン"}
    </Button>
  );
}

export default function LoginPage() {
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(formData: FormData) {
    const result = await login(formData);
    if (result?.error) {
      setError(result.error);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">ログイン</CardTitle>
          <p className="text-center text-sm text-gray-500">
            アカウント情報を入力してください
          </p>
        </CardHeader>
        <CardContent>
          <form action={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                メールアドレス
              </label>
              <input
                id="email"
                name="email"
                type="email"
                placeholder="admin@example.com"
                required
                className="flex h-10 w-full rounded-md border border-gray-300 bg-transparent px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                パスワード
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                className="flex h-10 w-full rounded-md border border-gray-300 bg-transparent px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
              />
            </div>
            
            {error && (
              <div className="text-sm text-red-500 font-medium">
                {error}
              </div>
            )}

            <div className="pt-2">
              <SubmitButton />
            </div>

            <div className="text-center text-xs text-gray-400 mt-4">
              Demo Account: admin@example.com / password123
            </div>

            <div className="text-center text-sm text-gray-500">
              アカウントをお持ちでない方は{" "}
              <Link href="/register" className="text-blue-600 hover:underline">
                新規登録
              </Link>
              から作成してください
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
