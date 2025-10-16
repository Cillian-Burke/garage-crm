import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
    anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.slice(0, 10),
    serviceKey: process.env.SUPABASE_SERVICE_ROLE_KEY?.slice(0, 10),
    nodeEnv: process.env.NODE_ENV,
  });
}