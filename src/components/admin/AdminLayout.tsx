import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from "@/lib/utils";
import { useIsMobile } from '@/hooks/use-mobile';
import { 
  LayoutDashboard, 
  Users, 
  BarChart, 
  TrendingUp, 
  Settings, 
  LogOut,
  Menu,
  ClipboardList,
  Shield,
  Coins
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { LogoWithText } from '@/components/shared/Logo';

interface AdminLayoutProps {
  children: React.ReactNode;
}

export const AdminLayout = ({ children }: AdminLayoutProps) => {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const location = useLocation();
  const isMobile = useIsMobile();
  const [isOpen, setIsOpen] = useState(!isMobile);

  const menuItems = [
    {
      title: 'Tableau de bord',
      description: 'Vue d\'ensemble de l\'activité',
      icon: <LayoutDashboard className="w-5 h-5" />,
      path: '/admin'
    },
    {
      title: 'Gestion des équipes',
      description: 'Gérer les agents et leurs zones',
      icon: <Users className="w-5 h-5" />,
      path: '/admin/equipe'
    },
    {
      title: 'Statistiques globales',
      description: 'Analyse des performances',
      icon: <BarChart className="w-5 h-5" />,
      path: '/admin/stats'
    },
    {
      title: 'Tendances et rapports',
      description: 'Évolution et prévisions',
      icon: <TrendingUp className="w-5 h-5" />,
      path: '/admin/tendances'
    },
    {
      title: 'Validation des points',
      description: 'Vérification des collectes',
      icon: <ClipboardList className="w-5 h-5" />,
      path: '/admin/validation'
    },
    {
      title: 'Contrôle d\'accès',
      description: 'Gestion des permissions',
      icon: <Shield className="w-5 h-5" />,
      path: '/admin/access'
    },
    {
      title: 'Distribution de bonus',
      description: 'Récompenser les performances',
      icon: <Coins className="w-5 h-5" />,
      path: '/admin/distribute-points'
    },
    {
      title: 'Paramètres système',
      description: 'Configuration globale',
      icon: <Settings className="w-5 h-5" />,
      path: '/admin/settings'
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
        <header className="fixed top-0 left-0 right-0 h-16 bg-white/80 backdrop-blur-md border-b z-40 px-4 flex items-center shadow-md">
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
        isMobile && "pt-16"
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
                "w-64 min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 border-r border-slate-200 dark:border-slate-700 relative shadow-xl",
                isMobile && "fixed left-0 top-0 z-50 shadow-2xl h-full"
              )}
            >
              {/* En-tête avec logo */}
              <div className="p-6 border-b border-slate-200 dark:border-slate-700 bg-gradient-to-r from-blue-500/10 via-cyan-500/10 to-teal-500/5 backdrop-blur-sm">
                <div className="space-y-2">
                  <LogoWithText size="md" />
                  <p className="text-sm font-medium bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                    Console d'administration
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
                      "w-full justify-start gap-3 h-12 transition-all duration-200",
                      location.pathname === item.path 
                        ? "bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-lg hover:shadow-blue-500/40 hover:from-blue-600 hover:to-cyan-600" 
                        : "text-slate-700 dark:text-slate-300 hover:bg-blue-500/10 hover:text-blue-600 dark:hover:text-blue-400"
                    )}
                    onClick={() => {
                      navigate(item.path);
                      if (isMobile) setIsOpen(false);
                    }}
                  >
                    <div className={cn(
                      "transition-colors flex-shrink-0",
                      location.pathname === item.path ? "text-white" : "text-slate-600 dark:text-slate-400 group-hover:text-blue-600"
                    )}>
                      {item.icon}
                    </div>
                    <div className="flex flex-col items-start">
                      <span className="font-medium text-sm">{item.title}</span>
                      <span className={cn(
                        "text-xs",
                        location.pathname === item.path ? "text-blue-100" : "text-slate-500 dark:text-slate-400"
                      )}>{item.description}</span>
                    </div>
                  </Button>
                ))}

                {/* Séparateur */}
                <div className="my-4 border-t border-gradient-to-r from-slate-200/0 via-slate-300 to-slate-200/0 dark:via-slate-600" />

                {/* Bouton de déconnexion */}
                <Button
                  variant="ghost"
                  className="w-full justify-start gap-3 h-11 text-red-500 dark:text-red-400 hover:text-white hover:bg-gradient-to-r hover:from-red-500 hover:to-rose-500 transition-all duration-200 font-medium"
                  onClick={handleLogout}
                >
                  <LogOut className="w-5 h-5 flex-shrink-0" />
                  <span className="font-medium">Déconnexion</span>
                </Button>
              </nav>
            </motion.aside>
          )}
        </AnimatePresence>

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

        {/* Contenu principal */}
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
