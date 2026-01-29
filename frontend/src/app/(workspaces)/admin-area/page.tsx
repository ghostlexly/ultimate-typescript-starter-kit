import { wolfiosServer } from '@/lib/wolfios/wolfios.server';
import { Content } from './content';

export default async function Page() {
  await wolfiosServer.get('/api/demos/protected-route').then((res) => {
    console.log(res.data);
    console.log('A protected route has been successfully accessed.');
  });

  return <Content />;
}
