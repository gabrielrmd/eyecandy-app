import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import type { TrackingEventInsert, TrackingEventType } from "@/lib/types/crm";

const VALID_EVENT_TYPES = new Set<TrackingEventType>([
  "page_view", "form_submission", "cta_view", "cta_click",
  "entrance", "exit", "bounce",
  "email_sent", "email_opened", "email_clicked",
  "contact_created",
]);

/**
 * POST /api/analytics/events
 *
 * Event ingestion endpoint (PRD §12.1–12.2).
 * Accepts single events or batches of up to 100 events.
 *
 * Body:
 *   event  - TrackingEventInsert (single event)
 *   events - TrackingEventInsert[] (batch, max 100)
 */
export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();

  // Accept single event or batch
  let events: TrackingEventInsert[];
  if (body.events && Array.isArray(body.events)) {
    events = body.events;
  } else if (body.event) {
    events = [body.event];
  } else {
    return NextResponse.json(
      { error: "Provide 'event' or 'events' in request body" },
      { status: 400 }
    );
  }

  // Validate batch size
  if (events.length > 100) {
    return NextResponse.json(
      { error: "Maximum 100 events per batch" },
      { status: 400 }
    );
  }

  // Validate and enrich events
  const rows = [];
  for (const evt of events) {
    if (!evt.event_type || !VALID_EVENT_TYPES.has(evt.event_type)) {
      return NextResponse.json(
        { error: `Invalid event_type: ${evt.event_type}` },
        { status: 400 }
      );
    }

    rows.push({
      user_id: user.id,
      event_type: evt.event_type,
      occurred_at: evt.occurred_at ?? new Date().toISOString(),
      entity_type: evt.entity_type ?? null,
      entity_id: evt.entity_id ?? null,
      contact_id: evt.contact_id ?? null,
      contact_email: evt.contact_email ?? null,
      metadata: evt.metadata ?? {},
      session_id: evt.session_id ?? null,
    });
  }

  const { error } = await supabase.from("tracking_events").insert(rows);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({
    success: true,
    ingested: rows.length,
  });
}
