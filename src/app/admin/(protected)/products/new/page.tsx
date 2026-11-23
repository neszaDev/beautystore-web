import { adm } from "@/features/admin/data";
import { PageHeader } from "@/features/admin/shared";
import { ProductForm } from "@/features/admin/product-form";
import type { AdminCategory } from "@/features/admin/types";
import { asList } from "@/features/admin/lib";

export default async function Page() {
  const cats = asList(await adm<AdminCategory[]>("/categories"));
  return (<><PageHeader title="New product" /><ProductForm categories={cats} product={null} /></>);
}
