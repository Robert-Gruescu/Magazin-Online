import { useEffect } from "react";
import { useLocation } from "react-router-dom";

/** Duce pagina în sus la fiecare navigare (React Router nu o face implicit). */
const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
  }, [pathname]);

  return null;
};

export default ScrollToTop;
