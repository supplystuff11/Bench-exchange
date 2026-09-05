"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useSession } from "next-auth/react";

type Notification = {
  id: string;
  title: string;
  body: string | null;
  link: string | null;
  createdAt: string;
};

export function NotificationBell() {
  const { status } = useSession();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (status !== "authenticated") return;
    const load = () => {
      fetch("/api/notifications")
        .then((r) => r.json())
        .then((d) => {
          setNotifications(d.notifications || []);
          setUnreadCount(d.unreadCount || 0);
        })
        .catch(() => {});
    };
    load();
    const interval = setInterval(load, 30000);
    return () => clearInterval(interval);
  }, [status]);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  if (status !== "authenticated") return null;

  const openBell = async () => {
    setOpen((o) => !o);
    if (!open && unreadCount > 0) {
      await fetch("/api/notifications", { method: "PATCH" });
      setUnreadCount(0);
    }
  };

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={openBell}
        aria-label="Notifications"
        className="relative text-sm text-[var(--text-3)] hover:text-[var(--text-1)] transition-colors"
      >
        🔔
        {unreadCount > 0 && (
          <span className="absolute -top-1.5 -right-2 bg-[var(--danger-text)] text-white text-[10px] rounded-full w-4 h-4 flex items-center justify-center">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>
      {open && (
        <div className="absolute right-0 mt-2 w-80 bg-[var(--bg-1)] border border-[var(--border)] rounded-xl shadow-lg max-h-96 overflow-y-auto z-50">
          {notifications.length === 0 ? (
            <p className="p-4 text-sm text-[var(--text-4)]">No notifications yet.</p>
          ) : (
            notifications.map((n) => (
              <Link
                key={n.id}
                href={n.link || "#"}
                className="block p-3 border-b border-[var(--bg-2)] last:border-0 hover:bg-[var(--bg-0)] transition-colors"
                onClick={() => setOpen(false)}
              >
                <div className="text-sm font-medium">{n.title}</div>
                {n.body && <div className="text-xs text-[var(--text-4)] mt-1">{n.body}</div>}
              </Link>
            ))
          )}
        </div>
      )}
    </div>
  );
}
