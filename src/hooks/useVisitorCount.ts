import { useEffect, useState } from 'react';

const VISITOR_STORAGE_KEY = 'feeds:visited';

type VisitorResponse = {
  count: number;
};

export function useVisitorCount() {
  const [count, setCount] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const trackVisitor = async () => {
      try {
        const hasVisited = localStorage.getItem(VISITOR_STORAGE_KEY);

        if (!hasVisited) {
          // 첫 방문: POST 전에 먼저 localStorage 설정 (StrictMode 중복 방지)
          localStorage.setItem(VISITOR_STORAGE_KEY, 'true');
          const res = await fetch('/api/visitors', { method: 'POST' });
          const data: VisitorResponse = await res.json();
          setCount(data.count);
        } else {
          // 재방문: 조회만
          const res = await fetch('/api/visitors');
          const data: VisitorResponse = await res.json();
          setCount(data.count);
        }
      } catch (error) {
        console.error('Failed to track visitor:', error);
        setCount(0);
      } finally {
        setIsLoading(false);
      }
    };

    trackVisitor();
  }, []);

  return { count, isLoading };
}
