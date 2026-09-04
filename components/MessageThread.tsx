"use client";

import { useEffect, useRef, useState } from "react";

type Message = {
  id: string;
  body: string;
  senderId: string;
  createdAt: string;
  sender: { name: string | null };
};

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
    <div className="flex-1 flex flex-col border border-[#3A362F] rounded-xl bg-[#211F1B] overflow-hidden">
      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-2 min-h-[300px] max-h-[60vh]">
        {messages.length === 0 ? (
          <p className="text-sm text-[#736C5F] m-auto">Say hello.</p>
        ) : (
          messages.map((m) => {
            const mine = m.senderId === currentUserId;
            return (
              <div
                key={m.id}
                className={`max-w-[75%] px-3 py-2 rounded-lg text-sm ${
                  mine ? "self-end bg-[#DD8A3E] text-[#1B1305]" : "self-start bg-[#171512] text-[#F0EBE1]"
                }`}
              >
                {m.body}
              </div>
            );
          })
        )}
        <div ref={bottomRef} />
      </div>
      <div className="border-t border-[#2B2822] p-3 flex gap-2">
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && send()}
          placeholder="Type a message..."
          className="flex-1 bg-[#171512] border border-[#3A362F] rounded-md px-3 py-2 text-sm outline-none focus:border-[#DD8A3E] transition-colors"
        />
        <button
          onClick={send}
          disabled={sending || !draft.trim()}
          className="bg-[#DD8A3E] text-[#1B1305] font-semibold px-4 py-2 rounded-md text-sm hover:bg-[#E9974F] transition-colors disabled:opacity-60"
        >
          Send
        </button>
      </div>
    </div>
  );
}
