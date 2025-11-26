"use client";

import { useState } from "react";
import { useFormStatus } from "react-dom";
import { updateProfile } from "@/app/actions";
import { Button } from "@/components/ui/Button";

const roles = [
  { value: "admin", label: "管理者" },
  { value: "manager", label: "マネージャー" },
  { value: "user", label: "一般" },
];

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" className="w-full" disabled={pending}>
      {pending ? "保存中..." : "保存する"}
    </Button>
  );
}

export default function ProfileForm({ initialName, initialRole }: { initialName: string; initialRole: string }) {
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(formData: FormData) {
    setMessage(null);
    setError(null);

    const result = await updateProfile(formData);
    if (result?.error) {
      setError(result.error);
      return;
    }

    setMessage("プロフィールを更新しました");
  }

  return (
    <form action={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <label htmlFor="name" className="text-sm font-medium leading-none text-gray-700">
          お名前
        </label>
        <input
          id="name"
          name="name"
          type="text"
          defaultValue={initialName}
          required
          className="flex h-10 w-full rounded-md border border-gray-300 bg-transparent px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="role" className="text-sm font-medium leading-none text-gray-700">
          職種
        </label>
        <select
          id="role"
          name="role"
          defaultValue={initialRole}
          className="flex h-10 w-full rounded-md border border-gray-300 bg-transparent px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {roles.map((role) => (
            <option key={role.value} value={role.value}>
              {role.label}
            </option>
          ))}
        </select>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}
      {message && <p className="text-sm text-green-600">{message}</p>}

      <div className="pt-2">
        <SubmitButton />
      </div>
    </form>
  );
}
