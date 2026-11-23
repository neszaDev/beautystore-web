import { adm } from "@/features/admin/data";
import { asList } from "@/features/admin/lib";
import { CategoryManager } from "@/features/admin/category-manager";
import { PageHeader } from "@/features/admin/shared";
import type { AdminCategory } from "@/features/admin/types";

export default async function Page() {
  return (<><PageHeader title="Categories" /><CategoryManager items={asList(await adm<AdminCategory[]>("/categories"))} /></>);
}
