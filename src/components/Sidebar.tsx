import { NavLink, useNavigate } from "react-router-dom";
import { motion } from "motion/react";
import {
  Home, User, GraduationCap, Target, FileText, Info,
  MessageSquare, ShieldAlert, Calendar, Activity,
  Book, Globe, LogOut, Sun, Moon,
} from "lucide-react";
import { cn } from "../lib/utils";
import { useTheme } from "../context/ThemeContext";

const navItems = [
  { name: "主页", path: "/home", icon: Home },
  { name: "学生详情", path: "/details", icon: User },
  { name: "成绩", path: "/grades", icon: GraduationCap },
  { name: "分数", path: "/scores", icon: Target },
  { name: "成绩报告", path: "/reports", icon: FileText },
  { name: "额外信息", path: "/extra", icon: Info },
  { name: "我的报告评论", path: "/comments", icon: MessageSquare },
  { name: "我的DMS", path: "/dms", icon: ShieldAlert },
  { name: "周时间表", path: "/schedule", icon: Calendar },
  { name: "活动", path: "/activities", icon: Activity },
  { name: "日记簿", path: "/diary", icon: Book },
  { name: "网站", path: "/websites", icon: Globe },
];

export default function Sidebar() {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();

  const handleLogout = async () => {
    try {
      await fetch("/api/logout", {
        method: "POST",
        credentials: "include"
      });
    } catch (e) { /* ignore */ }
    sessionStorage.removeItem("activitiesData");
    sessionStorage.removeItem("timetableData");
    localStorage.removeItem("authToken");
    navigate("/");
  };

  return (
    <aside
      className="w-64 h-screen flex flex-col pt-8 pb-5 px-3 shrink-0 border-r transition-colors duration-300"
      style={{ background: "var(--sidebar-bg)", borderColor: "var(--border)" }}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-3 mb-8">
        <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: "var(--accent)" }}>
          <GraduationCap className="w-5 h-5 text-white" />
        </div>
        <span className="text-[16px] font-semibold tracking-tight" style={{ color: "var(--text-primary)" }}>
          Student Portal
        </span>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto space-y-0.5 pr-1">
        {navItems.map((item, idx) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-medium transition-all duration-200 relative group",
                isActive
                  ? "font-semibold"
                  : "hover:translate-x-0.5"
              )
            }
            style={({ isActive }) => ({
              color: isActive ? "var(--accent)" : "var(--text-secondary)",
              background: isActive ? "var(--accent-soft)" : "transparent",
            })}
          >
            {({ isActive }) => (
              <motion.div
                className="flex items-center gap-3 w-full"
                initial={false}
                animate={{ x: 0 }}
                whileHover={{ x: 2 }}
                transition={{ duration: 0.15 }}
              >
                <item.icon className="w-[18px] h-[18px]" style={{ color: isActive ? "var(--accent)" : "var(--text-tertiary)" }} />
                <span>{item.name}</span>
              </motion.div>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Footer */}
      <div className="pt-3 mt-2 space-y-1 border-t" style={{ borderColor: "var(--border)" }}>
        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="flex items-center gap-3 px-3 py-2.5 w-full rounded-xl text-[13px] font-medium transition-all duration-200"
          style={{ color: "var(--text-secondary)" }}
          onMouseEnter={(e) => (e.currentTarget.style.background = "var(--sidebar-hover)")}
          onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
        >
          <motion.div
            key={theme}
            initial={{ rotate: -90, opacity: 0 }}
            animate={{ rotate: 0, opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            {theme === "dark" ? <Sun className="w-[18px] h-[18px]" /> : <Moon className="w-[18px] h-[18px]" />}
          </motion.div>
          {theme === "dark" ? "浅色模式" : "深色模式"}
        </button>

        {/* Logout */}
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2.5 w-full rounded-xl text-[13px] font-medium transition-all duration-200"
          style={{ color: "var(--danger)" }}
          onMouseEnter={(e) => (e.currentTarget.style.background = "var(--sidebar-hover)")}
          onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
        >
          <LogOut className="w-[18px] h-[18px]" />
          退出登录
        </button>
      </div>
    </aside>
  );
}
