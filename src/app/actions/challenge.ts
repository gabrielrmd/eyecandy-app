"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function enrollInChallenge() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "Unauthorized" };

  // Check for existing enrollment
  const { data: existing } = await supabase
    .from("challenge_enrollments")
    .select("id")
    .eq("user_id", user.id)
    .eq("status", "active")
    .single();

  if (existing) return { error: "Already enrolled" };

  const { data, error } = await supabase
    .from("challenge_enrollments")
    .insert({
      user_id: user.id,
      status: "active",
      enrolled_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (error) return { error: error.message };

  revalidatePath("/challenge");
  return { data };
}

export async function markTaskComplete(
  enrollmentId: string,
  weekNumber: number,
  taskId: string
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "Unauthorized" };

  const { error } = await supabase.from("challenge_progress").upsert(
    {
      enrollment_id: enrollmentId,
      user_id: user.id,
      week_number: weekNumber,
      task_id: taskId,
      is_complete: true,
      completed_at: new Date().toISOString(),
    },
    {
      onConflict: "enrollment_id,task_id",
    }
  );

  if (error) return { error: error.message };

  revalidatePath("/challenge/dashboard");
  return { success: true };
}
