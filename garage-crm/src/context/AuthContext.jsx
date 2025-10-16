"use client";
import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";

const AuthContext = createContext({ user: null, loading: true });

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [client, setClient] = useState(null); // row from public.clients

  useEffect(() => {
    const init = async () => {
      const { data } = await supabase.auth.getUser();
      setUser(data?.user || null);
      setLoading(false);
      if (data?.user) {
        const { data: clientRow } = await supabase.from("clients").select("*").eq("id", data.user.id).single();
        setClient(clientRow || null);
      }
    };
    init();

    const { data: sub } = supabase.auth.onAuthStateChange(async (_e, session) => {
      const u = session?.user ?? null;
      setUser(u);
      if (u) {
        const { data: clientRow } = await supabase.from("clients").select("*").eq("id", u.id).single();
        setClient(clientRow || null);
      } else {
        setClient(null);
      }
    });
    return () => sub?.subscription?.unsubscribe();
  }, []);

  return <AuthContext.Provider value={{ user, client, loading }}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);
