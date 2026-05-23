export function EmptyChat() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-gradient-to-b from-transparent to-[var(--surface)]">
      <div className="w-24 h-24 rounded-full bg-[var(--surface)] border border-[var(--border-color)] flex items-center justify-center mb-6 shadow-xl">
        <span className="text-4xl">💬</span>
      </div>
      <h3 className="font-syne font-bold text-2xl mb-2">Your Messages</h3>
      <p className="text-[var(--foreground)] opacity-60 max-w-sm">
        Select a conversation from the sidebar to view your messages or start a new chat from a listing.
      </p>
    </div>
  );
}

export function EmptyInbox() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
      <div className="w-24 h-24 rounded-full bg-[var(--surface)] border border-[var(--border-color)] flex items-center justify-center mb-6 shadow-xl">
        <span className="text-4xl">📭</span>
      </div>
      <h3 className="font-syne font-bold text-2xl mb-2">No messages yet</h3>
      <p className="text-[var(--foreground)] opacity-60 max-w-sm mb-6">
        When you request to book an item or someone messages you about your listings, they&apos;ll show up here.
      </p>
      <button className="hyper-liquid text-sm py-3 px-6">
        Explore Listings
      </button>
    </div>
  );
}
