"use client";
import { useState } from "react";
import { supabase } from "../lib/supabaseClient";

export default function LoginPage() {
  const [email, setEmail] = useState("skibidi@email.ie");
  const [password, setPassword] = useState("password");
  const [msg, setMsg] = useState("");

  const handleLogin = async () => {
    setMsg("Logging in...");
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) setMsg("❌ " + error.message);
    else window.location.href = "/dashboard";
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="bg-white p-8 rounded-xl shadow-md w-full max-w-sm">
        <h1 className="text-2xl font-bold mb-4 text-center">Garage CRM Login</h1>
        <input className="border w-full p-2 rounded mb-3" placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)} />
        <input className="border w-full p-2 rounded mb-4" type="password" placeholder="Password" value={password} onChange={e=>setPassword(e.target.value)} />
        <button onClick={handleLogin} className="w-full bg-blue-600 text-white p-2 rounded">Log in</button>
        <p className="mt-3 text-sm text-gray-600">{msg}</p>
      </div>
    </div>
  );
}
