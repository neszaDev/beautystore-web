import { adm } from "@/features/admin/data";
import { asList } from "@/features/admin/lib";
import { PromotionManager } from "@/features/admin/promotion-manager";
import { PageHeader } from "@/features/admin/shared";
import type { Promotion } from "@/features/admin/types";

export default async function Page() {
  return (<><PageHeader title="Promotions" /><PromotionManager items={asList(await adm<Promotion[]>("/promotions"))} /></>);
}
