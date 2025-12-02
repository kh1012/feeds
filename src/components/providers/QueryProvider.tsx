'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState } from 'react';

interface QueryProviderProps {
  children: React.ReactNode;
}

export default function QueryProvider({ children }: QueryProviderProps) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: Infinity, // 데이터가 항상 fresh 상태 유지
            gcTime: Infinity, // 캐시 영구 유지
            refetchOnWindowFocus: false,
            refetchOnMount: false, // 마운트 시 재요청 방지
            refetchOnReconnect: false, // 재연결 시 재요청 방지
          },
        },
      })
  );

  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}

