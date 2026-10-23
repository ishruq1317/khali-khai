import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ user: null });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.userId },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        customerProfile: {
          include: {
            addresses: true,
          },
        },
        managedRestaurant: {
          select: {
            id: true,
            nameBn: true,
            nameEn: true,
            slug: true,
          },
        },
        riderProfile: {
          select: {
            id: true,
            isOnline: true,
            vehicleType: true,
            rating: true,
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json({ user: null });
    }

    return NextResponse.json({ user });
  } catch (error) {
    console.error("Auth check error:", error);
    return NextResponse.json({ user: null });
  }
}
