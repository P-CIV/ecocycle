import { Package, TrendingUp, Award, Calendar, User, RefreshCw, Loader2 } from "lucide-react";
import { useEffect } from "react";
import "./AgentDashboard.css";
import "./AgentDashboard.animations.css";
import "@/styles/scrollbar.css";
import { useAuth } from "@/contexts/AuthContext";
import { useRealtimeStats } from "../../hooks/useRealtimeStats";
import { QuickSummary } from "@/components/agent/QuickSummary";
import { Timeline } from "@/components/agent/Timeline";
import { motion } from "framer-motion";
import { EnhancedQRManager } from '@/components/agent/EnhancedQRManager';
import { EnhancedCharts } from '@/components/agent/EnhancedCharts';
import '@/components/agent/enhanced-components.css';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { testFirebaseConnection } from '@/utils/firebaseTest';

const AgentDashboard = () => {
  const { user, userRole, loading: authLoading, displayName } = useAuth();
  const { stats, loading: statsLoading, error: statsError } = useRealtimeStats();

  console.log('AgentDashboard - Rendu initial');
  console.log('Auth - Loading:', authLoading);
  console.log('Stats - Loading:', statsLoading);
  console.log('User:', user?.email);
  console.log('UserRole:', userRole);
  console.log('Stats:', stats);
  console.log('Stats Error:', statsError);

  // Les données de debug sont affichées plus haut dans la console

  useEffect(() => {
    // Connexion testée au démarrage
    testFirebaseConnection().catch((error) => {
      console.log('Erreur connexion Firebase:', error);
    });
  }, [user?.uid]);

  if (!user || statsError) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        {!user && <p className="text-destructive">Erreur d'authentification. Veuillez vous reconnecter.</p>}
        {statsError && <p className="text-destructive">Erreur de chargement des données : {statsError}</p>}
        <Button variant="outline" onClick={() => window.location.reload()}>
          <RefreshCw className="w-4 h-4 mr-2" />
          Rafraîchir la page
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 agent-dashboard">
      {/* En-tête moderne avec statut intégré */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-gradient-to-r from-background via-muted/10 to-background rounded-xl border shadow-sm p-6 mb-6"
      >
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
                  <User className="h-6 w-6 text-primary" />
                </div>
                <div className="absolute -bottom-1 -right-1 h-4 w-4 rounded-full bg-green-500 border-2 border-background"></div>
              </div>
              <div>
                <h2 className="text-2xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                  Bienvenue, {displayName || user?.email?.split('@')[0] || 'Agent'}
                </h2>
                <p className="text-muted-foreground">
                  Tableau de bord de vos activités
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4 self-stretch md:self-center">
            <div className="h-8 w-px bg-border hidden md:block"></div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-xs">
                {/* Point coloré masqué */}
                {/* Système connecté masqué */}
              </div>
              <div className="flex flex-col items-end">
                <span className="text-sm font-medium">Dernière connexion</span>
                <span className="text-xs text-muted-foreground">
                  {new Date().toLocaleTimeString('fr-FR', { 
                    hour: '2-digit', 
                    minute: '2-digit'
                  })}
                </span>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Section des statistiques commence directement ici */}

      {/* Section des statistiques */}
      <motion.div 
        className="grid gap-4 md:grid-cols-2 lg:grid-cols-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
      >
        <motion.div
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="hover-card"
        >
          <Card className="p-6 space-y-2 bg-gradient-to-br from-blue-500 to-violet-600 text-white shadow-lg overflow-hidden relative">
            <div className="absolute inset-0 bg-gradient-to-r from-white/5 to-transparent opacity-50"></div>
            <div className="relative">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-white/10 rounded-xl backdrop-blur-sm">
                    <Package className="h-6 w-6 text-blue-200 floating" />
                  </div>
                  <span className="font-medium text-lg">Collectes ce mois</span>
                </div>
                <div className="flex items-center gap-1 px-3 py-1 bg-emerald-500/20 rounded-full backdrop-blur-sm">
                  <span className="text-xs font-semibold text-emerald-200">+15%</span>
                </div>
              </div>
              <div className="flex items-baseline gap-2 mt-4">
                <span className="text-3xl font-bold">{stats?.collectesMois || 0}</span>
                <span className="text-blue-200 font-medium">kg</span>
              </div>
            </div>
          </Card>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="hover-card"
        >
          <Card className="p-6 space-y-2 bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-lg overflow-hidden relative">
            <div className="absolute inset-0 bg-gradient-to-r from-white/5 to-transparent opacity-50"></div>
            <div className="relative">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-white/10 rounded-xl backdrop-blur-sm">
                    <Award className="h-6 w-6 text-emerald-200 floating" />
                  </div>
                  <span className="font-medium text-lg">Points gagnés</span>
                </div>
                <div className="flex items-center gap-1 px-3 py-1 bg-emerald-500/20 rounded-full backdrop-blur-sm">
                  <span className="text-xs font-semibold text-emerald-200">+8%</span>
                </div>
              </div>
              <div className="flex items-baseline gap-2 mt-4">
                <span className="text-3xl font-bold">{stats?.pointsGagnes || 0}</span>
                <span className="text-emerald-200 font-medium">points</span>
              </div>
            </div>
          </Card>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="hover-card"
        >
          <Card className="p-6 space-y-2 bg-gradient-to-br from-amber-500 to-orange-600 text-white shadow-lg overflow-hidden relative">
            <div className="absolute inset-0 bg-gradient-to-r from-white/5 to-transparent opacity-50"></div>
            <div className="relative">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-white/10 rounded-xl backdrop-blur-sm">
                    <TrendingUp className="h-6 w-6 text-amber-200 floating" />
                  </div>
                  <span className="font-medium text-lg">Taux de réussite</span>
                </div>
                <div className="flex items-center gap-1 px-3 py-1 bg-red-500/20 rounded-full backdrop-blur-sm">
                  <span className="text-xs font-semibold text-red-200">-2%</span>
                </div>
              </div>
              <div className="flex items-baseline gap-2 mt-4">
                <span className="text-3xl font-bold">{Math.round(stats?.tauxReussite || 0)}%</span>
              </div>
            </div>
          </Card>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="hover-card"
        >
          <Card className="p-6 space-y-2 bg-gradient-to-br from-purple-500 to-indigo-600 text-white shadow-lg overflow-hidden relative">
            <div className="absolute inset-0 bg-gradient-to-r from-white/5 to-transparent opacity-50"></div>
            <div className="relative">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-white/10 rounded-xl backdrop-blur-sm">
                    <Calendar className="h-6 w-6 text-purple-200 floating" />
                  </div>
                  <span className="font-medium text-lg">Collectes aujourd'hui</span>
                </div>
              </div>
              <div className="flex items-baseline gap-2 mt-4">
                <span className="text-3xl font-bold">{stats?.collectesAujourdhui || 0}</span>
                <span className="text-purple-200 font-medium">collectes</span>
              </div>
            </div>
          </Card>
        </motion.div>
      </motion.div>

      {/* Graphiques */}
      {/* Résumé rapide et activités récentes */}
      {authLoading || statsLoading ? (
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
        </div>
      ) : (
        <>
          {/* Section Résumé et Timeline */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="grid gap-6 md:grid-cols-2"
          >
            <QuickSummary 
              totalCollectes={stats?.collectesMois || 0}
              pointsTotal={stats?.pointsGagnes || 0}
              objectifMois={100}
            />
            
            <div className="h-[400px]"> {/* Hauteur fixe pour la chronologie */}
              <Timeline activities={stats?.activitesRecentes || []} />
            </div>
          </motion.div>

          {/* QR Code Manager */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
          >
            <EnhancedQRManager
              recentScans={stats?.scansRecents || []}
            />
          </motion.div>

          {/* Graphiques améliorés */}
          <EnhancedCharts
            collectesData={stats?.evolutionCollectes || []}
            performanceData={stats?.performanceHebdo || []}
          />
        </>
      )}
    </div>
  );
};

export default AgentDashboard;
