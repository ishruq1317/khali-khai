import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const session = await requireAuth(["ADMIN"]);
    const body = await request.json();
    const { key, value } = body;

    if (!key || value === undefined) {
      return NextResponse.json({ error: "Key and value required" }, { status: 400 });
    }

    const updated = await prisma.platformSetting.upsert({
      where: { key },
      update: { value: String(value) },
      create: { key, value: String(value) },
    });

    await prisma.auditLog.create({
      data: {
        userId: session.userId,
        action: "UPDATE_SETTING",
        resourceType: "PlatformSetting",
        resourceId: updated.id,
        details: `Updated ${key} to ${value}`,
      },
    });

    return NextResponse.json({ success: true, setting: updated });
  } catch (error: any) {
    console.error("Admin settings error:", error);
    return NextResponse.json({ error: "অননুমোদিত অ্যাক্সেস" }, { status: 403 });
  }
}
