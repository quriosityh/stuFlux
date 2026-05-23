import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { MessagesClient } from '@/components/messaging/MessagesClient';

export const metadata = {
  title: 'Chat | StuFlux',
};

export default async function ChatPage({ params }: { params: { id: string } }) {
  const { userId } = await auth();
  
  if (!userId) {
    redirect(`/auth/sign-in?redirect_url=/messages/${params.id}` as any);
  }

  // On mobile, this will render just the chat view.
  // On desktop, it will render the full layout with this chat selected.
  return <MessagesClient initialConversationId={params.id} />;
}
