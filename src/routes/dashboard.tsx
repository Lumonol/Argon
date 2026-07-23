import { useState } from "react";
import { Outlet, createFileRoute } from "@tanstack/react-router";

import WorkspacesSidebar from "@/components/WorkspacesSidebar";
import WorkspaceTopBar from "@/components/WorkspaceTopBar";
import { useIsMobile } from "@/hooks/use-mobile";

export const Route = createFileRoute("/dashboard")({
  component: WorkspacesLayout,
});

function WorkspacesLayout() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const isMobile = useIsMobile();

  return (
    <>
      <div className="flex h-screen overflow-hidden bg-card text-foreground">
        <WorkspaceTopBar collapsed={sidebarCollapsed} onToggleCollapsed={() => setSidebarCollapsed(c => !c)} />
        <WorkspacesSidebar collapsed={sidebarCollapsed} onCollapsedChange={setSidebarCollapsed} />
        <main className={`flex-1 flex flex-col overflow-hidden transition-all duration-300 pt-14 ${isMobile ? 'pl-0 pb-20' : sidebarCollapsed ? 'ml-16' : 'ml-64'}`}>
          <div className="flex-1 min-h-0 overflow-y-auto rounded-tl-2xl border-l border-t border-border bg-background">
            <Outlet />
          </div>
        </main>
      </div>
    </>
  );
}
