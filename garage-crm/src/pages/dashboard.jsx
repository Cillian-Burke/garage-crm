"use client";
import { useAuth } from "../context/AuthContext";
import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";

export default function Dashboard() {
  const { user, client, loading } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [kpis, setKpis] = useState({ pending: 0, confirmed: 0, completed: 0 });

  useEffect(() => {
    if (!user) return;
    supabase.from("bookings").select("*").eq("client_id", user.id).then(({ data }) => {
      const safe = data || [];
      setBookings(safe);
      setKpis({
        pending: safe.filter(b => b.status === "pending").length,
        confirmed: safe.filter(b => b.status === "confirmed").length,
        completed: safe.filter(b => b.status === "completed").length,
      });
    });
  }, [user]);

  if (loading) return <div className="p-8">Loading...</div>;
  if (!user) return <div className="p-8"><a href="/login">Log in</a></div>;

  return (
    <div className="flex min-h-screen bg-gray-100">
      <aside className="w-64 bg-white shadow-md p-6 border-r border-gray-200">
        <h1 className="text-2xl font-bold mb-6 text-gray-800">Garage Dashboard</h1>
        <div className="text-xs text-gray-500 mb-4">
          From: {client?.from_name || "Your Garage Team"} {"<"}{client?.from_email || "no-reply@garagecrm.test"}{">"}
        </div>
        <nav className="space-y-3">
          <a href="/dashboard" className="block py-2 px-3 rounded hover:bg-gray-100 text-gray-700 font-medium">Dashboard</a>
          <a href="/settings" className="block py-2 px-3 rounded hover:bg-gray-100 text-gray-700 font-medium">Settings</a>
          <a href="/job-cards/upload" className="block py-2 px-3 rounded hover:bg-gray-100 text-gray-700 font-medium">Upload Media</a>
        </nav>
      </aside>

      <main className="flex-1 p-8">
        <h1 className="text-3xl font-bold mb-6 text-gray-800">Overview</h1>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl p-6 shadow-md border border-gray-200">
            <h2 className="text-gray-600 font-medium">Pending Bookings</h2>
            <p className="text-3xl font-bold text-blue-600 mt-2">{kpis.pending}</p>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-md border border-gray-200">
            <h2 className="text-gray-600 font-medium">Confirmed Bookings</h2>
            <p className="text-3xl font-bold text-green-600 mt-2">{kpis.confirmed}</p>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-md border border-gray-200">
            <h2 className="text-gray-600 font-medium">Completed Jobs</h2>
            <p className="text-3xl font-bold text-gray-800 mt-2">{kpis.completed}</p>
          </div>
        </div>

        <div className="bg-white rounded-xl p-8 shadow-md border border-gray-200">
          <h2 className="text-xl font-semibold mb-4 text-gray-700">Appointments This Week</h2>
          <p className="text-gray-400 text-sm">[Chart placeholder]</p>
        </div>
      </main>
    </div>
  );
}
