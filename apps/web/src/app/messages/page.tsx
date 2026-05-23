import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { MessagesClient } from '@/components/messaging/MessagesClient';

export const metadata = {
  title: 'Messages | StuFlux',
};

export default async function MessagesPage() {
  const { userId } = await auth();
  
  if (!userId) {
    redirect('/auth/sign-in?redirect_url=/messages' as any);
  }

  return <MessagesClient />;
}
