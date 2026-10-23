import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await requireAuth(["ADMIN"]);

    const totalCustomers = await prisma.customerProfile.count();
    const activeRestaurants = await prisma.restaurant.count({
      where: { isOpen: true },
    });
    const onlineRiders = await prisma.riderProfile.count({
      where: { isOnline: true },
    });

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const ordersToday = await prisma.parentOrder.count({
      where: { createdAt: { gte: todayStart } },
    });

    const allOrders = await prisma.parentOrder.findMany({
      include: {
        subOrders: true,
        deliveryPlans: true,
      },
      orderBy: { createdAt: "desc" },
    });

    const totalParentOrders = allOrders.length;
    const totalSubOrders = allOrders.reduce((sum, o) => sum + o.subOrders.length, 0);
    const multiRestaurantOrders = allOrders.filter((o) => o.subOrders.length > 1).length;
    const singleRestaurantOrders = totalParentOrders - multiRestaurantOrders;

    const sharedDeliveries = allOrders.filter((o) => o.routeType === "SHARED").length;
    const splitDeliveries = allOrders.filter((o) => o.routeType === "SPLIT").length;

    const completedOrders = allOrders.filter((o) => o.status === "DELIVERED").length;
    const cancelledOrders = allOrders.filter((o) => o.status === "CANCELLED").length;

    const totalCustomerSavings = allOrders.reduce(
      (sum, o) => sum + (o.deliverySavings || 0),
      0
    );

    const totalDeliveryFees = allOrders.reduce(
      (sum, o) => sum + (o.combinedDeliveryFee || 0),
      0
    );
    const avgDeliveryFee =
      totalParentOrders > 0 ? Math.round(totalDeliveryFees / totalParentOrders) : 0;

    // Monthly loyalty qualified customers
    const loyaltyQualifiedCount = await prisma.loyaltyProgress.count({
      where: { thresholdMet: true },
    });

    // Recent audit logs
    const auditLogs = await prisma.auditLog.findMany({
      take: 15,
      orderBy: { createdAt: "desc" },
      include: {
        user: { select: { name: true, email: true, role: true } },
      },
    });

    // Platform settings
    const settings = await prisma.platformSetting.findMany();

    return NextResponse.json({
      metrics: {
        totalCustomers,
        activeRestaurants,
        onlineRiders,
        ordersToday,
        totalParentOrders,
        totalSubOrders,
        multiRestaurantOrders,
        singleRestaurantOrders,
        sharedDeliveries,
        splitDeliveries,
        completedOrders,
        cancelledOrders,
        totalCustomerSavings,
        avgDeliveryFee,
        loyaltyQualifiedCount,
      },
      recentOrders: allOrders.slice(0, 10),
      auditLogs,
      settings,
    });
  } catch (error: any) {
    console.error("Admin overview error:", error);
    return NextResponse.json({ error: "অননুমোদিত বা সার্ভার ত্রুটি" }, { status: 403 });
  }
}
