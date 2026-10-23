import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "লগইন প্রয়োজন" }, { status: 401 });
    }

    const customerProfile = await prisma.customerProfile.findUnique({
      where: { userId: session.userId },
    });

    if (!customerProfile) {
      return NextResponse.json({ orders: [] });
    }

    const orders = await prisma.parentOrder.findMany({
      where: { customerId: customerProfile.id },
      include: {
        deliveryAddress: true,
        subOrders: {
          include: {
            restaurant: true,
            items: true,
          },
        },
        deliveryPlans: {
          include: {
            stops: true,
            assignments: {
              include: {
                rider: {
                  include: {
                    user: { select: { name: true, phone: true } },
                  },
                },
              },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ orders });
  } catch (error) {
    console.error("Customer orders API error:", error);
    return NextResponse.json({ error: "অর্ডার লোড করতে সমস্যা হয়েছে" }, { status: 500 });
  }
}
