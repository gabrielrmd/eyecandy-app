"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function enrollInChallenge() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "Unauthorized" };

  // Generate cohort based on current quarter
  const now = new Date();
  const quarter = Math.ceil((now.getMonth() + 1) / 3);
  const cohort = `${now.getFullYear()}-Q${quarter}`;

  // Check for existing active enrollment
  const { data: existing } = await supabase
    .from("challenge_enrollments")
    .select("id")
    .eq("user_id", user.id)
    .in("status", ["not_started", "in_progress"])
    .maybeSingle();

  if (existing) return { enrollmentId: existing.id, alreadyEnrolled: true };

  const { data, error } = await supabase
    .from("challenge_enrollments")
    .insert({
      user_id: user.id,
      challenge_cohort: cohort,
      status: "in_progress",
      enrollment_date: now.toISOString(),
      start_date: now.toISOString(),
      weeks_completed: 0,
      total_assignments_submitted: 0,
      current_streak: 0,
    })
    .select("id")
    .single();

  if (error) return { error: error.message };

  revalidatePath("/challenge");
  revalidatePath("/challenge/dashboard");
  return { enrollmentId: data.id };
}

export async function markTaskComplete(
  enrollmentId: string,
  weekNumber: number,
  taskId: string,
  isComplete: boolean
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "Unauthorized" };

  // Verify enrollment belongs to user
  const { data: enrollment } = await supabase
    .from("challenge_enrollments")
    .select("id")
    .eq("id", enrollmentId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (!enrollment) return { error: "Enrollment not found" };

  // The challenge_progress table tracks per-week assignments, not per-task.
  // We store task completion data inside the assignment_submission JSONB-like text field.
  // Since the table has UNIQUE(enrollment_id, week_number), we upsert per week.

  // First, get existing progress for this week
  const { data: existingProgress } = await supabase
    .from("challenge_progress")
    .select("id, assignment_submission")
    .eq("enrollment_id", enrollmentId)
    .eq("week_number", weekNumber)
    .maybeSingle();

  // Parse existing task completions from assignment_submission
  let taskCompletions: Record<string, boolean> = {};
  if (existingProgress?.assignment_submission) {
    try {
      taskCompletions = JSON.parse(existingProgress.assignment_submission);
    } catch {
      taskCompletions = {};
    }
  }

  // Update the specific task
  if (isComplete) {
    taskCompletions[taskId] = true;
  } else {
    delete taskCompletions[taskId];
  }

  // We need the week_id from challenge_weeks
  const { data: weekRow } = await supabase
    .from("challenge_weeks")
    .select("id")
    .eq("week_number", weekNumber)
    .maybeSingle();

  if (!weekRow) return { error: "Week not found in curriculum" };

  if (existingProgress) {
    // Update existing row
    const { error } = await supabase
      .from("challenge_progress")
      .update({
        assignment_submission: JSON.stringify(taskCompletions),
        assignment_completed: Object.keys(taskCompletions).length > 0,
        submitted_at: isComplete ? new Date().toISOString() : null,
      })
      .eq("id", existingProgress.id);

    if (error) return { error: error.message };
  } else {
    // Insert new row
    const { error } = await supabase.from("challenge_progress").insert({
      enrollment_id: enrollmentId,
      user_id: user.id,
      week_id: weekRow.id,
      week_number: weekNumber,
      assignment_submission: JSON.stringify(taskCompletions),
      assignment_completed: isComplete,
      submitted_at: isComplete ? new Date().toISOString() : null,
    });

    if (error) return { error: error.message };
  }

  revalidatePath("/challenge/dashboard");
  return { success: true };
}

export async function getEnrollment() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "Unauthorized" };

  const { data, error } = await supabase
    .from("challenge_enrollments")
    .select("*")
    .eq("user_id", user.id)
    .in("status", ["not_started", "in_progress"])
    .order("enrollment_date", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) return { error: error.message };
  return { enrollment: data };
}

export async function getChallengeProgress(enrollmentId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "Unauthorized" };

  const { data, error } = await supabase
    .from("challenge_progress")
    .select("*")
    .eq("enrollment_id", enrollmentId)
    .eq("user_id", user.id);

  if (error) return { error: error.message };
  return { progress: data ?? [] };
}
