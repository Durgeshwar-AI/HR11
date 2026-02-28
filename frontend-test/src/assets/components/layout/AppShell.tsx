import { useState } from "react";
import { Sidebar } from "./Sidebar";

export function AppShell({ children, currentPage }: any) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="flex min-h-screen bg-tertiary">
      <Sidebar
        currentPage={currentPage}
        collapsed={collapsed}
      />

      <div className="flex-1 flex flex-col overflow-auto">
        {/* Top bar */}
        <div className="h-[62px] flex items-center justify-between px-8 bg-surface border-b-2 border-secondary shrink-0">
          <button
            onClick={() => setCollapsed((c: boolean) => !c)}
            className="bg-transparent border-2 border-secondary w-9 h-9 cursor-pointer text-sm flex items-center justify-center font-display"
          >
            ☰
          </button>

          <div className="flex items-center gap-5">
            <div className="font-body text-[13px] text-ink-light bg-surface-alt border border-border-clr py-1.5 px-3.5 flex items-center gap-2">
              <span>🔔</span>
              <span className="font-display font-extrabold text-[10px] bg-primary text-white px-[5px] py-px">
                3
              </span>
            </div>
            <div className="flex items-center gap-2 bg-surface-alt border border-border-clr py-1.5 px-3.5 cursor-pointer">
              <div className="w-7 h-7 bg-primary text-white flex items-center justify-center font-display font-black text-xs">
                HR
              </div>
              <span className="font-body font-medium text-[13px] text-secondary">
                TechCorp Inc.
              </span>
            </div>
          </div>
        </div>

        {/* Page content */}
        <main className="flex-1 p-8">{children}</main>
      </div>
    </div>
  );
}
