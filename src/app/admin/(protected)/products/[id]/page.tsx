import Link from "next/link";
import { notFound } from "next/navigation";
import { adm } from "@/features/admin/data";
import { asList } from "@/features/admin/lib";
import { MediaPanel } from "@/features/admin/media-panel";
import { ProductEditor } from "@/features/admin/product-form";
import { Badge, PageHeader } from "@/features/admin/shared";
import { LINK } from "@/features/admin/styles";
import type { AdminCategory, AdminProduct } from "@/features/admin/types";

export default async function Page({ params }: PageProps<"/admin/products/[id]">) {
  const { id } = await params;
  if (!/^\d+$/.test(id)) notFound();
  const [product, cats] = await Promise.all([adm<AdminProduct>(`/products/${id}`), adm<AdminCategory[]>("/categories")]);
  return (
    <>
      <PageHeader title={product.translations.en?.name ?? product.translations.th?.name ?? product.slug}>
        <Badge>{product.status}</Badge>{product.isDemo && <Badge>Demo</Badge>}
        <Link className={LINK} href="/admin/products">All products</Link>
      </PageHeader>
      <ProductEditor product={product} categories={asList(cats)} />
      <MediaPanel productId={product.id} media={product.media} />
    </>
  );
}
