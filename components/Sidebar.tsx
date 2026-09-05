import Link from "next/link";
import { CATEGORIES } from "@/lib/categories";
import { CategoryIcon } from "@/components/icons";
import { buildQuery } from "@/lib/query";
import { brandsForCategory } from "@/lib/brands";

const CONDITIONS = ["New", "Like new", "Used", "For parts"];

type SP = { [key: string]: string | string[] | undefined };

export function Sidebar({ searchParams }: { searchParams: SP }) {
  const active = (searchParams.category as string) || "All";
  const selectedConditions = ([] as string[]).concat(searchParams.condition ?? []).filter(Boolean);

  const catHref = (c: string) => {
    const qs = buildQuery(searchParams, { category: c === "All" ? undefined : c });
    return qs ? `/browse?${qs}` : "/browse";
  };
  const clearHref = active !== "All" ? `/browse?category=${encodeURIComponent(active)}` : "/browse";

  const itemClass = (isActive: boolean) =>
    `flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
      isActive
        ? "bg-[var(--bg-2)] text-[var(--text-1)]"
        : "text-[var(--text-3)] hover:bg-[var(--bg-3)] hover:text-[var(--text-1)]"
    }`;

  const inputClass =
    "w-full bg-[var(--bg-0)] border border-[var(--border)] rounded-md px-2 py-1.5 text-xs outline-none focus:border-[var(--accent-fill)] transition-colors";

  return (
    <aside className="w-60 shrink-0 border-r border-[var(--bg-2)] px-3 py-6 hidden md:flex md:flex-col gap-6 overflow-y-auto">
      <div>
        <div className="text-[11px] font-semibold uppercase tracking-wide text-[var(--text-4)] px-3 mb-3">
          Categories
        </div>
        <nav className="flex flex-col gap-0.5">
          <Link href={catHref("All")} className={itemClass(active === "All")}>
            <span className="w-4 h-4 shrink-0 text-[var(--accent-fill)]">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" className="w-full h-full">
                <rect x="3.5" y="3.5" width="7" height="7" rx="1" />
                <rect x="13.5" y="3.5" width="7" height="7" rx="1" />
                <rect x="3.5" y="13.5" width="7" height="7" rx="1" />
                <rect x="13.5" y="13.5" width="7" height="7" rx="1" />
              </svg>
            </span>
            All parts
          </Link>
          {CATEGORIES.map((c) => (
            <Link key={c} href={catHref(c)} className={itemClass(active === c)}>
              <span className={`w-4 h-4 shrink-0 ${active === c ? "text-[var(--accent-fill)]" : "text-[var(--text-4)]"}`}>
                <CategoryIcon category={c} />
              </span>
              {c}
            </Link>
          ))}
        </nav>
      </div>

      <div className="border-t border-[var(--bg-2)] pt-5">
        <div className="text-[11px] font-semibold uppercase tracking-wide text-[var(--text-4)] px-3 mb-3">
          Filters
        </div>
        <form method="GET" action="/browse" className="px-3 flex flex-col gap-4">
          {active !== "All" && <input type="hidden" name="category" value={active} />}
          {searchParams.search && (
            <input type="hidden" name="search" value={searchParams.search as string} />
          )}

          <div>
            <label className="text-xs text-[var(--text-3)] mb-1.5 block">Brand</label>
            <select name="brand" defaultValue={(searchParams.brand as string) || ""} className={inputClass}>
              <option value="">All brands</option>
              {brandsForCategory(active).map((b) => (
                <option key={b} value={b}>
                  {b}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs text-[var(--text-3)] mb-1.5 block">Price range</label>
            <div className="flex items-center gap-2">
              <input
                name="minPrice"
                type="number"
                placeholder="Min"
                defaultValue={searchParams.minPrice as string}
                className={inputClass}
              />
              <span className="text-[var(--text-4)] text-xs">–</span>
              <input
                name="maxPrice"
                type="number"
                placeholder="Max"
                defaultValue={searchParams.maxPrice as string}
                className={inputClass}
              />
            </div>
          </div>

          <div>
            <label className="text-xs text-[var(--text-3)] mb-1.5 block">Condition</label>
            <div className="flex flex-col gap-1.5">
              {CONDITIONS.map((c) => (
                <label key={c} className="flex items-center gap-2 text-sm text-[var(--text-2)] cursor-pointer">
                  <input
                    type="checkbox"
                    name="condition"
                    value={c}
                    defaultChecked={selectedConditions.includes(c)}
                    className="accent-[var(--accent-fill)]"
                  />
                  {c}
                </label>
              ))}
            </div>
          </div>

          <button
            type="submit"
            className="bg-[var(--bg-2)] hover:bg-[var(--bg-2-hover)] text-sm font-medium px-3 py-2 rounded-md transition-colors"
          >
            Apply filters
          </button>
          <Link
            href={clearHref}
            className="text-xs text-[var(--text-4)] hover:text-[var(--text-3)] text-center transition-colors"
          >
            Clear filters
          </Link>
        </form>
      </div>
    </aside>
  );
}
