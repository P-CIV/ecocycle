import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "next-themes";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import { useEffect } from "react";
import { setupDatabase } from "./utils/setupDatabase";
import { auth } from "./config/firebase";

// Pages publiques
import Index from "./pages/Index";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import NotFound from "./pages/NotFound";

// Pages Agent
import AgentDashboard from "./pages/agent/AgentDashboard";
import Convertisseur from "./pages/agent/Convertisseur";
import QrCode from "./pages/agent/QrCode";
import AgentStats from "./pages/agent/Stats";
import Rewards from "./pages/agent/Rewards";

// Pages Admin
import AdminDashboard from "./pages/AdminDashboard";
import Equipe from "./pages/admin/Equipe";
import AdminStats from "./pages/admin/StatsAdmin";
import Tendances from "./pages/admin/Tendances";
import Validation from "./pages/admin/Validation";
import Access from "./pages/admin/Access";
import Settings from "./pages/admin/Settings";
import DistributePoints from "./pages/admin/DistributePoints";

// Layouts spécifiques
import { AgentLayout } from "./components/agent/AgentLayout";
import { AdminLayout } from "./components/admin/AdminLayout";

const queryClient = new QueryClient();

const App = () => {
  useEffect(() => {
    const initApp = async () => {
      try {
        // Étape 1: Attendre que l'utilisateur soit chargé
        // On utilise une Promise pour s'assurer que Firebase Auth est prêt
        await new Promise((resolve) => {
          const unsubscribe = auth.onAuthStateChanged((user) => {
            unsubscribe();
            resolve(user);
          });
        });

        // Étape 2: Vérifier que Firebase est accessible
        const { testFirebaseConnection } = await import('./utils/testFirebase');
        const isConnected = await testFirebaseConnection();
        
        if (isConnected) { 
          
          // Étape 3: Vérifier si l'utilisateur est un admin
          const currentUser = auth.currentUser;
          if (currentUser?.email?.endsWith('@ecocycle.ci')) { 
            try {
              await setupDatabase(); 
            } catch (dbError) { console.error('Erreur lors de l\'initialisation de la base:', dbError);
              // L'app continue même si l'initialisation échoue
            }
          } else { 
          }
        } else { console.error('Erreur: Firebase n\'est pas accessible');
        }
      } catch (error) { console.error('Erreur au démarrage de l\'application:', error);
        // L'app continue même en cas d'erreur
      }
    };

    // Lance l'initialisation au démarrage
    initApp();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider attribute="class" defaultTheme="system">
        <AuthProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <Routes>
                {/* SECTION 1: Routes publiques - accessibles sans connexion */}

                <Route path="/" element={<Index />} />
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<Signup />} />
                
                {/* SECTION 2: Route de redirection après connexion */}
                <Route path="/dashboard" element={
                  <ProtectedRoute>
                    <Navigate to="/agent" replace />
                  </ProtectedRoute>
                } />
                
                {/* SECTION 3: Routes des AGENTS (collecteurs de déchets) */}

                <Route path="/agent" element={
                  <ProtectedRoute roles={["agent"]}>
                    <AgentLayout>
                      <AgentDashboard />
                    </AgentLayout>
                  </ProtectedRoute>
                } />
                <Route path="/agent/convertisseur" element={
                  <ProtectedRoute roles={["agent"]}>
                    <AgentLayout>
                      <Convertisseur />
                    </AgentLayout>
                  </ProtectedRoute>
                } />
                <Route path="/agent/qr-code" element={
                  <ProtectedRoute roles={["agent"]}>
                    <AgentLayout>
                      <QrCode />
                    </AgentLayout>
                  </ProtectedRoute>
                } />
                <Route path="/agent/stats" element={
                  <ProtectedRoute roles={["agent"]}>
                    <AgentLayout>
                      <AgentStats />
                    </AgentLayout>
                  </ProtectedRoute>
                } />
                <Route path="/agent/rewards" element={
                  <ProtectedRoute roles={["agent"]}>
                    <AgentLayout>
                      <Rewards />
                    </AgentLayout>
                  </ProtectedRoute>
                } />
                
                {/* SECTION 4: Routes des ADMINS (gestion et statistiques) */}

                <Route path="/admin" element={
                  <ProtectedRoute roles={["admin"]}>
                    <AdminLayout>
                      <AdminDashboard />
                    </AdminLayout>
                  </ProtectedRoute>
                } />
                <Route path="/admin/equipe" element={
                  <ProtectedRoute roles={["admin"]}>
                    <AdminLayout>
                      <Equipe />
                    </AdminLayout>
                  </ProtectedRoute>
                } />
                <Route path="/admin/stats" element={
                  <ProtectedRoute roles={["admin"]}>
                    <AdminLayout>
                      <AdminStats />
                    </AdminLayout>
                  </ProtectedRoute>
                } />
                <Route path="/admin/tendances" element={
                  <ProtectedRoute roles={["admin"]}>
                    <AdminLayout>
                      <Tendances />
                    </AdminLayout>
                  </ProtectedRoute>
                } />
                <Route path="/admin/validation" element={
                  <ProtectedRoute roles={["admin"]}>
                    <AdminLayout>
                      <Validation />
                    </AdminLayout>
                  </ProtectedRoute>
                } />
                <Route path="/admin/access" element={
                  <ProtectedRoute roles={["admin"]}>
                    <AdminLayout>
                      <Access />
                    </AdminLayout>
                  </ProtectedRoute>
                } />
                <Route path="/admin/settings" element={
                  <ProtectedRoute roles={["admin"]}>
                    <AdminLayout>
                      <Settings />
                    </AdminLayout>
                  </ProtectedRoute>
                } />
                <Route path="/admin/distribute-points" element={
                  <ProtectedRoute roles={["admin"]}>
                    <AdminLayout>
                      <DistributePoints />
                    </AdminLayout>
                  </ProtectedRoute>
                } />
                

                
                {/* SECTION 5: Route 404 - page non trouvée */}
                
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </TooltipProvider>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
};

export default App;
