import { Message } from './types';

export function SystemMessage({ message }: { message: Message }) {
  // A helper to pick emoji/style based on subtype
  let emoji = 'ℹ️';
  let title = 'System Message';
  
  if (message.systemSubtype === 'booking_requested') {
    emoji = '📋';
    title = 'Booking request submitted';
  } else if (message.systemSubtype === 'booking_confirmed') {
    emoji = '✅';
    title = 'Booking confirmed';
  } else if (message.systemSubtype === 'booking_declined') {
    emoji = '❌';
    title = 'Booking declined';
  } else if (message.systemSubtype === 'rental_started') {
    emoji = '🔑';
    title = 'Rental period started';
  } else if (message.systemSubtype === 'rental_completed') {
    emoji = '🏁';
    title = 'Rental completed';
  }

  return (
    <div className="flex justify-center my-6">
      <div className="chrome-card !opacity-70 !shadow-none rounded-2xl px-5 py-3 flex flex-col items-center text-center max-w-[85%] border-[var(--border-color)] border-opacity-50">
        <div className="text-base mb-1">{emoji}</div>
        <div className="text-xs font-bold mb-1">{title}</div>
        <div className="text-[11px] opacity-70 whitespace-pre-wrap leading-relaxed">
          {message.body}
        </div>
      </div>
    </div>
  );
}
