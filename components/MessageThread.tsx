"use client";

import { useEffect, useRef, useState } from "react";

type Message = {
  id: string;
  body: string;
  senderId: string;
  createdAt: string;
  sender: { name: string | null };
};

// Loose pattern match for messages that look like they're proposing payment
// outside the platform. Not meant to be airtight (nothing can be) — just a
// speed bump so it's a deliberate choice, not an accidental slip.
const OFF_PLATFORM_PATTERNS = [
  /venmo/i,
  /cash\s?app/i,
  /paypal/i,
  /zelle/i,
  /apple\s?pay/i,
  /wire transfer/i,
  /pay(ing)?\s+(you\s+)?cash/i,
  /cash\s+(only|in person|when)/i,
  /\b\d{3}[-.\s]?\d{3}[-.\s]?\d{4}\b/, // phone number
];

function looksLikeOffPlatformPayment(text: string) {
  return OFF_PLATFORM_PATTERNS.some((p) => p.test(text));
}

export default function MessageThread({
  conversationId,
  currentUserId,
}: {
  conversationId: string;
  currentUserId: string;
}) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  const load = () => {
    fetch(`/api/conversations/${conversationId}/messages`)
      .then((r) => r.json())
      .then((d) => setMessages(Array.isArray(d) ? d : []));
  };

  useEffect(() => {
    load();
    const interval = setInterval(load, 8000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [conversationId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  const send = async () => {
    if (!draft.trim()) return;

    if (looksLikeOffPlatformPayment(draft)) {
      const proceed = window.confirm(
        "This message looks like it's proposing payment outside Voltra (Venmo, cash, a phone number, etc). Purchases made this way aren't protected and go against our Terms of Service.\n\nSend anyway?"
      );
      if (!proceed) return;
    }

    setSending(true);
    const body = draft;
    setDraft("");
    const res = await fetch(`/api/conversations/${conversationId}/messages`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ body }),
    });
    setSending(false);
    if (res.ok) load();
  };

  return (
    <div className="flex-1 flex flex-col border border-[var(--border)] rounded-xl bg-[var(--bg-1)] overflow-hidden">
      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-2 min-h-[300px] max-h-[60vh]">
        {messages.length === 0 ? (
          <p className="text-sm text-[var(--text-4)] m-auto">Say hello.</p>
        ) : (
          messages.map((m) => {
            const mine = m.senderId === currentUserId;
            return (
              <div
                key={m.id}
                className={`max-w-[75%] px-3 py-2 rounded-lg text-sm ${
                  mine ? "self-end bg-[var(--accent-fill)] text-[var(--accent-on)]" : "self-start bg-[var(--bg-0)] text-[var(--text-1)]"
                }`}
              >
                {m.body}
              </div>
            );
          })
        )}
        <div ref={bottomRef} />
      </div>
      <div className="border-t border-[var(--bg-2)] p-3 flex gap-2">
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && send()}
          placeholder="Type a message..."
          className="flex-1 bg-[var(--bg-0)] border border-[var(--border)] rounded-md px-3 py-2 text-sm outline-none focus:border-[var(--accent-fill)] transition-colors"
        />
        <button
          onClick={send}
          disabled={sending || !draft.trim()}
          className="bg-[var(--accent-fill)] text-[var(--accent-on)] font-semibold px-4 py-2 rounded-md text-sm hover:bg-[var(--accent-hover)] transition-colors disabled:opacity-60"
        >
          Send
        </button>
      </div>
    </div>
  );
}
