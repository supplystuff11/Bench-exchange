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
        ? "bg-[#2B2822] text-[#F0EBE1]"
        : "text-[#B8B1A3] hover:bg-[#1C1A16] hover:text-[#F0EBE1]"
    }`;

  const inputClass =
    "w-full bg-[#171512] border border-[#3A362F] rounded-md px-2 py-1.5 text-xs outline-none focus:border-[#DD8A3E] transition-colors";

  return (
    <aside className="w-60 shrink-0 border-r border-[#2B2822] px-3 py-6 hidden md:flex md:flex-col gap-6 overflow-y-auto">
      <div>
        <div className="text-[11px] font-semibold uppercase tracking-wide text-[#736C5F] px-3 mb-3">
          Categories
        </div>
        <nav className="flex flex-col gap-0.5">
          <Link href={catHref("All")} className={itemClass(active === "All")}>
            <span className="w-4 h-4 shrink-0 text-[#DD8A3E]">
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
              <span className={`w-4 h-4 shrink-0 ${active === c ? "text-[#DD8A3E]" : "text-[#736C5F]"}`}>
                <CategoryIcon category={c} />
              </span>
              {c}
            </Link>
          ))}
        </nav>
      </div>

      <div className="border-t border-[#2B2822] pt-5">
        <div className="text-[11px] font-semibold uppercase tracking-wide text-[#736C5F] px-3 mb-3">
          Filters
        </div>
        <form method="GET" action="/browse" className="px-3 flex flex-col gap-4">
          {active !== "All" && <input type="hidden" name="category" value={active} />}
          {searchParams.search && (
            <input type="hidden" name="search" value={searchParams.search as string} />
          )}

          <div>
            <label className="text-xs text-[#B8B1A3] mb-1.5 block">Brand</label>
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
            <label className="text-xs text-[#B8B1A3] mb-1.5 block">Price range</label>
            <div className="flex items-center gap-2">
              <input
                name="minPrice"
                type="number"
                placeholder="Min"
                defaultValue={searchParams.minPrice as string}
                className={inputClass}
              />
              <span className="text-[#736C5F] text-xs">–</span>
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
            <label className="text-xs text-[#B8B1A3] mb-1.5 block">Condition</label>
            <div className="flex flex-col gap-1.5">
              {CONDITIONS.map((c) => (
                <label key={c} className="flex items-center gap-2 text-sm text-[#D9D3C7] cursor-pointer">
                  <input
                    type="checkbox"
                    name="condition"
                    value={c}
                    defaultChecked={selectedConditions.includes(c)}
                    className="accent-[#DD8A3E]"
                  />
                  {c}
                </label>
              ))}
            </div>
          </div>

          <button
            type="submit"
            className="bg-[#2B2822] hover:bg-[#332F28] text-sm font-medium px-3 py-2 rounded-md transition-colors"
          >
            Apply filters
          </button>
          <Link
            href={clearHref}
            className="text-xs text-[#736C5F] hover:text-[#B8B1A3] text-center transition-colors"
          >
            Clear filters
          </Link>
        </form>
      </div>
    </aside>
  );
}
