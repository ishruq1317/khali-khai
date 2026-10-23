import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { recordCompletedOrderForLoyalty } from "@/lib/loyalty";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireAuth(["RESTAURANT_MANAGER", "ADMIN"]);
    const { id } = await params;
    const body = await request.json();
    const { status, prepTimeMinutes } = body;

    const subOrder = await prisma.restaurantSubOrder.findUnique({
      where: { id },
      include: {
        restaurant: true,
        parentOrder: {
          include: {
            subOrders: true,
          },
        },
      },
    });

    if (!subOrder) {
      return NextResponse.json(
        { error: "সাব-অর্ডার পাওয়া যায়নি" },
        { status: 404 }
      );
    }

    // Security check: Restaurant manager can ONLY manage their own restaurant!
    if (
      session.role === "RESTAURANT_MANAGER" &&
      subOrder.restaurant.managerUserId !== session.userId
    ) {
      return NextResponse.json(
        { error: "আপনি কেবল আপনার নিজস্ব রেস্টুরেন্টের অর্ডার পরিচালনা করতে পারেন।" },
        { status: 403 }
      );
    }

    const updatedSubOrder = await prisma.restaurantSubOrder.update({
      where: { id },
      data: {
        status,
        ...(prepTimeMinutes ? { restaurantPrepTimeMinutes: prepTimeMinutes } : {}),
        ...(status === "READY_FOR_PICKUP" ? { actualReadyTime: new Date() } : {}),
      },
    });

    // Check parent order status
    const allSubOrders = await prisma.restaurantSubOrder.findMany({
      where: { parentOrderId: subOrder.parentOrderId },
    });

    const allReady = allSubOrders.every(
      (s) => s.status === "READY_FOR_PICKUP" || s.status === "PICKED_UP" || s.status === "DELIVERED"
    );
    const anyPreparing = allSubOrders.some((s) => s.status === "PREPARING");
    const anyAccepted = allSubOrders.some((s) => s.status === "ACCEPTED");

    let newParentStatus = subOrder.parentOrder.status;
    if (allReady) {
      newParentStatus = "PREPARING"; // ready for pickup
    } else if (anyPreparing || anyAccepted) {
      newParentStatus = "PREPARING";
    }

    await prisma.parentOrder.update({
      where: { id: subOrder.parentOrderId },
      data: { status: newParentStatus },
    });

    return NextResponse.json({
      success: true,
      subOrder: updatedSubOrder,
      parentStatus: newParentStatus,
    });
  } catch (error: any) {
    console.error("Sub-order update error:", error);
    if (error.message === "UNAUTHORIZED" || error.message === "FORBIDDEN") {
      return NextResponse.json({ error: "অননুমোদিত অ্যাক্সেস" }, { status: 403 });
    }
    return NextResponse.json(
      { error: "স্ট্যাটাস আপডেট করতে সমস্যা হয়েছে" },
      { status: 500 }
    );
  }
}
