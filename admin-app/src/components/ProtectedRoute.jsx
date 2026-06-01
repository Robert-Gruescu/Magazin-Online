import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { supabase, isSupabaseConfigured } from "../supabaseClient";

function ProtectedRoute({ children }) {
  const [status, setStatus] = useState("checking");

  useEffect(() => {
    if (!isSupabaseConfigured || !supabase) {
      setStatus("denied");
      return;
    }

    const checkSession = async (session) => {
      if (!session) {
        setStatus("denied");
        return;
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", session.user.id)
        .maybeSingle();

      setStatus(profile?.role === "admin" ? "allowed" : "denied");
    };

    // Verifica sesiunea curenta
    supabase.auth.getSession().then(({ data: { session } }) => {
      checkSession(session);
    });

    // Asculta schimbarile de sesiune
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      checkSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (status === "checking") {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-sm text-ink/50">Se verifică accesul...</p>
      </div>
    );
  }

  if (status === "denied") {
    return <Navigate to="/login" replace />;
  }

  return children;
}

export default ProtectedRoute;
