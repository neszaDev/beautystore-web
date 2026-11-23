import Link from "next/link";
import { notFound } from "next/navigation";
import { adm } from "@/features/admin/data";
import { PageHeader, dt } from "@/features/admin/shared";
import { CARD, LINK } from "@/features/admin/styles";
import type { CustomerDetail } from "@/features/admin/types";

export default async function Page({ params }: PageProps<"/admin/customers/[id]">) {
  const { id } = await params;
  if (!/^\d+$/.test(id)) notFound();
  const c = await adm<CustomerDetail>(`/customers/${id}`);
  return (
    <>
      <PageHeader title={c.fullName ?? c.email}><Link className={LINK} href="/admin/customers">All customers</Link></PageHeader>
      <section className={CARD}>
        <dl className="grid grid-cols-[8rem_1fr] gap-y-1 text-sm">
          <dt>Email</dt><dd>{c.email}</dd><dt>Phone</dt><dd>{c.phone ?? "—"}</dd><dt>Joined</dt><dd>{dt(c.createdAt)}</dd>
          <dt>Account</dt><dd>{c.enabled ? "Enabled" : "Disabled"}</dd>
          <dt>Orders</dt><dd>{c.orderCount} · <Link className={LINK} href={`/admin/orders?q=${encodeURIComponent(c.email)}`}>View their orders</Link></dd>
        </dl>
      </section>
      <h2 className="mt-6 mb-2 text-lg">Addresses</h2>
      {c.addresses.length === 0 ? <p className={`${CARD} text-ink-soft`}>No saved addresses.</p> : (
        <ul className="grid gap-3 md:grid-cols-2">{c.addresses.map((a) => (
          <li key={a.id} className={CARD}><address className="text-sm not-italic">{a.recipient} · {a.phone}{a.isDefault ? " (default)" : ""}<br />{a.line1}{a.line2 ? `, ${a.line2}` : ""}<br />{a.subdistrict}, {a.district}, {a.province} {a.postalCode}</address></li>))}
        </ul>)}
    </>
  );
}
