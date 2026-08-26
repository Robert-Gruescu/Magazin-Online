import Navbar from "./Navbar";
import Footer from "./Footer";
import ChatAssistant from "./ChatAssistant";

/**
 * Cadrul comun al site-ului: fundal, navbar, conținut, footer.
 * Înlocuiește gradientul copiat anterior în fiecare pagină.
 *
 * `bare` scoate padding-ul containerului (folosit de landing page, care își
 * gestionează singură secțiunile pe toată lățimea).
 */
const Layout = ({ children, bare = false, navbarProps = {} }) => (
  <div className="flex min-h-screen flex-col bg-slate-50 font-sans text-ink">
    {/* Fundal rece, cu două halouri discrete */}
    <div className="pointer-events-none fixed inset-0 -z-10">
      <div className="absolute inset-0 bg-linear-to-br from-slate-50 via-white to-blue-50" />
      <div className="absolute -left-32 top-0 h-[32rem] w-[32rem] rounded-full bg-volt/10 blur-[140px]" />
      <div className="absolute -right-32 top-40 h-[32rem] w-[32rem] rounded-full bg-cyan-glow/10 blur-[140px]" />
    </div>

    <Navbar {...navbarProps} />

    <main className="flex-1">
      {bare ? children : <div className="mx-auto max-w-6xl px-6 py-10">{children}</div>}
    </main>

    <Footer />

    {/* Asistentul plutește peste orice pagină */}
    <ChatAssistant />
  </div>
);

export default Layout;
