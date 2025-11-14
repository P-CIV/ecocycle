import { BarChart3, Users, Package, QrCode, TrendingUp, Home } from "lucide-react";
import { NavLink } from "react-router-dom";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";

interface DashboardSidebarProps {
  userRole: "agent" | "admin";
}

export const DashboardSidebar = ({ userRole }: DashboardSidebarProps) => {
  const { state } = useSidebar();
  const isCollapsed = state === "collapsed";

  const agentMenuItems = [
    { title: "Tableau de Bord", url: "/agent", icon: Home },
    { title: "Convertisseur", url: "/agent/convertisseur", icon: Package },
    { title: "QR Code", url: "/agent/qr-code", icon: QrCode },
    { title: "Mes Statistiques", url: "/agent/stats", icon: BarChart3 },
  ];

  const adminMenuItems = [
    { title: "Vue d'Ensemble", url: "/admin", icon: Home },
    { title: "Gestion Équipe", url: "/admin/equipe", icon: Users },
    { title: "Statistiques", url: "/admin/stats", icon: BarChart3 },
    { title: "Tendances", url: "/admin/tendances", icon: TrendingUp },
  ];

  const menuItems = userRole === "admin" ? adminMenuItems : agentMenuItems;

  return (
    <Sidebar collapsible="icon" className="border-r border-border">
      <SidebarContent>
        <div className="px-4 py-6">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
              <Package className="h-5 w-5 text-primary-foreground" />
            </div>
            {!isCollapsed && (
              <div>
                <h2 className="font-bold text-foreground">EcoCollect</h2>
                <p className="text-xs text-muted-foreground">
                  {userRole === "admin" ? "Administrateur" : "Agent"}
                </p>
              </div>
            )}
          </div>
        </div>

        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      className={({ isActive }) =>
                        isActive
                          ? "bg-accent text-accent-foreground font-medium"
                          : "hover:bg-muted/50"
                      }
                    >
                      <item.icon className="h-4 w-4" />
                      {!isCollapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
};
