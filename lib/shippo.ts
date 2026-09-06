// Thin wrapper around Shippo's REST API for getting a real shipping rate
// between two ZIP codes for a given package size/weight. Docs:
// https://docs.goshippo.com/shippoapi/public-api/#tag/Shipments

const SHIPPO_API_KEY = process.env.SHIPPO_API_KEY;

// Fixed package size presets so sellers pick a size instead of guessing
// exact box dimensions. Values in inches.
export const PACKAGE_SIZES: Record<string, { length: number; width: number; height: number; label: string }> = {
  small: { length: 10, width: 8, height: 4, label: "Small (RAM, small parts)" },
  medium: { length: 14, width: 10, height: 6, label: "Medium (GPU, motherboard)" },
  large: { length: 20, width: 14, height: 10, label: "Large (full build, case)" },
};

export type ShippingRate = {
  cents: number;
  provider: string;
  serviceLevel: string;
};

// Returns the cheapest available rate, or null if Shippo couldn't quote one
// (bad ZIP, no API key configured, etc.) — callers should treat null as
// "shipping isn't available right now for this listing," not throw a 500.
export async function getShippingRate({
  fromZip,
  toZip,
  weightLbs,
  packageSize,
}: {
  fromZip: string;
  toZip: string;
  weightLbs: number;
  packageSize: string;
}): Promise<ShippingRate | null> {
  if (!SHIPPO_API_KEY) return null;
  const dims = PACKAGE_SIZES[packageSize] || PACKAGE_SIZES.medium;

  try {
    const res = await fetch("https://api.goshippo.com/shipments/", {
      method: "POST",
      headers: {
        Authorization: `ShippoToken ${SHIPPO_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        address_from: { zip: fromZip, country: "US" },
        address_to: { zip: toZip, country: "US" },
        parcels: [
          {
            length: String(dims.length),
            width: String(dims.width),
            height: String(dims.height),
            distance_unit: "in",
            weight: String(weightLbs),
            mass_unit: "lb",
          },
        ],
        async: false,
      }),
    });

    if (!res.ok) {
      console.error("Shippo shipment request failed:", await res.text());
      return null;
    }

    const data = await res.json();
    const rates = (data.rates || []) as any[];
    if (rates.length === 0) return null;

    const cheapest = rates.reduce((min, r) => (Number(r.amount) < Number(min.amount) ? r : min));
    return {
      cents: Math.round(Number(cheapest.amount) * 100),
      provider: cheapest.provider,
      serviceLevel: cheapest.servicelevel?.name || "Standard",
    };
  } catch (err) {
    console.error("Shippo request error:", err);
    return null;
  }
}
