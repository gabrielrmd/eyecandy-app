"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function updateProfile(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "Unauthorized" };

  const updates: Record<string, unknown> = {};
  const fields = [
    "first_name",
    "last_name",
    "company_name",
    "industry",
    "bio",
    "timezone",
  ];

  for (const field of fields) {
    const value = formData.get(field);
    if (value !== null) updates[field] = value;
  }

  updates.updated_at = new Date().toISOString();

  const { error } = await supabase
    .from("user_profiles")
    .update(updates)
    .eq("id", user.id);

  if (error) return { error: error.message };

  revalidatePath("/account");
  return { success: true };
}

export async function updateNotificationPreferences(
  preferences: Record<string, boolean>
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "Unauthorized" };

  const { error } = await supabase
    .from("user_profiles")
    .update({
      email_notifications_enabled: preferences.email_notifications ?? true,
      weekly_digest_enabled: preferences.weekly_digest ?? true,
      template_released_enabled: preferences.template_releases ?? true,
      challenge_reminders_enabled: preferences.challenge_reminders ?? true,
      updated_at: new Date().toISOString(),
    })
    .eq("id", user.id);

  if (error) return { error: error.message };

  revalidatePath("/account");
  return { success: true };
}
