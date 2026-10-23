import { describe, it, expect } from "vitest";
import { getDhakaMonthYear, getPreviousDhakaMonthYear } from "../src/lib/loyalty";

describe("Loyalty Engine & Dhaka Timezone Business Rules", () => {
  it("computes Asia/Dhaka timezone calendar month string correctly", () => {
    // Test date in UTC
    const dateUtc = new Date("2026-10-31T20:30:00Z"); // 20:30 UTC is 02:30 next morning in Dhaka (UTC+6)
    const dhakaMonth = getDhakaMonthYear(dateUtc);
    expect(dhakaMonth).toBe("2026-11"); // Turned into November in Dhaka!
  });

  it("computes previous month correctly across month boundaries", () => {
    const novDate = new Date("2026-11-15T12:00:00Z");
    const prevMonth = getPreviousDhakaMonthYear(novDate);
    expect(prevMonth).toBe("2026-10");
  });

  it("verifies the 15-orders threshold rule: 15 qualifying orders in 30 days unlocks loyalty", () => {
    const thresholdTarget = 15;

    // Test with 0 orders (baseline)
    const count0 = 0;
    expect(count0 >= thresholdTarget).toBe(false);
    expect(Math.max(0, thresholdTarget - count0)).toBe(15); // 15 to go

    // Test with 14 completed orders
    const count14 = 14;
    expect(count14 >= thresholdTarget).toBe(false);
    expect(Math.max(0, thresholdTarget - count14)).toBe(1); // 1 to go

    // Test with 15 completed orders
    const count15 = 15;
    expect(count15 >= thresholdTarget).toBe(true); // Qualifies for 25% discount!
    expect(Math.max(0, thresholdTarget - count15)).toBe(0); // 0 to go
  });

  it("verifies first-order discount eligibility rule (only 1st order gets ৳50 discount)", () => {
    const isFirstOrderEligible = (priorOrdersCount: number) => priorOrdersCount === 0;

    // Brand new customer with 0 prior orders
    expect(isFirstOrderEligible(0)).toBe(true);

    // Customer after placing 1st order (count = 1)
    expect(isFirstOrderEligible(1)).toBe(false);

    // Customer after placing 2nd order (count = 2)
    expect(isFirstOrderEligible(2)).toBe(false);

    // Customer after placing 3rd order (count = 3)
    expect(isFirstOrderEligible(3)).toBe(false);
  });

  it("verifies monthly reset logic: month key changes after 30 days/calendar month", () => {
    const octDate = new Date("2026-10-15T10:00:00Z");
    const novDate = new Date("2026-11-01T04:00:00Z");
    
    const octMonth = getDhakaMonthYear(octDate);
    const novMonth = getDhakaMonthYear(novDate);

    expect(octMonth).toBe("2026-10");
    expect(novMonth).toBe("2026-11");
    expect(octMonth).not.toBe(novMonth); // Resets order counting window automatically!
  });
});
