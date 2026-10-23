import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { calculatePricing } from "@/lib/pricing";
import { optimizeRoute } from "@/lib/logistics";
import { getCustomerLoyaltyStatus, recordCompletedOrderForLoyalty } from "@/lib/loyalty";

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json(
        { error: "অর্ডার করতে অনুগ্রহ করে লগইন করুন (Please sign in to place an order)" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const {
      cartItems,
      deliveryAddressId,
      customAddress,
      paymentMethod = "BKASH",
      notes = "",
    } = body;

    if (!cartItems || !Array.isArray(cartItems) || cartItems.length === 0) {
      return NextResponse.json(
        { error: "কার্ট খালি! কোনো খাবার যোগ করা হয়নি।" },
        { status: 400 }
      );
    }

    // 1. Resolve Customer Profile & Delivery Address
    let customerProfile = await prisma.customerProfile.findUnique({
      where: { userId: session.userId },
      include: { addresses: true },
    });

    if (!customerProfile) {
      customerProfile = await prisma.customerProfile.create({
        data: { userId: session.userId },
        include: { addresses: true },
      });
    }

    let targetAddress = null;
    if (deliveryAddressId) {
      targetAddress = await prisma.address.findUnique({
        where: { id: deliveryAddressId },
      });
    }

    if (!targetAddress) {
      if (customerProfile.addresses.length > 0) {
        targetAddress =
          customerProfile.addresses.find((a) => a.isDefault) ||
          customerProfile.addresses[0];
      } else {
        // Create address from customAddress or default
        targetAddress = await prisma.address.create({
          data: {
            customerId: customerProfile.id,
            label: customAddress?.label || "হোম (Home)",
            fullAddress: customAddress?.fullAddress || "হাউজ ১২, রোড ৫, ধানমণ্ডি, ঢাকা",
            area: customAddress?.area || "Dhanmondi",
            city: "Dhaka",
            latitude: customAddress?.latitude || 23.7430,
            longitude: customAddress?.longitude || 90.3800,
            isDefault: true,
          },
        });
      }
    }

    // 2. Fetch and Revalidate all Menu Items from DB (Security: Prevent client-side price tampering)
    const menuItemIds = cartItems.map((item: any) => item.id);
    const dbMenuItems = await prisma.menuItem.findMany({
      where: { id: { in: menuItemIds } },
      include: {
        restaurant: true,
      },
    });

    if (dbMenuItems.length === 0) {
      return NextResponse.json(
        { error: "নির্বাচিত খাবারগুলো সিস্টেমে পাওয়া যায়নি" },
        { status: 400 }
      );
    }

    // Check availability & build verified item list
    const verifiedItems: Array<{
      menuItem: (typeof dbMenuItems)[0];
      quantity: number;
      instructions: string;
    }> = [];

    for (const cartItem of cartItems) {
      const match = dbMenuItems.find((m) => m.id === cartItem.id);
      if (!match) {
        return NextResponse.json(
          { error: `আইটেম ${cartItem.nameBn || cartItem.nameEn} পাওয়া যায়নি` },
          { status: 400 }
        );
      }
      if (!match.isAvailable) {
        return NextResponse.json(
          { error: `${match.nameBn} বর্তমানে পরিবেশনের জন্য উপলব্ধ নয়` },
          { status: 400 }
        );
      }
      if (!match.restaurant.isOpen || !match.restaurant.acceptsOrders) {
        return NextResponse.json(
          { error: `${match.restaurant.nameBn} বর্তমানে কোনো অর্ডার গ্রহণ করছে না` },
          { status: 400 }
        );
      }
      verifiedItems.push({
        menuItem: match,
        quantity: Math.max(1, cartItem.quantity || 1),
        instructions: cartItem.instructions || "",
      });
    }

    // 3. Group by Restaurant
    const restaurantOrderMap = new Map<
      string,
      {
        restaurant: (typeof dbMenuItems)[0]["restaurant"];
        items: typeof verifiedItems;
        subtotal: number;
      }
    >();

    for (const item of verifiedItems) {
      const rest = item.menuItem.restaurant;
      if (!restaurantOrderMap.has(rest.id)) {
        restaurantOrderMap.set(rest.id, {
          restaurant: rest,
          items: [],
          subtotal: 0,
        });
      }
      const entry = restaurantOrderMap.get(rest.id)!;
      entry.items.push(item);
      entry.subtotal += item.menuItem.price * item.quantity;
    }

    const restaurantEntries = Array.from(restaurantOrderMap.values());

    // 4. Check Customer Loyalty & First-Order Eligibility
    const loyaltyStatus = await getCustomerLoyaltyStatus(customerProfile.id);

    // 5. Calculate Trusted Server-Side Pricing
    const foodSubtotal = restaurantEntries.reduce(
      (acc, curr) => acc + curr.subtotal,
      0
    );

    const restaurantCoords = restaurantEntries.map((r) => ({
      lat: r.restaurant.latitude,
      lng: r.restaurant.longitude,
    }));

    const pricing = calculatePricing({
      foodSubtotal,
      restaurantCount: restaurantEntries.length,
      restaurantCoordinates: restaurantCoords,
      customerCoordinates: {
        lat: targetAddress.latitude,
        lng: targetAddress.longitude,
      },
      isFirstOrder: loyaltyStatus.isFirstOrderEligible,
      hasLoyaltyDiscount: loyaltyStatus.isEligibleForDiscountThisMonth,
    });

    // 6. Logistics & Route Optimization (Shared vs. Split)
    const routeOpt = optimizeRoute({
      restaurants: restaurantEntries.map((r) => ({
        id: r.restaurant.id,
        name: r.restaurant.nameBn,
        latitude: r.restaurant.latitude,
        longitude: r.restaurant.longitude,
        prepTimeMinutes: r.restaurant.avgPrepTimeMinutes,
      })),
      customerCoordinates: {
        lat: targetAddress.latitude,
        lng: targetAddress.longitude,
      },
    });

    // 7. Find an available online rider for assignment
    const onlineRider = await prisma.riderProfile.findFirst({
      where: { isOnline: true },
      include: { user: true },
    });

    // 8. Generate Order Number
    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, "");
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const orderNumber = `KK-${dateStr}-${randomSuffix}`;

    // 9. Execute Atomic Database Transaction
    const createdParentOrder = await prisma.$transaction(async (tx) => {
      // Guard against race conditions: strictly verify if this is the customer's very first non-cancelled order
      const priorOrdersCount = await tx.parentOrder.count({
        where: {
          customerId: customerProfile.id,
          status: { not: "CANCELLED" },
        },
      });

      const effectiveFirstOrderDiscount =
        priorOrdersCount === 0 ? pricing.firstOrderDiscount : 0;
      const effectiveFinalDeliveryFee = Math.max(
        0,
        pricing.combinedDeliveryFee -
          effectiveFirstOrderDiscount -
          pricing.loyaltyDiscount
      );
      const effectiveTotalAmount = pricing.foodSubtotal + effectiveFinalDeliveryFee;
      const effectiveDeliverySavings = Math.max(
        0,
        pricing.separateDeliveryFee - effectiveFinalDeliveryFee
      );

      // Create Parent Order
      const parentOrder = await tx.parentOrder.create({
        data: {
          orderNumber,
          customerId: customerProfile.id,
          deliveryAddressId: targetAddress.id,
          status: "CONFIRMED",
          paymentMethod,
          paymentStatus: "PAID",
          foodSubtotal: pricing.foodSubtotal,
          separateDeliveryFee: pricing.separateDeliveryFee,
          combinedDeliveryFee: pricing.combinedDeliveryFee,
          deliverySavings: effectiveDeliverySavings,
          firstOrderDiscount: effectiveFirstOrderDiscount,
          loyaltyDiscount: pricing.loyaltyDiscount,
          totalAmount: effectiveTotalAmount,
          notes,
          estimatedDeliveryMinutes: routeOpt.estimatedCustomerArrivalMinutes || 35,
          routeType: routeOpt.routeType,
        },
      });

      // Create Restaurant Sub-Orders and Order Items
      for (const entry of restaurantEntries) {
        const subOrder = await tx.restaurantSubOrder.create({
          data: {
            parentOrderId: parentOrder.id,
            restaurantId: entry.restaurant.id,
            status: "PENDING_ACCEPTANCE",
            subtotal: entry.subtotal,
            restaurantPrepTimeMinutes: entry.restaurant.avgPrepTimeMinutes,
          },
        });

        for (const item of entry.items) {
          await tx.orderItem.create({
            data: {
              subOrderId: subOrder.id,
              menuItemId: item.menuItem.id,
              itemNameBn: item.menuItem.nameBn,
              itemNameEn: item.menuItem.nameEn,
              itemPrice: item.menuItem.price,
              quantity: item.quantity,
              totalItemPrice: item.menuItem.price * item.quantity,
              instructions: item.instructions,
            },
          });
        }
      }

      // Create Delivery Plan
      const deliveryPlan = await tx.deliveryPlan.create({
        data: {
          parentOrderId: parentOrder.id,
          planType: routeOpt.routeType,
          totalDistanceKm: pricing.totalDistanceKm,
          estimatedDurationMinutes: routeOpt.estimatedCustomerArrivalMinutes || 30,
          riderPayout: pricing.riderPayout,
          status: onlineRider ? "ASSIGNED" : "PENDING",
        },
      });

      // Create Delivery Stops
      if (routeOpt.selectedSequence && routeOpt.selectedSequence.length > 0) {
        for (const stop of routeOpt.selectedSequence) {
          await tx.deliveryStop.create({
            data: {
              deliveryPlanId: deliveryPlan.id,
              stopSequence: stop.stopSequence,
              stopType: stop.type,
              restaurantId: stop.restaurantId || null,
              addressText: stop.name,
              latitude: stop.coordinates.lat,
              longitude: stop.coordinates.lng,
            },
          });
        }
      }

      // Assign rider if available
      if (onlineRider) {
        await tx.riderAssignment.create({
          data: {
            deliveryPlanId: deliveryPlan.id,
            riderId: onlineRider.id,
            status: "ACCEPTED",
          },
        });
      }

      // Record Payment
      const txnId = `KK-TXN-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
      await tx.payment.create({
        data: {
          parentOrderId: parentOrder.id,
          amount: effectiveTotalAmount,
          method: paymentMethod,
          status: "COMPLETED",
          transactionId: txnId,
          paymentDetails: JSON.stringify({
            provider: paymentMethod,
            payer: session.email,
            processedAt: new Date().toISOString(),
          }),
        },
      });

      // Audit Log
      await tx.auditLog.create({
        data: {
          userId: session.userId,
          action: "ORDER_CREATED",
          resourceType: "ParentOrder",
          resourceId: parentOrder.id,
          details: `Created order ${orderNumber} with ${restaurantEntries.length} restaurants. Total: ৳${effectiveTotalAmount}. Savings: ৳${effectiveDeliverySavings}`,
        },
      });

      return parentOrder;
    });

    // Update customer loyalty counter immediately after successful order placement
    await recordCompletedOrderForLoyalty(customerProfile.id);

    return NextResponse.json({
      success: true,
      orderId: createdParentOrder.id,
      orderNumber: createdParentOrder.orderNumber,
      totalAmount: createdParentOrder.totalAmount,
      deliverySavings: createdParentOrder.deliverySavings,
      routeType: createdParentOrder.routeType,
    });
  } catch (error) {
    console.error("Checkout error:", error);
    return NextResponse.json(
      { error: "অর্ডার সম্পন্ন করতে সমস্যা হয়েছে। অনুগ্রহ করে আবার চেষ্টা করুন।" },
      { status: 500 }
    );
  }
}
