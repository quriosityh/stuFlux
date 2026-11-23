import { setupWorker } from 'msw';
import handlers from './handlers';

export const worker = setupWorker(...handlers);

export const startWorker = async () => {
  if (typeof window === 'undefined') return;
  await worker.start({ onUnhandledRequest: 'bypass' });
  console.info('[MSW] Mock Service Worker started');
};

export default worker;
