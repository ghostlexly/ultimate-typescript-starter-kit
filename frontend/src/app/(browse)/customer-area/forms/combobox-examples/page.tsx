import { wolfiosServer } from '@/lib/wolfios/wolfios.server';
import { ComboboxForm } from './combobox-form';

export const dynamic = 'force-dynamic';

export default async function ComboboxExamplesPage() {
  const countries = await wolfiosServer.get('/api/countries').then((res) => res.data);

  const customerInformations = await wolfiosServer
    .get('/api/customer/informations')
    .then((res) => res.data);

  return (
    <ComboboxForm countries={countries} customerInformations={customerInformations} />
  );
}
