import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// Initialize Supabase (server-side)
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Utility: format the service reminder email
function formatEmailBody(customer: any, slots: string[]) {
  return `
    <p>Hi ${customer.name || "there"},</p>
    <p>Your <b>${customer.car_make || ""} ${customer.car_model || ""}</b> (Reg: ${
    customer.reg || ""
  }) is due for service on <b>${new Date(
    customer.next_due_date
  ).toLocaleDateString("en-IE")}</b>.</p>
    <p>Please choose one of the available slots:</p>
    <ul>
      ${slots
        .map(
          (s, i) => `
        <li>
          Option ${i + 1}: ${new Date(s).toLocaleString("en-IE", {
            dateStyle: "medium",
            timeStyle: "short",
          })} —
          <a href="${process.env.NEXT_PUBLIC_FRONTEND_BASE}/confirm-booking?customerId=${
            customer.id
          }&slot=${encodeURIComponent(s)}"
            style="color:#fff;background:#007bff;padding:8px 12px;text-decoration:none;border-radius:4px;">
            Book Here
          </a>
        </li>`
        )
        .join("")}
    </ul>
    <p>Best regards,<br>Your Garage Team</p>
  `;
}

// Utility: generate simple internal time slots
function generateSlots(date: Date, count = 3) {
  const slots: string[] = [];
  for (let i = 0; i < count; i++) {
    const slot = new Date(date);
    slot.setHours(9 + i * 2); // e.g. 9am, 11am, 1pm
    slots.push(slot.toISOString());
  }
  return slots;
}

export async function GET() {
  try {
    console.log("🚀 Outreach route triggered");
    console.log("SUPABASE URL:", process.env.NEXT_PUBLIC_SUPABASE_URL);
    console.log(
      "SUPABASE KEY (first 10 chars):",
      process.env.SUPABASE_SERVICE_ROLE_KEY?.slice(0, 10)
    );

    // 1️⃣ Fetch all clients that have outreach enabled
    const { data: clients, error: clientError } = await supabase
      .from("clients")
      .select("*")
      .eq("outreach_enabled", true);

    if (clientError) throw clientError;
    if (!clients || clients.length === 0)
      return NextResponse.json({ message: "No clients with outreach enabled" });

    // Get the current UTC hour
    const currentUtcHour = new Date().getUTCHours();

    // 2️⃣ Loop through each client and check if their outreach should run now
    for (const client of clients) {
      const daysNotice = client.days_notice || 7;
      const tz = client.timezone || "Europe/Dublin";
      const sendHour = client.outreach_send_hour ?? 9;

      // Convert timezone and get client's current hour
      const clientNow = new Date().toLocaleString("en-US", { timeZone: tz });
      const clientHour = new Date(clientNow).getHours();

      if (clientHour !== sendHour) {
        console.log(`⏭ Skipping ${client.name} — scheduled for ${sendHour}:00`);
        continue;
      }

      console.log(`📤 Running outreach for ${client.name} (${tz} @ ${sendHour}:00)`);

      // 3️⃣ Find customers due in X days
      const today = new Date();
      const from = new Date(today);
      from.setDate(today.getDate() + daysNotice);
      const to = new Date(from);
      to.setDate(from.getDate() + 1);

      const { data: customers, error: custError } = await supabase
        .from("customers")
        .select("*")
        .eq("client_id", client.id)
        .gte("next_due_date", from.toISOString())
        .lt("next_due_date", to.toISOString());

      if (custError) throw custError;
      if (!customers?.length) continue;

      // 4️⃣ For each due customer, create pending booking + send email
      for (const customer of customers) {
        const slots = generateSlots(new Date(customer.next_due_date), 3);

        // Create a pending booking in Supabase
        await supabase.from("bookings").insert({
          customer_id: customer.id,
          client_id: client.id,
          service_date: slots[0],
          status: "pending",
        });

        // Send email via SendGrid
        await fetch("https://api.sendgrid.com/v3/mail/send", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${process.env.SENDGRID_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            personalizations: [
              {
                to: [{ email: customer.email }],
                subject: "Service Reminder & Booking Options",
              },
            ],
            from: {
              email: client.from_email || "no-reply@garagecrm.com",
              name: client.from_name || "Garage CRM",
            },
            content: [
              {
                type: "text/html",
                value: formatEmailBody(customer, slots),
              },
            ],
          }),
        });
      }
    }

    return NextResponse.json({
      message: "✅ Outreach run completed successfully",
    });
  } catch (error: any) {
    console.error("❌ Outreach Error:", error);
    return NextResponse.json(
      { error: error.message || "Unknown error" },
      { status: 500 }
    );
  }
}