import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/session";
import { AdminLoginForm } from "@/features/admin/login-form";

export const metadata = { title: "Admin sign in", robots: { index: false } };

export default async function Page() {
  const u = await getCurrentUser();
  if (u?.role === "ADMIN") redirect("/admin");
  return (
    <main className="mx-auto grid min-h-dvh max-w-sm content-center gap-4 p-4">
      <h1 className="text-2xl">Admin sign in</h1>
      {u && <p role="status" className="text-sm text-ink-soft">You are signed in as a customer. Sign in with an admin account to continue.</p>}
      <AdminLoginForm />
    </main>
  );
}
