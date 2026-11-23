import { adm } from "@/features/admin/data";
import { asList } from "@/features/admin/lib";
import { PageHeader } from "@/features/admin/shared";
import { ShippingManager } from "@/features/admin/shipping-manager";
import type { ShippingRow } from "@/features/admin/types";

export default async function Page() {
  return (<><PageHeader title="Shipping methods" /><ShippingManager items={asList(await adm<ShippingRow[]>("/shipping-methods"))} /></>);
}
