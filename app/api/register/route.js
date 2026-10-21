import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";

const supabase = () =>
  createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

// Seat like A1..A20, B1..B20 and so on, derived from the ticket number
function seatFor(n) {
  const row = String.fromCharCode(65 + Math.floor((n - 1) / 20) % 26);
  return `${row}${((n - 1) % 20) + 1}`;
}

export async function POST(req) {
  try {
    const body = await req.json();
    const name = String(body.name || "").trim().slice(0, 60);
    const email = String(body.email || "").trim().slice(0, 100);
    const team = String(body.team || "").trim().slice(0, 40);

    if (!name) return Response.json({ error: "Name is required." }, { status: 400 });

    const db = supabase();
    const { data: inserted, error } = await db
      .from("rocket_participants")
      .insert({ name, email, team })
      .select("id")
      .single();
    if (error) throw error;

    const mission_id = `R2S-${String(inserted.id).padStart(4, "0")}`;
    const seat = seatFor(inserted.id);

    const { data: row, error: upErr } = await db
      .from("rocket_participants")
      .update({ mission_id, seat })
      .eq("id", inserted.id)
      .select("id, name, team, mission_id, seat, created_at")
      .single();
    if (upErr) throw upErr;

    return Response.json({ ticket: row });
  } catch (e) {
    return Response.json({ error: e.message || "Registration failed." }, { status: 500 });
  }
}
