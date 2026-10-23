import { describe, it, expect } from "vitest";
import { calculatePricing, calculateDistanceKm } from "../src/lib/pricing";

describe("Pricing Engine (Separate vs. Combined Delivery)", () => {
  const customerCoords = { lat: 23.7430, lng: 90.3800 }; // Dhanmondi residence

  it("calculates single restaurant baseline delivery fee correctly", () => {
    const restaurantCoords = [{ lat: 23.7461, lng: 90.3752 }]; // ~0.7km
    const result = calculatePricing({
      foodSubtotal: 360,
      restaurantCount: 1,
      restaurantCoordinates: restaurantCoords,
      customerCoordinates: customerCoords,
      baseDeliveryFee: 50,
      perKmRate: 12,
    });

    expect(result.foodSubtotal).toBe(360);
    expect(result.combinedDeliveryFee).toBeGreaterThanOrEqual(50);
    expect(result.separateDeliveryFee).toBe(result.combinedDeliveryFee);
    expect(result.deliverySavings).toBe(0); // 1 restaurant has no multi-pickup savings
    expect(result.grandTotal).toBe(360 + result.totalDeliveryFee);
  });

  it("calculates 3-restaurant multi-order with substantial shared delivery savings", () => {
    // 3 Clustered Restaurants in Dhanmondi
    const restaurantCoords = [
      { lat: 23.7461, lng: 90.3752 }, // Biryani House
      { lat: 23.7472, lng: 90.3765 }, // Mezban & Kebab (~180m away)
      { lat: 23.7455, lng: 90.3745 }, // Crunch Burger (~210m away)
    ];

    const result = calculatePricing({
      foodSubtotal: 770,
      restaurantCount: 3,
      restaurantCoordinates: restaurantCoords,
      customerCoordinates: customerCoords,
      baseDeliveryFee: 50,
      additionalStopFee: 25,
      perKmRate: 12,
    });

    // If ordered separately: 3 independent deliveries to the customer
    expect(result.breakdown.individualRestaurantFees).toHaveLength(3);
    expect(result.separateDeliveryFee).toBeGreaterThan(120);

    // If ordered via Khali Khai smart shared delivery: 1 trip with 2 extra stops
    expect(result.combinedDeliveryFee).toBeLessThan(result.separateDeliveryFee);
    expect(result.deliverySavings).toBeGreaterThanOrEqual(40);

    // Rider receives fair payout for the 3-stop run
    expect(result.riderPayout).toBeGreaterThan(70);
  });

  it("applies first-order promotional discount capped at ৳50", () => {
    const restaurantCoords = [{ lat: 23.7461, lng: 90.3752 }];
    const result = calculatePricing({
      foodSubtotal: 300,
      restaurantCount: 1,
      restaurantCoordinates: restaurantCoords,
      customerCoordinates: customerCoords,
      isFirstOrder: true,
      firstOrderDiscountCap: 50,
    });

    expect(result.firstOrderDiscount).toBe(50);
    expect(result.totalDeliveryFee).toBe(result.combinedDeliveryFee - 50);
  });

  it("applies loyalty 25% discount for qualifying customers", () => {
    const restaurantCoords = [
      { lat: 23.7461, lng: 90.3752 },
      { lat: 23.7472, lng: 90.3765 },
    ];
    const result = calculatePricing({
      foodSubtotal: 600,
      restaurantCount: 2,
      restaurantCoordinates: restaurantCoords,
      customerCoordinates: customerCoords,
      hasLoyaltyDiscount: true,
    });

    expect(result.loyaltyDiscount).toBe(Math.round(result.combinedDeliveryFee * 0.25));
    expect(result.totalDeliveryFee).toBe(
      result.combinedDeliveryFee - result.loyaltyDiscount
    );
  });

  it("never accepts negative fees or irrational calculations", () => {
    const result = calculatePricing({
      foodSubtotal: 100,
      restaurantCount: 1,
      restaurantCoordinates: [{ lat: 23.7430, lng: 90.3800 }],
      customerCoordinates: { lat: 23.7430, lng: 90.3800 },
      isFirstOrder: true,
      firstOrderDiscountCap: 200, // higher than fee
    });

    expect(result.totalDeliveryFee).toBe(0);
    expect(result.grandTotal).toBe(100);
  });
});
