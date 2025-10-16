import { createClient } from "@supabase/supabase-js";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { bookingId } = req.body;
  if (!bookingId) {
    return res.status(400).json({ error: "Missing bookingId" });
  }

  console.log("🧾 Confirming booking:", bookingId);

  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY
    );

    // ✅ Step 1: Update booking status in Supabase
    const { error: updateError } = await supabase
      .from("bookings")
      .update({ status: "confirmed" })
      .eq("id", bookingId);

    if (updateError) {
      console.error("❌ Error updating booking:", updateError);
      return res.status(500).json({ error: updateError.message });
    }

    // ✅ Step 2: Notify n8n webhook
    const n8nWebhook = process.env.NEXT_PUBLIC_N8N_BOOKING_URL;

    if (n8nWebhook) {
      await fetch(n8nWebhook, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bookingId, status: "confirmed" }),
      });
    }

    console.log("✅ Booking confirmed successfully:", bookingId);
    return res.status(200).json({ success: true });
  } catch (err) {
    console.error("❌ Unexpected error:", err);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}