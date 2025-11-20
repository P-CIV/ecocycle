import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from "@/lib/utils";
import { useIsMobile } from '@/hooks/use-mobile';
import { 
  LayoutDashboard, 
  QrCode, 
  BarChart, 
  Repeat, 
  LogOut,
  Menu,
  Coins
} from 'lucide-react';
import { LogoWithText } from "@/components/shared/Logo";
import { Button } from '@/components/ui/button';


interface AgentLayoutProps {
  children: React.ReactNode;
}

export const AgentLayout = ({ children }: AgentLayoutProps) => {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const location = useLocation();
  const isMobile = useIsMobile();
  const [isOpen, setIsOpen] = useState(!isMobile);
  const menuItems = [
    {
      title: 'Tableau de bord',
      description: 'Aperçu global de vos activités',
      icon: <LayoutDashboard className="w-5 h-5" />,
      path: '/agent'
    },
    {
      title: 'QR Code',
      description: 'Scanner et gérer les codes QR',
      icon: <QrCode className="w-5 h-5" />,
      path: '/agent/qr-code'
    },
    {
      title: 'Convertisseur',
      description: 'Calculer les points et récompenses',
      icon: <Repeat className="w-5 h-5" />,
      path: '/agent/convertisseur'
    },
    {
      title: 'Statistiques',
      description: 'Analyser vos performances',
      icon: <BarChart className="w-5 h-5" />,
      path: '/agent/stats'
    },
    {
      title: 'Retrait de Bonus',
      description: 'Convertir vos points en argent',
      icon: <Coins className="w-5 h-5" />,
      path: '/agent/rewards'
    }
  ];

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header Mobile */}
      {isMobile && (
        <header className="fixed top-0 left-0 right-0 h-16 bg-white/80 backdrop-blur-md border-b z-40 px-4 flex items-center">
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
            aria-label="Menu"
          >
            <Menu className="w-6 h-6" />
          </button>
          <div className="ml-4">
            <LogoWithText size="sm" />
          </div>
        </header>
      )}
      
      <div className={cn(
        "flex",
        isMobile && "pt-16" // Ajoute un padding-top quand le header mobile est présent
      )}>
        {/* Sidebar améliorée */}
        <AnimatePresence>
          {(!isMobile || isOpen) && (
            <motion.aside 
              initial={{ x: -320, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -320, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className={cn(
                "w-64 min-h-screen bg-card/95 backdrop-blur-md border-r relative",
                isMobile && "fixed left-0 top-0 z-50 shadow-xl h-full"
              )}
            >
          {/* En-tête avec logo */}
          <div className="p-6 border-b bg-gradient-to-r from-emerald-500/20 via-teal-500/10 to-cyan-500/5 backdrop-blur-sm border-emerald-200/50">
            <div className="space-y-2">
              <LogoWithText size="md" />
              <p className="text-sm font-medium bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                Espace Agent
              </p>
            </div>
          </div>
          
          {/* Navigation principale */}
          <nav className="p-4 space-y-2">
            {menuItems.map((item) => (
              <Button
                key={item.path}
                variant={location.pathname === item.path ? "secondary" : "ghost"}
                className={cn(
                  "w-full justify-start gap-3 h-11 transition-all duration-200",
                  location.pathname === item.path 
                    ? "bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg hover:shadow-emerald-500/40 hover:from-emerald-600 hover:to-teal-600" 
                    : "text-muted-foreground hover:bg-emerald-500/10 hover:text-emerald-600"
                )}
                onClick={() => {
                  navigate(item.path);
                  if (isMobile) setIsOpen(false);
                }}
              >
                <div className={cn(
                  "transition-colors",
                  location.pathname === item.path ? "text-white" : "text-muted-foreground group-hover:text-emerald-600"
                )}>
                  {item.icon}
                </div>
                <span className="font-medium">{item.title}</span>
              </Button>
            ))}

            {/* Séparateur */}
            <div className="my-4 border-t border-gradient-to-r from-emerald-200/0 via-emerald-200/50 to-emerald-200/0" />

            {/* Bouton de déconnexion */}
            <Button
              variant="ghost"
              className="w-full justify-start gap-3 text-red-500 hover:text-white hover:bg-gradient-to-r hover:from-red-500 hover:to-rose-500 transition-all duration-200 font-medium"
              onClick={handleLogout}
            >
              <LogOut className="w-5 h-5" />
              <span className="font-medium">Déconnexion</span>
            </Button>
          </nav>
            </motion.aside>
          )}
        </AnimatePresence>

        {/* Contenu principal */}
        {/* Overlay pour mobile */}
        {isMobile && isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40"
            onClick={() => setIsOpen(false)}
          />
        )}

        <main className={cn(
          "flex-1 p-6 overflow-auto relative",
          isMobile && "ml-0"
        )}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            {children}
          </motion.div>
        </main>
      </div>
    </div>
  );
};
