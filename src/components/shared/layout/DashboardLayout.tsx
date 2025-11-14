import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface DashboardLayoutProps {
  children: ReactNode;
  userRole: "admin" | "agent";
}

export function DashboardLayout({ children, userRole }: DashboardLayoutProps) {
  return (
    <div className={cn("min-h-screen bg-background", {
      "admin-theme": userRole === "admin",
      "agent-theme": userRole === "agent"
    })}>
      <div className="flex-1">
        <div className="container mx-auto py-6">
          {children}
        </div>
      </div>
    </div>
  );
}