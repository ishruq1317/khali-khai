import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getCustomerLoyaltyStatus } from "@/lib/loyalty";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "লগইন করুন" }, { status: 401 });
    }

    const customerProfile = await prisma.customerProfile.findUnique({
      where: { userId: session.userId },
      include: {
        addresses: true,
      },
    });

    if (!customerProfile) {
      return NextResponse.json({ error: "প্রোফাইল পাওয়া যায়নি" }, { status: 404 });
    }

    const loyalty = await getCustomerLoyaltyStatus(customerProfile.id);

    return NextResponse.json({
      loyalty,
      addresses: customerProfile.addresses,
    });
  } catch (error) {
    console.error("Loyalty API error:", error);
    return NextResponse.json(
      { error: "লয়্যালটি তথ্য আনতে সমস্যা হয়েছে" },
      { status: 500 }
    );
  }
}
