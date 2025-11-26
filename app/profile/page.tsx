import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { getCurrentUser } from "@/app/actions";
import ProfileForm from "./ProfileForm";

export const dynamic = "force-dynamic";

export default async function ProfilePage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <div className="max-w-2xl mx-auto w-full">
      <Card>
        <CardHeader>
          <CardTitle className="text-xl font-bold">プロフィール</CardTitle>
        </CardHeader>
        <CardContent>
          <ProfileForm initialName={user.name ?? ""} initialRole={user.role} />
        </CardContent>
      </Card>
    </div>
  );
}
