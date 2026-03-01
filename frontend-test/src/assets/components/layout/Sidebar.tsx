import { useNavigate } from "react-router-dom";
import { clearAuth } from "../../../services/api";

const NAV_ITEMS = [
  { key: "dashboard", path: "/dashboard", icon: "⊞", label: "Dashboard" },
  { key: "pipeline", path: "/pipeline", icon: "", label: "Pipeline Builder" },
  { key: "leaderboard", path: "/leaderboard", icon: "", label: "Leaderboard" },
];

interface SidebarProps {
  currentPage: string;
  collapsed: boolean;
}

export function Sidebar({ currentPage, collapsed }: SidebarProps) {
  const navigate = useNavigate();
  return (
    <aside
      className="min-h-screen bg-secondary text-white border-r-2 border-secondary flex flex-col shrink-0 sticky top-0 self-start transition-[width] duration-200"
      style={{ width: collapsed ? 60 : 220 }}
    >
      {/* Logo */}
      <div
        className={`h-[62px] flex items-center gap-2 border-b border-white/10 ${collapsed ? "px-4" : "px-5"}`}
      >
        <span className="font-display font-black text-xl text-white">
          HR<span className="text-primary">11</span>
        </span>
        {!collapsed && (
          <span className="bg-primary text-white text-[8px] font-extrabold px-[5px] py-px tracking-[0.1em]">
            AI
          </span>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 py-4">
        {NAV_ITEMS.map((item) => {
          const active = currentPage === item.key;
          return (
            <div
              key={item.key}
              onClick={() => navigate(item.path)}
              className={[
                "flex items-center gap-3 cursor-pointer text-lg transition-all duration-150",
                collapsed ? "py-3 px-4" : "py-3 px-5",
                active
                  ? "bg-primary border-l-[3px] border-white"
                  : "border-l-[3px] border-transparent hover:bg-white/[0.08]",
              ].join(" ")}
            >
              <span className="text-base shrink-0">{item.icon}</span>
              {!collapsed && (
                <span className="font-display font-bold text-[13px] tracking-[0.06em] uppercase text-white">
                  {item.label}
                </span>
              )}
            </div>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="p-4 border-t border-white/10">
        <div
          onClick={() => { clearAuth(); navigate("/"); }}
          className="flex items-center gap-3 py-2.5 px-1 cursor-pointer opacity-60 hover:opacity-100 transition-opacity"
        >
          <span></span>
          {!collapsed && (
            <span className="font-display font-bold text-xs tracking-[0.08em] uppercase text-white">
              Logout
            </span>
          )}
        </div>
      </div>
    </aside>
  );
}
