import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { AnimatePresence } from "motion/react";
import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import Sidebar from "./Sidebar";

export default function Layout() {
  const location = useLocation();
  const navigate = useNavigate();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const ctrl = new AbortController();
    fetch("/api/me", { 
      headers: { "Authorization": `Bearer ${localStorage.getItem("authToken")}` },
      signal: ctrl.signal 
    })
      .then((res) => {
        if (ctrl.signal.aborted) return;
        if (!res.ok) {
          sessionStorage.removeItem("activitiesData");
          sessionStorage.removeItem("timetableData");
          localStorage.removeItem("authToken");
          navigate("/", { replace: true });
        }
      })
      .catch((err) => {
        if (err.name === "AbortError") return;
        navigate("/", { replace: true });
      })
      .finally(() => {
        if (!ctrl.signal.aborted) setChecking(false);
      });
    return () => ctrl.abort();
  }, []);

  if (checking) {
    return (
      <div className="flex h-screen w-full items-center justify-center transition-colors duration-300" style={{ background: "var(--bg-secondary)" }}>
        <Loader2 className="w-7 h-7 animate-spin" style={{ color: "var(--text-tertiary)" }} />
      </div>
    );
  }

  return (
    <div className="flex h-screen w-full overflow-hidden transition-colors duration-300" style={{ background: "var(--bg-secondary)" }}>
      <Sidebar />
      <main className="flex-1 h-full overflow-y-auto relative">
        <div className="max-w-5xl mx-auto p-8 md:p-12">
          <AnimatePresence mode="wait">
            <div key={location.pathname}>
              <Outlet />
            </div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}
