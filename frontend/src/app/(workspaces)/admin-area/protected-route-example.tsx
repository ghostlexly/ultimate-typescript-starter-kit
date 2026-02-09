import { type ReactNode } from 'react';
import { wolfios } from '@/lib/wolfios/wolfios';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { CenteredLoadingSpinner } from '@/components/ui/centered-loading-spinner';
import { QueryErrorBoundary } from '@/components/ui/query-error-boundary';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

function ProtectedRouteExample({ children }: { children: ReactNode }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Protected Route Example</CardTitle>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}

function ProtectedRouteExampleContent() {
  const protectedRoute = useQuery({
    queryKey: ['demos', 'protected-route'],
    queryFn: () => wolfios.get('/api/demos/protected-route').then((res) => res.data),
  });

  const handleProtectedRoute = async () => {
    await wolfios.get('/api/demos/protected-route').then((res) => {
      console.log(res.data);
      console.log('A protected route has been successfully accessed.');
    });
  };

  if (protectedRoute.isLoading) {
    return <CenteredLoadingSpinner />;
  }

  if (protectedRoute.isError) {
    return <QueryErrorBoundary message={protectedRoute.error.message} />;
  }

  return (
    <div className="space-y-4">
      <div>
        <div>Protected route data using tanstack&apos;s react-query:</div>
        <div>{JSON.stringify(protectedRoute.data)}</div>
      </div>

      <Button onClick={handleProtectedRoute}>Test Protected Route</Button>
    </div>
  );
}

export { ProtectedRouteExample, ProtectedRouteExampleContent };
