export const CATEGORIES = [
  "GPU",
  "CPU",
  "Motherboard",
  "RAM",
  "Storage",
  "PSU",
  "Case",
  "Cooling",
  "Whole PC",
  "Peripherals",
] as const;

export const CATEGORY_CODE: Record<string, string> = {
  GPU: "GPU",
  CPU: "CPU",
  Motherboard: "MOBO",
  RAM: "RAM",
  Storage: "STO",
  PSU: "PSU",
  Case: "CASE",
  Cooling: "FAN",
  "Whole PC": "PC",
  Peripherals: "PER",
};
