import { wolfiosServer } from '@/lib/wolfios/wolfios.server';
import { Content } from './content';
import { getQueryClient } from '@/lib/query-client';
import { dehydrate, HydrationBoundary } from '@tanstack/react-query';

export default async function Page() {
  const queryClient = getQueryClient();

  await queryClient.prefetchQuery({
    queryKey: ['demos', 'protected-route'],
    queryFn: () =>
      wolfiosServer.get('/api/demos/protected-route').then((res) => res.data),
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <Content />
    </HydrationBoundary>
  );
}
