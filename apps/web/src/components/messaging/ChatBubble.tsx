import { cn } from '@/lib/utils';
import { Message } from './types';

interface Props {
  message: Message;
  isSentByMe: boolean;
  /** Show the sender's name label above the bubble (first in a group). */
  showSenderInfo?: boolean;
  senderName?: string;
  /** True when this is an optimistic message not yet confirmed by the server. */
  isTemp?: boolean;
}

export function ChatBubble({
  message,
  isSentByMe,
  showSenderInfo = false,
  senderName,
  isTemp = false,
}: Props) {
  return (
    <div className={cn('flex flex-col mb-1 w-full', isSentByMe ? 'items-end' : 'items-start')}>
      {/* Sender name — shown above the first bubble in a group from the other person */}
      {showSenderInfo && !isSentByMe && senderName && (
        <span className="text-[11px] font-semibold opacity-50 ml-9 mb-0.5 tracking-wide">
          {senderName}
        </span>
      )}

      <div className="flex max-w-[80%] items-end gap-2">
        {/* Avatar placeholder — only on the first bubble in a group */}
        {!isSentByMe && showSenderInfo && (
          <div className="w-6 h-6 rounded-full border border-[var(--border-color)] bg-[var(--surface)] flex items-center justify-center overflow-hidden flex-shrink-0 mb-1">
            <span className="text-[10px]">🧑</span>
          </div>
        )}
        {/* Spacer to align subsequent bubbles in the same group */}
        {!isSentByMe && !showSenderInfo && <div className="w-6 shrink-0" />}

        <div
          className={cn(
            'px-4 py-2.5 shadow-sm transition-opacity',
            isTemp && 'opacity-60',
            isSentByMe
              ? 'bg-[var(--accent)] bg-opacity-10 border border-[var(--accent)] border-opacity-20 text-[var(--foreground)] rounded-2xl rounded-br-sm'
              : 'bg-[var(--surface)] border border-[var(--border-color)] text-[var(--foreground)] rounded-2xl rounded-bl-sm',
          )}
        >
          <p className="text-[14px] md:text-[15px] leading-relaxed whitespace-pre-wrap">
            {message.body}
          </p>
        </div>
      </div>

      {/* Timestamp + sending indicator */}
      <div
        className={cn(
          'text-[11px] text-[var(--foreground)] opacity-40 mt-0.5 mb-2',
          isSentByMe ? 'mr-1 text-right' : 'ml-9',
        )}
      >
        {isTemp ? (
          <span className="italic">Sending…</span>
        ) : (
          message.createdAt
        )}
      </div>
    </div>
  );
}
