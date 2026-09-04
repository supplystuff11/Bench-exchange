export const BRANDS_BY_CATEGORY: Record<string, string[]> = {
  GPU: ["Nvidia", "AMD", "ASUS", "MSI", "Gigabyte", "EVGA", "ASRock", "Sapphire", "XFX", "Zotac", "PNY", "PowerColor"],
  CPU: ["Intel", "AMD"],
  Motherboard: ["ASUS", "MSI", "Gigabyte", "ASRock", "EVGA"],
  RAM: ["Corsair", "Kingston", "Crucial", "G.Skill", "Samsung", "TeamGroup"],
  Storage: ["Samsung", "Western Digital", "Seagate", "Crucial", "Kingston", "SanDisk"],
  PSU: ["Corsair", "EVGA", "Seasonic", "be quiet!", "Cooler Master", "MSI"],
  Case: ["NZXT", "Corsair", "Cooler Master", "be quiet!", "Fractal Design", "Lian Li"],
  Cooling: ["Corsair", "NZXT", "Cooler Master", "be quiet!", "Noctua", "Arctic"],
  "Whole PC": ["Custom build", "Dell", "HP", "Lenovo", "Alienware"],
  Peripherals: ["Logitech", "Razer", "SteelSeries", "Corsair", "HyperX"],
};

// Returns the relevant brand list for a category. Falls back to every
// brand (deduped) when no specific category is selected.
export function brandsForCategory(category?: string): string[] {
  if (category && category !== "All" && BRANDS_BY_CATEGORY[category]) {
    return [...BRANDS_BY_CATEGORY[category], "Other"];
  }
  const all = new Set<string>();
  Object.values(BRANDS_BY_CATEGORY).forEach((list) => list.forEach((b) => all.add(b)));
  all.add("Other");
  return Array.from(all).sort();
}
