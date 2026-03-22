import { NextResponse } from "next/server";
import { getUserAccess } from "@/lib/entitlements";

export async function GET() {
  try {
    const access = await getUserAccess();
    return NextResponse.json({
      tierName: access.tierName,
      hasTemplates: access.hasTemplates,
      hasStrategyBuilder: access.hasStrategyBuilder,
      hasCircle: access.hasCircle,
      hasAgency: access.hasAgency,
      hasConsulting: access.hasConsulting,
      canGenerateStrategy: access.canGenerateStrategy,
      credits: access.credits,
    });
  } catch {
    return NextResponse.json(
      { tierName: "Free", hasTemplates: false, hasStrategyBuilder: false, hasCircle: false, hasAgency: false, hasConsulting: false, canGenerateStrategy: false, credits: { credits_remaining: 0, credits_used: 0, credits_total: 0, unlimited: false } },
      { status: 200 }
    );
  }
}
