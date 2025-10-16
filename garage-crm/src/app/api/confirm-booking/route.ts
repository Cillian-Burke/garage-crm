// src/app/api/confirm-booking/route.ts
import { NextRequest, NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabaseServer";
import { sendEmail } from "@/lib/sendgrid";

/**
 * Handles booking confirmation links from emails
 * Example link:
 *   https://garage-crm.vercel.app/api/confirm-booking?customerId=123&slot=2025-10-20T09:00:00Z
 */

export async function GET(req: NextRequest) {
  try {
    // Extract query parameters
    const { searchParams } = new URL(req.url);
    const customerId = searchParams.get("customerId");
    const slot = searchParams.get("slot");

    if (!customerId || !slot) {
      return NextResponse.json(
        { error: "Missing required parameters." },
        { status: 400 }
      );
    }

    // ✅ Fetch customer details
    const { data: customer, error: customerError } = await supabaseServer
      .from("customers")
      .select("*")
      .eq("id", customerId)
      .single();

    if (customerError || !customer) {
      console.error("❌ Customer not found:", customerError);
      return NextResponse.json({ error: "Customer not found." }, { status: 404 });
    }

    // ✅ Update booking status
    const { error: updateError } = await supabaseServer
      .from("bookings")
      .update({ status: "confirmed", confirmed_at: new Date().toISOString() })
      .eq("customer_id", customerId)
      .eq("service_date", slot);

    if (updateError) {
      console.error("❌ Failed to update booking:", updateError);
      return NextResponse.json(
        { error: "Failed to confirm booking." },
        { status: 500 }
      );
    }

    // ✅ Send confirmation email via SendGrid
    await sendEmail({
      to: customer.email,
      subject: "✅ Booking Confirmed",
      html: `
        <p>Hi ${customer.name || "Customer"},</p>
        <p>Your booking for <strong>${new Date(slot).toLocaleString("en-IE", {
          dateStyle: "medium",
          timeStyle: "short",
        })}</strong> has been confirmed.</p>
        <p>Thank you for choosing our service!</p>
        <br/>
        <p>Best regards,<br/>Your Garage Team</p>
      `,
    });

    console.log(`✅ Booking confirmed for ${customer.email}`);

    return NextResponse.json({
      message: "Booking confirmed successfully!",
      customer: customer.email,
    });
  } catch (error: any) {
    console.error("❌ Confirm booking error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}