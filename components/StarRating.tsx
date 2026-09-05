export default function StarRating({ avg, count, label }: { avg: number; count: number; label?: string }) {
  const rounded = Math.round(avg);

  return (
    <div className="flex items-center gap-1.5 text-sm">
      {label && <span className="text-[var(--text-4)]">{label}</span>}
      <span className="text-[var(--gold-fill)]">
        {"★".repeat(rounded)}
        <span className="text-[var(--border)]">{"★".repeat(5 - rounded)}</span>
      </span>
      <span className="text-[var(--text-4)] text-xs">
        {count > 0 ? `${avg.toFixed(1)} (${count})` : "No ratings yet"}
      </span>
    </div>
  );
}
