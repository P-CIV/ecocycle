import { Users, Mail, Phone, Award, TrendingUp, AlertCircle, Loader2, Calendar, MapPin, Target, X } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import { useEquipeStats } from "@/hooks/useEquipeStats";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { motion, AnimatePresence } from "framer-motion";

const Equipe = () => {
  const { stats, loading, error } = useEquipeStats();
  const [recherche, setRecherche] = useState("");
  const [agentSelectionne, setAgentSelectionne] = useState<any>(null);

  const agentsFiltres = stats.agents.filter((agent) =>
    (agent.nom || '').toLowerCase().includes(recherche.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-3">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-muted-foreground">Chargement des agents...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between bg-gradient-to-r from-indigo-600 via-purple-500 to-pink-500 rounded-xl p-8 text-white shadow-lg">
        <div>
          <h2 className="text-3xl font-bold">👥 Gestion de l'Équipe</h2>
          <p className="text-purple-100 mt-1">Gérez vos agents et suivez leurs performances</p>
        </div>
        <Button className="shadow-elegant bg-white text-purple-600 hover:bg-purple-50">
          <Users className="mr-2 h-4 w-4" />
          Nouvel Agent
        </Button>
      </div>

      {/* Statistiques d'équipe */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="bg-gradient-to-br from-indigo-400 to-blue-500 border-0 shadow-lg text-white hover:shadow-xl transition-all">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-lg bg-white/20 flex items-center justify-center">
                <Users className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-white/90">Total Agents</p>
                <p className="text-2xl font-bold text-white">{stats.totalAgents}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-cyan-400 to-teal-500 border-0 shadow-lg text-white hover:shadow-xl transition-all">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-lg bg-white/20 flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-white/90">Actifs</p>
                <p className="text-2xl font-bold text-white">{stats.agentsActifs}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-emerald-400 to-green-500 border-0 shadow-lg text-white hover:shadow-xl transition-all">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-lg bg-white/20 flex items-center justify-center">
                <Award className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-white/90">Moy. Points</p>
                <p className="text-2xl font-bold text-white">{stats.pointsMoyens.toLocaleString('fr-FR')}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-amber-400 to-orange-500 border-0 shadow-lg text-white hover:shadow-xl transition-all">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-lg bg-white/20 flex items-center justify-center">
                <Award className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-white/90">Total Points</p>
                <p className="text-2xl font-bold text-white">{stats.totalPoints.toLocaleString('fr-FR')}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recherche */}
      <Card className="shadow-card bg-gradient-to-r from-slate-50 to-slate-100">
        <CardContent className="pt-6">
          <Input
            placeholder="Rechercher un agent..."
            value={recherche}
            onChange={(e) => setRecherche(e.target.value)}
            className="max-w-md"
          />
        </CardContent>
      </Card>

      {/* Message d'erreur */}
      {error && (
        <Card className="shadow-card border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3 text-red-700">
              <AlertCircle className="h-5 w-5" />
              <p>Erreur lors du chargement des agents: {error.message}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Liste des agents vide */}
      {!error && stats.totalAgents === 0 && (
        <Card className="shadow-card border-yellow-200 bg-yellow-50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3 text-yellow-700">
              <AlertCircle className="h-5 w-5" />
              <p>Aucun agent trouvé. Commencez par ajouter un nouvel agent.</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Liste des agents */}
      {stats.totalAgents > 0 && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {agentsFiltres.length > 0 ? (
            agentsFiltres.map((agent) => (
              <Card key={agent.id} className="shadow-card hover:shadow-elegant transition-smooth">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-12 w-12">
                        <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                          {agent.initiales}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <CardTitle className="text-lg">{agent.nom}</CardTitle>
                        <p className="text-sm text-muted-foreground">Zone {agent.zone}</p>
                      </div>
                    </div>
                    <Badge variant={agent.statut === "actif" ? "default" : "secondary"}>
                      {agent.statut === "actif" ? "Actif" : "Inactif"}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    {agent.email && (
                      <div className="flex items-center gap-2 text-sm">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                        <span className="text-muted-foreground">{agent.email}</span>
                      </div>
                    )}
                    {agent.tel && (
                      <div className="flex items-center gap-2 text-sm">
                        <Phone className="h-4 w-4 text-muted-foreground" />
                        <span className="text-muted-foreground">{agent.tel}</span>
                      </div>
                    )}
                  </div>

                  <div className="pt-3 border-t grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Points</p>
                      <p className="text-lg font-bold text-primary">{(agent.points || 0).toLocaleString('fr-FR')}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Collectes</p>
                      <p className="text-lg font-bold text-foreground">{agent.collectes || 0} kg</p>
                    </div>
                  </div>

                  <Button variant="outline" className="w-full" onClick={() => setAgentSelectionne(agent)}>
                    Voir Détails
                  </Button>
                </CardContent>
              </Card>
            ))
          ) : (
            <Card className="col-span-full shadow-card border-yellow-200 bg-yellow-50">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3 text-yellow-700">
                  <AlertCircle className="h-5 w-5" />
                  <p>Aucun agent ne correspond à votre recherche.</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Modal des détails de l'agent */}
      <AnimatePresence>
        {agentSelectionne && (
          <>
            {/* Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
              onClick={() => setAgentSelectionne(null)}
            />

            {/* Modal - Centré parfaitement */}
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                transition={{ type: "spring", damping: 20, stiffness: 300 }}
                className="w-full max-w-2xl max-h-[90vh] overflow-y-auto"
              >
                <Card className="shadow-2xl">
                  <CardHeader className="pb-4 border-b">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-12 w-12">
                        <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                          {agentSelectionne.initiales}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <CardTitle className="text-2xl">{agentSelectionne.nom}</CardTitle>
                        <p className="text-sm text-muted-foreground">
                          Zone {agentSelectionne.zone}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => setAgentSelectionne(null)}
                      className="p-2 hover:bg-muted rounded-lg transition-colors"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                </CardHeader>

                <CardContent className="pt-6 space-y-6">
                  {/* Statut */}
                  <div className="flex items-center justify-between pb-4 border-b">
                    <span className="text-sm text-muted-foreground">Statut</span>
                    <Badge variant={agentSelectionne.statut === "actif" ? "default" : "secondary"}>
                      {agentSelectionne.statut === "actif" ? "Actif" : "Inactif"}
                    </Badge>
                  </div>

                  {/* KPI Grid */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-card rounded-lg border border-border/50">
                      <div className="flex items-center gap-2 mb-2">
                        <Target className="w-4 h-4 text-primary" />
                        <p className="text-sm text-muted-foreground">Points Total</p>
                      </div>
                      <p className="text-2xl font-bold text-primary">
                        {(agentSelectionne.points || 0).toLocaleString('fr-FR')}
                      </p>
                    </div>

                    <div className="p-4 bg-card rounded-lg border border-border/50">
                      <div className="flex items-center gap-2 mb-2">
                        <Award className="w-4 h-4 text-primary" />
                        <p className="text-sm text-muted-foreground">Collectes (kg)</p>
                      </div>
                      <p className="text-2xl font-bold text-primary">
                        {(agentSelectionne.collectes || agentSelectionne.kg || 0).toLocaleString('fr-FR')}
                      </p>
                    </div>

                    <div className="p-4 bg-card rounded-lg border border-border/50">
                      <div className="flex items-center gap-2 mb-2">
                        <TrendingUp className="w-4 h-4 text-primary" />
                        <p className="text-sm text-muted-foreground">Moy. par collecte</p>
                      </div>
                      <p className="text-2xl font-bold text-primary">
                        {agentSelectionne.totalCollectes ? 
                          ((agentSelectionne.collectes || 0) / agentSelectionne.totalCollectes).toFixed(2) 
                          : '0'} kg
                      </p>
                    </div>

                    <div className="p-4 bg-card rounded-lg border border-border/50">
                      <div className="flex items-center gap-2 mb-2">
                        <MapPin className="w-4 h-4 text-primary" />
                        <p className="text-sm text-muted-foreground">Zone assignée</p>
                      </div>
                      <p className="text-2xl font-bold text-primary">
                        {agentSelectionne.zone || 'N/A'}
                      </p>
                    </div>
                  </div>

                  {/* Informations de contact */}
                  <div className="space-y-3 pt-2 border-t">
                    <h4 className="font-semibold text-sm">Informations de contact</h4>
                    
                    {agentSelectionne.email && (
                      <div className="flex items-center gap-3 p-3 bg-muted/30 rounded border border-border/50">
                        <Mail className="w-4 h-4 text-muted-foreground" />
                        <div>
                          <p className="text-xs text-muted-foreground mb-1">Email</p>
                          <p className="text-sm">{agentSelectionne.email}</p>
                        </div>
                      </div>
                    )}

                    {agentSelectionne.tel && (
                      <div className="flex items-center gap-3 p-3 bg-muted/30 rounded border border-border/50">
                        <Phone className="w-4 h-4 text-muted-foreground" />
                        <div>
                          <p className="text-xs text-muted-foreground mb-1">Téléphone</p>
                          <p className="text-sm">{agentSelectionne.tel}</p>
                        </div>
                      </div>
                    )}

                    {!agentSelectionne.email && !agentSelectionne.tel && (
                      <p className="text-sm text-muted-foreground italic">Aucune information de contact</p>
                    )}
                  </div>

                  {/* Dates */}
                  <div className="space-y-3 pt-2 border-t">
                    <h4 className="font-semibold text-sm">Historique</h4>
                    
                    {agentSelectionne.dateInscription && (
                      <div className="flex items-center gap-3 p-3 bg-muted/30 rounded border border-border/50">
                        <Calendar className="w-4 h-4 text-muted-foreground" />
                        <div>
                          <p className="text-xs text-muted-foreground mb-1">Date d'inscription</p>
                          <p className="text-sm">
                            {format(agentSelectionne.dateInscription.toDate?.() || new Date(), 'dd MMMM yyyy', { locale: fr })}
                          </p>
                        </div>
                      </div>
                    )}

                    {agentSelectionne.dernièreActivité && (
                      <div className="flex items-center gap-3 p-3 bg-muted/30 rounded border border-border/50">
                        <TrendingUp className="w-4 h-4 text-muted-foreground" />
                        <div>
                          <p className="text-xs text-muted-foreground mb-1">Dernière activité</p>
                          <p className="text-sm">
                            {format(agentSelectionne.dernièreActivité.toDate?.() || new Date(), 'dd MMMM yyyy à HH:mm', { locale: fr })}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 pt-2 border-t">
                    <Button onClick={() => setAgentSelectionne(null)} className="flex-1">
                      Fermer
                    </Button>
                  </div>
                </CardContent>
                </Card>
              </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Equipe;
