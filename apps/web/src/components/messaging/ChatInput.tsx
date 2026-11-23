import { useState, useRef, useEffect } from 'react';
import { SendHorizontal } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Props {
  onSendMessage: (text: string) => void;
  isSending?: boolean;
}

export function ChatInput({ onSendMessage, isSending = false }: Props) {
  const [text, setText] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  }, [text]);

  const handleSend = () => {
    if (text.trim() && !isSending) {
      onSendMessage(text.trim());
      setText('');
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
        textareaRef.current.focus();
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="pb-4 pt-2.5 px-4 bg-[var(--background)] border-t border-[var(--border-color)] border-opacity-10 relative z-20 shrink-0">
      <div className="flex items-end gap-2 chrome-card rounded-2xl p-1.5 transition-all focus-within:ring-2 focus-within:ring-white/20 focus-within:shadow-[0_0_20px_rgba(255,255,255,0.3),_0_0_40px_rgba(100,200,255,0.2),_0_0_60px_rgba(255,100,200,0.1)]">
        <textarea
          ref={textareaRef}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type a message..."
          className="flex-1 bg-transparent border-none px-3 py-2 text-sm focus:ring-0 focus:outline-none resize-none max-h-[120px] scrollbar-hide text-[var(--foreground)] placeholder:text-[var(--foreground)] placeholder:opacity-40"
          rows={1}
        />
        <button
          onMouseDown={(e) => {
            // Prevent the button from shifting focus away from the textarea
            e.preventDefault();
          }}
          onClick={handleSend}
          disabled={!text.trim() || isSending}
          className={cn(
            "w-9 h-9 rounded-xl flex-shrink-0 transition-all flex items-center justify-center",
            text.trim() && !isSending
              ? "bg-[var(--accent)] text-black shadow-sm hover:scale-105 active:scale-95" 
              : "opacity-30 cursor-not-allowed bg-[var(--surface)] text-[var(--foreground)]"
          )}
        >
          {isSending ? (
            <div className="w-4 h-4 rounded-full border-2 border-black border-t-transparent animate-spin" />
          ) : (
            <SendHorizontal size={16} className={text.trim() ? "text-black ml-0.5" : "text-[var(--foreground)]"} />
          )}
        </button>
      </div>
    </div>
  );
}
