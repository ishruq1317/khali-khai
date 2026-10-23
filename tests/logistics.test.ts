import { describe, it, expect } from "vitest";
import { optimizeRoute } from "../src/lib/logistics";

describe("Smart Route Optimization & Logistics Feasibility", () => {
  const customerCoords = { lat: 23.7430, lng: 90.3800 }; // Dhanmondi residence

  it("selects SHARED delivery for clustered nearby restaurants with matched prep times", () => {
    const restaurants = [
      {
        id: "r1",
        name: "ধানমণ্ডি বিরিয়ানি হাউস",
        latitude: 23.7461,
        longitude: 90.3752,
        prepTimeMinutes: 15,
      },
      {
        id: "r2",
        name: "চিটাগং মেজবান অ্যান্ড কাবাব",
        latitude: 23.7472,
        longitude: 90.3765,
        prepTimeMinutes: 20,
      },
    ];

    const result = optimizeRoute({
      restaurants,
      customerCoordinates: customerCoords,
      maxClusterRadiusMeters: 600,
    });

    expect(result.routeType).toBe("SHARED");
    expect(result.isFeasibleForSharedDelivery).toBe(true);
    expect(result.selectedSequence.length).toBe(3); // 2 pickups + 1 customer dropoff
    expect(result.selectedSequence[0].type).toBe("PICKUP");
    expect(result.selectedSequence[2].type).toBe("DROPOFF");
    expect(result.freshnessRisk).not.toBe("HIGH");
  });

  it("triggers SPLIT delivery when restaurants exceed the 600m cluster threshold", () => {
    const restaurants = [
      {
        id: "r1",
        name: "ধানমণ্ডি বিরিয়ানি হাউস",
        latitude: 23.7461,
        longitude: 90.3752,
        prepTimeMinutes: 15,
      },
      {
        id: "r5",
        name: "গুলশান ডাইনিং লাউঞ্জ",
        latitude: 23.7925,
        longitude: 90.4078, // ~7km away in Gulshan
        prepTimeMinutes: 20,
      },
    ];

    const result = optimizeRoute({
      restaurants,
      customerCoordinates: customerCoords,
      maxClusterRadiusMeters: 600,
    });

    expect(result.routeType).toBe("SPLIT");
    expect(result.isFeasibleForSharedDelivery).toBe(false);
    expect(result.freshnessRisk).toBe("HIGH");
    expect(result.reason).toContain("দূরত্বের কারণে স্প্লিট ডেলিভারি");
  });

  it("triggers SPLIT delivery when kitchen prep times differ by more than acceptable limit", () => {
    const restaurants = [
      {
        id: "r1",
        name: "দ্রুত স্ন্যাকস কর্নার",
        latitude: 23.7461,
        longitude: 90.3752,
        prepTimeMinutes: 5, // Done in 5 mins
      },
      {
        id: "r2",
        name: "স্লো ওভেন রোস্ট",
        latitude: 23.7470,
        longitude: 90.3760,
        prepTimeMinutes: 35, // Done in 35 mins -> Gap 30 mins!
      },
    ];

    const result = optimizeRoute({
      restaurants,
      customerCoordinates: customerCoords,
      maxAcceptablePrepGapMinutes: 20,
    });

    expect(result.routeType).toBe("SPLIT");
    expect(result.isFeasibleForSharedDelivery).toBe(false);
    expect(result.reason).toContain("রান্নার সময়ের ব্যবধান");
  });

  it("staggers rider dispatch so rider does not arrive prematurely at the kitchen", () => {
    const restaurants = [
      {
        id: "r1",
        name: "রেস্টুরেন্ট এ",
        latitude: 23.7461,
        longitude: 90.3752,
        prepTimeMinutes: 20, // Cooking takes 20 mins
      },
    ];

    const result = optimizeRoute({
      restaurants,
      customerCoordinates: customerCoords,
    });

    // Transit to restaurant is ~5 mins. So rider should delay departure by ~15 mins.
    expect(result.dispatchDelayMinutes).toBeGreaterThanOrEqual(10);
  });
});
