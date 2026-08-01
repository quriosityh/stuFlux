import { cn } from '@/lib/utils';
import { Message } from './types';

interface Props {
  message: Message;
  isSentByMe: boolean;
  showAvatar?: boolean;
}

export function ChatBubble({ message, isSentByMe, showAvatar = false }: Props) {
  return (
    <div className={cn("flex flex-col mb-4 w-full", isSentByMe ? "items-end" : "items-start")}>
      <div className="flex max-w-[80%] items-end gap-2">
        {!isSentByMe && showAvatar && (
          <div className="w-6 h-6 rounded-full border border-[var(--border-color)] bg-[var(--surface)] flex items-center justify-center overflow-hidden flex-shrink-0 mb-1">
            <span className="text-[10px]">🧑</span>
          </div>
        )}
        {!isSentByMe && !showAvatar && <div className="w-6 shrink-0" />}

        <div className={cn(
          "px-4 py-2.5 shadow-sm",
          isSentByMe 
            ? "bg-[var(--accent)] bg-opacity-10 border border-[var(--accent)] border-opacity-20 text-[var(--foreground)] rounded-2xl rounded-br-sm" 
            : "bg-[var(--surface)] border border-[var(--border-color)] text-[var(--foreground)] rounded-2xl rounded-bl-sm"
        )}>
          <p className="text-[14px] md:text-[15px] leading-relaxed whitespace-pre-wrap">{message.body}</p>
        </div>
      </div>
      
      <div className={cn(
        "text-[11px] text-[var(--foreground)] opacity-40 mt-1",
        isSentByMe ? "mr-1" : "ml-9"
      )}>
        {message.createdAt}
      </div>
    </div>
  );
}
