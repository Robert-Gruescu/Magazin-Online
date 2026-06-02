import { useEffect, useRef, useState } from "react";
import { Navigate } from "react-router-dom";
import { supabase, isSupabaseConfigured } from "../supabaseClient";

function ProtectedRoute({ children }) {
  const [status, setStatus] = useState("checking");
  const resolvedRef = useRef(false);

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

    // Verifica sesiunea existenta
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (resolvedRef.current) return;
      resolvedRef.current = true;
      checkSession(session);
    });

    // Prinde sesiunea noua imediat dupa login
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      console.log("onAuthStateChange:", event, session?.user?.email);
      if (event === "SIGNED_IN" && session) {
        resolvedRef.current = true;
        setStatus("allowed");
      } else if (event === "SIGNED_OUT" && resolvedRef.current) {
        setStatus("denied");
      }
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
