// src/app/api/confirm-booking/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabaseServer';
import sg from '@/lib/sendgrid';

export async function POST(req: NextRequest) {
  try {
    const { token, customerId, slot } = await req.json();
    if (!token || !customerId || !slot) throw new Error('Missing token/customerId/slot');

    // 1) Pull followup row to validate token & get client
    const { data: fq, error: fqErr } = await supabaseServer
      .from('followup_queue')
      .select('id, client_id, customer_id, status, payload, sent_at')
      .eq('customer_id', customerId)
      .eq('status', 'sent')
      .order('created_at', { ascending: false })
      .limit(5);
    if (fqErr) throw fqErr;

    const row = (fq||[]).find(r => r.payload?.token === token);
    if (!row) throw new Error('Invalid or already used token');

    // 2) Look up client + customer
    const [{ data: client, error: cErr }, { data: cust, error: cuErr }] = await Promise.all([
      supabaseServer.from('clients').select('id, from_email, from_name, timezone, name').eq('id', row.client_id).single(),
      supabaseServer.from('customers').select('name, email, car_make, car_model, reg').eq('id', customerId).single()
    ]);
    if (cErr) throw cErr;
    if (cuErr) throw cuErr;

    // 3) Create confirmed booking (bookings table)
    const appointment = new Date(slot).toISOString();
    const { error: bErr } = await supabaseServer.from('bookings').insert({
      client_name: cust?.name || '',
      phone: null,
      email: cust?.email || '',
      service: 'service',
      status: 'confirmed',
      appointment_date: appointment,
      client_id: client.id
    });
    if (bErr) throw bErr;

    // 4) Mark followup as completed
    await supabaseServer.from('followup_queue')
      .update({ status: 'completed', sent_at: new Date().toISOString() })
      .eq('id', row.id);

    // 5) Send a confirmation email to the customer (optional)
    await sg.send({
      from: { email: client.from_email || 'no-reply@example.com', name: client.from_name || 'Your Garage Team' },
      to: cust.email,
      subject: 'Your booking is confirmed',
      html: `<p>Thanks ${cust.name}, your booking for ${new Date(slot).toLocaleString('en-IE', { timeZone: client.timezone || 'Europe/Dublin' })} is confirmed.</p>`
    });

    return NextResponse.json({ ok: true });
  } catch (e:any) {
    console.error(e);
    return NextResponse.json({ ok:false, error: e.message }, { status: 500 });
  }
}