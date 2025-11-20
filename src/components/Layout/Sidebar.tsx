import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  QrCode,
  Settings,
  LogOut,
  BarChart3,
  Menu,
} from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";
import { LogoWithText } from "@/components/shared/Logo";

interface SidebarProps {
  className?: string;
}

interface NavItem {
  icon: typeof LayoutDashboard;
  label: string;
  href: string;
}

const navItems: NavItem[] = [
  {
    icon: LayoutDashboard,
    label: "Tableau de bord",
    href: "/dashboard",
  },
  {
    icon: QrCode,
    label: "QR Code",
    href: "/qr-code",
  },
  {
    icon: Settings,
    label: "Convertisseur",
    href: "/converter",
  },
  {
    icon: BarChart3,
    label: "Statistiques",
    href: "/stats",
  },
];

export function Sidebar({ className }: SidebarProps) {
  const [activeItem, setActiveItem] = useState("/dashboard");
  const isMobile = useIsMobile();
  const [isOpen, setIsOpen] = useState(false);

  // Mettre à jour isOpen quand le mode mobile change
  useEffect(() => {
    setIsOpen(!isMobile);
  }, [isMobile]);

  return (
    <>
      {isMobile && (
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="fixed top-4 left-4 z-50 p-2 bg-primary text-white rounded-lg shadow-lg hover:bg-primary/90 transition-colors"
        >
          <Menu className="w-6 h-6" />
        </button>
      )}
      <AnimatePresence>
        {(!isMobile || isOpen) && (
          <motion.aside
            initial={{ x: isMobile ? -320 : 0 }}
            animate={{ x: 0 }}
            exit={{ x: -320 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className={cn(
              "w-64 min-h-screen bg-card/50 backdrop-blur-sm border-r border-border/50 relative group/sidebar",
              isMobile && "fixed left-0 top-0 z-40 shadow-xl",
              className
            )}>
            {/* Background gradient effect */}
            <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-accent/5 opacity-0 group-hover/sidebar:opacity-100 transition-opacity duration-500" />

            {/* Logo section */}
            <motion.div 
              className="p-6 relative"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="space-y-2">
                <LogoWithText size="sm" />
                <p className="text-sm text-muted-foreground">Espace Agent</p>
              </div>
            </motion.div>

            {/* Navigation */}
            <nav className="px-4 py-2 relative space-y-1">
              {navItems.map((item, index) => (
                <motion.button
                  key={item.href}
                  className={cn(
                    "flex items-center w-full px-4 py-2.5 text-sm rounded-lg transition-all duration-200",
                    "hover:bg-accent/10 active:scale-[0.98]",
                    activeItem === item.href ? "bg-accent/15 text-primary font-medium" : "text-muted-foreground"
                  )}
                  onClick={() => {
                    setActiveItem(item.href);
                    if (isMobile) setIsOpen(false);
                  }}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                >
                  <item.icon className="w-4 h-4" />
                  <span className="ml-3">{item.label}</span>
                  {activeItem === item.href && (
                    <motion.div
                      className="absolute left-0 w-1 h-6 bg-primary rounded-full"
                      layoutId="activeIndicator"
                      transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    />
                  )}
                </motion.button>
              ))}

              {/* Logout button */}
              <motion.button
                className="flex items-center w-full px-4 py-2.5 mt-8 text-sm text-red-500 rounded-lg
                           hover:bg-red-500/10 active:scale-[0.98] transition-all duration-200"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: navItems.length * 0.1 }}
              >
                <LogOut className="w-4 h-4" />
                <span className="ml-3">Déconnexion</span>
              </motion.button>
            </nav>
          </motion.aside>
        )}
      </AnimatePresence>
    </>
  );
}
