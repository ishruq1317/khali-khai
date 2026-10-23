import { PrismaClient } from "@prisma/client";
import { getCustomerLoyaltyStatus, recordCompletedOrderForLoyalty } from "../src/lib/loyalty";
import { calculatePricing } from "../src/lib/pricing";

const prisma = new PrismaClient();

async function runTest() {
  console.log("=== Testing 3-Order Placement & Loyalty Discount Reset ===");

  const customer = await prisma.user.findUnique({
    where: { email: "demo.customer@example.com" },
    include: { customerProfile: { include: { addresses: true } } },
  });

  if (!customer?.customerProfile) {
    throw new Error("Customer profile not found");
  }

  const customerId = customer.customerProfile.id;
  const addressId = customer.customerProfile.addresses[0].id;

  // 1. Initial State (0 Orders)
  console.log("\n--- Checking Initial State ---");
  let status = await getCustomerLoyaltyStatus(customerId);
  console.log(`Initial orders placed: ${status.currentMonthOrdersCount}`);
  console.log(`Threshold target: ${status.thresholdTarget}`);
  console.log(`Remaining needed: ${status.remainingOrdersNeeded}`);
  console.log(`Is first order eligible: ${status.isFirstOrderEligible}`);

  if (!status.isFirstOrderEligible) throw new Error("Expected 1st order to be eligible!");
  if (status.currentMonthOrdersCount !== 0) throw new Error("Expected 0 current orders!");
  if (status.remainingOrdersNeeded !== 15) throw new Error("Expected 15 remaining orders!");

  // Find a restaurant and menu item
  const menuItem = await prisma.menuItem.findFirst({
    include: { restaurant: true },
  });
  if (!menuItem) throw new Error("No menu item found");

  // Helper to simulate checkout
  async function simulateCheckout(orderNum: number) {
    console.log(`\n--- Simulating Order #${orderNum} Checkout ---`);
    const currentStatus = await getCustomerLoyaltyStatus(customerId);

    const pricing = calculatePricing({
      foodSubtotal: menuItem!.price,
      restaurantCount: 1,
      restaurantCoordinates: [{ lat: menuItem!.restaurant.latitude, lng: menuItem!.restaurant.longitude }],
      customerCoordinates: { lat: 23.8480, lng: 90.2600 },
      isFirstOrder: currentStatus.isFirstOrderEligible,
      hasLoyaltyDiscount: currentStatus.isEligibleForDiscountThisMonth,
    });

    console.log(`Calculated pricing for Order #${orderNum}:`);
    console.log(`  Combined delivery fee: ৳${pricing.combinedDeliveryFee}`);
    console.log(`  First-order discount applied: ৳${pricing.firstOrderDiscount}`);
    console.log(`  Grand total: ৳${pricing.grandTotal}`);

    // Create order in DB
    const order = await prisma.parentOrder.create({
      data: {
        orderNumber: `TEST-ORD-${orderNum}-${Date.now()}`,
        customerId,
        deliveryAddressId: addressId,
        status: "CONFIRMED",
        paymentMethod: "BKASH",
        paymentStatus: "PAID",
        foodSubtotal: pricing.foodSubtotal,
        separateDeliveryFee: pricing.separateDeliveryFee,
        combinedDeliveryFee: pricing.combinedDeliveryFee,
        deliverySavings: pricing.deliverySavings,
        firstOrderDiscount: pricing.firstOrderDiscount,
        loyaltyDiscount: pricing.loyaltyDiscount,
        totalAmount: pricing.grandTotal,
      },
    });

    // Record completed/placed order for loyalty
    await recordCompletedOrderForLoyalty(customerId);

    const postStatus = await getCustomerLoyaltyStatus(customerId);
    console.log(`Post-Order #${orderNum} Loyalty Status:`);
    console.log(`  Orders counted this month: ${postStatus.currentMonthOrdersCount}`);
    console.log(`  Orders remaining for 25% reward: ${postStatus.remainingOrdersNeeded}`);
    console.log(`  Is next order eligible for 1st-order discount: ${postStatus.isFirstOrderEligible}`);

    return { pricing, postStatus };
  }

  // ORDER 1
  const res1 = await simulateCheckout(1);
  if (res1.pricing.firstOrderDiscount !== 50) {
    throw new Error(`Order 1 should have received ৳50 discount, got: ${res1.pricing.firstOrderDiscount}`);
  }
  if (res1.postStatus.currentMonthOrdersCount !== 1) {
    throw new Error(`Order count should be 1, got: ${res1.postStatus.currentMonthOrdersCount}`);
  }
  if (res1.postStatus.remainingOrdersNeeded !== 14) {
    throw new Error(`Remaining orders should be 14, got: ${res1.postStatus.remainingOrdersNeeded}`);
  }
  if (res1.postStatus.isFirstOrderEligible !== false) {
    throw new Error(`After order 1, customer should NOT be eligible for first order discount!`);
  }

  // ORDER 2
  const res2 = await simulateCheckout(2);
  if (res2.pricing.firstOrderDiscount !== 0) {
    throw new Error(`Order 2 should have ৳0 discount, got: ${res2.pricing.firstOrderDiscount}`);
  }
  if (res2.postStatus.currentMonthOrdersCount !== 2) {
    throw new Error(`Order count should be 2, got: ${res2.postStatus.currentMonthOrdersCount}`);
  }
  if (res2.postStatus.remainingOrdersNeeded !== 13) {
    throw new Error(`Remaining orders should be 13, got: ${res2.postStatus.remainingOrdersNeeded}`);
  }

  // ORDER 3
  const res3 = await simulateCheckout(3);
  if (res3.pricing.firstOrderDiscount !== 0) {
    throw new Error(`Order 3 should have ৳0 discount, got: ${res3.pricing.firstOrderDiscount}`);
  }
  if (res3.postStatus.currentMonthOrdersCount !== 3) {
    throw new Error(`Order count should be 3, got: ${res3.postStatus.currentMonthOrdersCount}`);
  }
  if (res3.postStatus.remainingOrdersNeeded !== 12) {
    throw new Error(`Remaining orders should be 12, got: ${res3.postStatus.remainingOrdersNeeded}`);
  }

  console.log("\nALL 3 ORDERS TESTED SUCCESSFULLY!");
  console.log("Order 1: ৳50 discount applied. Order count: 1/15, 14 to go.");
  console.log("Order 2: ৳0 discount applied. Order count: 2/15, 13 to go.");
  console.log("Order 3: ৳0 discount applied. Order count: 3/15, 12 to go.");
}

runTest()
  .catch((e) => {
    console.error("Test failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
