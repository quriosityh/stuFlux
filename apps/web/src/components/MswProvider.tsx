"use client";
import { useEffect } from 'react';

export function MswProvider() {
  useEffect(() => {
    // only start MSW in development
    if (process.env.NODE_ENV !== 'development') return;

    // dynamically import the browser worker so server-side build doesn't need `msw`
    import('@/mocks/browser')
      .then(({ startWorker }) => startWorker())
      .catch(err => console.error('MSW failed to start', err));
  }, []);

  return null;
}

export default MswProvider;
