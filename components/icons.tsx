type IconProps = { className?: string };

const base = "w-full h-full";

export function CategoryIcon({ category, className }: { category: string; className?: string }) {
  const props = { className: `${base} ${className ?? ""}`, strokeWidth: 1.6 };
  switch (category) {
    case "GPU":
      return (
        <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round">
          <rect x="2.5" y="7" width="19" height="10" rx="1.5" />
          <circle cx="8" cy="12" r="2.4" />
          <circle cx="14.5" cy="12" r="2.4" />
          <path d="M2.5 10.5h1M2.5 13.5h1" />
          <path d="M18.5 4v3M21 6.5h-2.5" />
        </svg>
      );
    case "CPU":
      return (
        <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round">
          <rect x="6" y="6" width="12" height="12" rx="1" />
          <rect x="9" y="9" width="6" height="6" rx="0.5" />
          <path d="M9 2v3M12 2v3M15 2v3M9 19v3M12 19v3M15 19v3M2 9h3M2 12h3M2 15h3M19 9h3M19 12h3M19 15h3" />
        </svg>
      );
    case "Motherboard":
      return (
        <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round">
          <rect x="3" y="3" width="18" height="18" rx="1.5" />
          <rect x="6" y="6" width="5" height="5" rx="0.5" />
          <path d="M14 6h4M14 9h4M6 14h3v4H6zM13 14h7v2h-7zM13 18h4" />
        </svg>
      );
    case "RAM":
      return (
        <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round">
          <rect x="3" y="5" width="18" height="8" rx="1" />
          <path d="M6 13v3M9 13v3M12 13v3M15 13v3M18 13v3M6 8h2M6 10.5h2" />
        </svg>
      );
    case "Storage":
      return (
        <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round">
          <ellipse cx="12" cy="6" rx="9" ry="3" />
          <path d="M3 6v12c0 1.66 4.03 3 9 3s9-1.34 9-3V6" />
          <path d="M3 12c0 1.66 4.03 3 9 3s9-1.34 9-3" />
        </svg>
      );
    case "PSU":
      return (
        <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
          <rect x="4" y="4" width="16" height="16" rx="1.5" />
          <path d="M13 8l-4 5h3l-1 4 4-5h-3l1-4z" fill="currentColor" stroke="none" />
        </svg>
      );
    case "Case":
      return (
        <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round">
          <rect x="6" y="2" width="12" height="20" rx="1.5" />
          <circle cx="12" cy="6" r="1" fill="currentColor" stroke="none" />
          <path d="M9 10h6M9 13h6M9 16h3" />
        </svg>
      );
    case "Cooling":
      return (
        <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round">
          <circle cx="12" cy="12" r="9" />
          <path d="M12 12c1.5-3 1-6-.5-8 2.8.6 4.6 2.6 5 5.3M12 12c3 1.5 6 1 8-.5-.6 2.8-2.6 4.6-5.3 5M12 12c-1.5 3-1 6 .5 8-2.8-.6-4.6-2.6-5-5.3M12 12c-3-1.5-6-1-8 .5.6-2.8 2.6-4.6 5.3-5" />
          <circle cx="12" cy="12" r="1.4" fill="currentColor" stroke="none" />
        </svg>
      );
    case "Whole PC":
      return (
        <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round">
          <rect x="3" y="4" width="18" height="12" rx="1" />
          <path d="M8 20h8M12 16v4" />
        </svg>
      );
    case "Peripherals":
      return (
        <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round">
          <rect x="2.5" y="6" width="19" height="12" rx="1.5" />
          <path d="M6 10h.01M9 10h.01M12 10h.01M15 10h.01M18 10h.01M7 14h10" />
        </svg>
      );
    default:
      return (
        <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round">
          <rect x="4" y="4" width="16" height="16" rx="1.5" />
        </svg>
      );
  }
}
