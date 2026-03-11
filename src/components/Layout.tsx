import { Outlet, useLocation } from "react-router-dom";
import { AnimatePresence } from "motion/react";
import Sidebar from "./Sidebar";

export default function Layout() {
  const location = useLocation();

  return (
    <div className="flex h-screen w-full overflow-hidden bg-[#f5f5f7]">
      <Sidebar />
      <main className="flex-1 h-full overflow-y-auto relative">
        <div className="max-w-5xl mx-auto p-10 md:p-14">
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
