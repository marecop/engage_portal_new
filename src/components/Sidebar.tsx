import { NavLink, useNavigate } from "react-router-dom";
import { 
  Home, User, GraduationCap, Target, FileText, Info, 
  MessageSquare, ShieldAlert, Calendar, Activity, 
  Book, Globe, LogOut 
} from "lucide-react";
import { cn } from "../lib/utils";

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

  const handleLogout = async () => {
    try {
      const token = localStorage.getItem("authToken");
      if (token) {
        await fetch("/api/logout", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${token}`
          }
        });
      }
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      localStorage.removeItem("authToken");
      navigate("/");
    }
  };

  return (
    <aside className="w-64 h-screen bg-[#f5f5f7] border-r border-black/[0.06] flex flex-col pt-10 pb-6 px-4 shrink-0">
      <div className="flex items-center gap-3 px-3 mb-8">
        <div className="w-8 h-8 rounded-lg bg-apple-blue flex items-center justify-center">
          <GraduationCap className="w-5 h-5 text-white" />
        </div>
        <h1 className="text-[17px] font-semibold tracking-tight text-apple-text">Student Portal</h1>
      </div>

      <nav className="flex-1 overflow-y-auto space-y-0.5 pr-2">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              cn(
                "flex items-center gap-3 px-3 py-2 rounded-lg text-[14px] transition-colors",
                isActive
                  ? "bg-black/[0.06] text-apple-text font-medium"
                  : "text-black/60 hover:bg-black/[0.04] hover:text-apple-text font-medium"
              )
            }
          >
            <item.icon className="w-4 h-4" />
            {item.name}
          </NavLink>
        ))}
      </nav>

      <div className="pt-4 mt-4">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2 w-full rounded-lg text-[14px] font-medium text-red-500 hover:bg-red-50 transition-colors"
        >
          <LogOut className="w-4 h-4" />
          退出登录
        </button>
      </div>
    </aside>
  );
}
