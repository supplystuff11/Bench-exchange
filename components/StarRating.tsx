export default function StarRating({ avg, count, label }: { avg: number; count: number; label?: string }) {
  const rounded = Math.round(avg);

  return (
    <div className="flex items-center gap-1.5 text-sm">
      {label && <span className="text-[#736C5F]">{label}</span>}
      <span className="text-[#DD8A3E]">
        {"★".repeat(rounded)}
        <span className="text-[#3A362F]">{"★".repeat(5 - rounded)}</span>
      </span>
      <span className="text-[#736C5F] text-xs">
        {count > 0 ? `${avg.toFixed(1)} (${count})` : "No ratings yet"}
      </span>
    </div>
  );
}
