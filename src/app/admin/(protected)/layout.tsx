import Link from "next/link";
import { redirect } from "next/navigation";
import type { ReactNode } from "react";
import { adminLogout } from "@/features/admin/actions";
import { getCurrentUser } from "@/lib/session";

const NAV = [
  ["/admin", "Dashboard"], ["/admin/orders", "Orders"], ["/admin/products", "Products"], ["/admin/categories", "Categories"],
  ["/admin/inventory", "Inventory"], ["/admin/promotions", "Promotions"], ["/admin/shipping", "Shipping"], ["/admin/customers", "Customers"],
] as const;

export default async function ProtectedLayout({ children }: { children: ReactNode }) {
  const user = await getCurrentUser();
  if (user?.role !== "ADMIN") redirect("/admin/login"); // UX only: the API enforces roles
  return (
    <div className="md:flex">
      <aside className="border-b border-line bg-white md:min-h-dvh md:w-56 md:shrink-0 md:border-r md:border-b-0">
        <nav aria-label="Admin" className="flex flex-wrap gap-1 p-3 md:flex-col">
          <p className="hidden px-2 pb-2 font-display text-lg md:block">Admin</p>
          {NAV.map(([href, label]) => (
            <Link key={href} href={href} className="rounded-md px-2 py-1.5 text-sm font-semibold hover:bg-cream">{label}</Link>
          ))}
          <form action={adminLogout} className="md:mt-4">
            <p className="hidden px-2 text-xs text-ink-soft md:block">{user.email}</p>
            <button className="rounded-md px-2 py-1.5 text-sm font-semibold underline hover:bg-cream">Sign out</button>
          </form>
        </nav>
      </aside>
      <main id="main" className="min-w-0 flex-1 p-4 md:p-6">{children}</main>
    </div>
  );
}
