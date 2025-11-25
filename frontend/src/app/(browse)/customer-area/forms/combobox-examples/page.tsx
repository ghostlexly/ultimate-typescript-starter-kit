import { wolfiosServer } from "@/lib/wolfios/wolfios.server";
import { ComboboxForm } from "./combobox-form";

export const dynamic = "force-dynamic";

export default async function ComboboxExamplesPage() {
  const customerInformations = await wolfiosServer
    .get("/api/customer/informations")
    .then((res) => res.data);
  console.log(customerInformations);

  return <ComboboxForm customerInformations={customerInformations} />;
}
