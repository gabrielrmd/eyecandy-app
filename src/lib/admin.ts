/**
 * Admin utilities — server-side helpers for admin authorization.
 */

import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export interface AdminContext {
  supabase: Awaited<ReturnType<typeof createClient>>;
  adminId: string;
}

/**
 * Verify the current user is an admin. Returns the supabase client and admin ID,
 * or a NextResponse error if unauthorized.
 */
export async function requireAdmin(): Promise<AdminContext | NextResponse> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: profile } = await supabase
    .from("user_profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  return { supabase, adminId: user.id };
}

/**
 * Type guard to check if requireAdmin returned an error response.
 */
export function isErrorResponse(
  result: AdminContext | NextResponse
): result is NextResponse {
  return result instanceof NextResponse;
}
