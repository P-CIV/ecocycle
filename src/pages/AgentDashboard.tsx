import { Package, TrendingUp, Award, Calendar } from "lucide-react";
import { StatCard } from "@/components/agent/interface/tableau-de-bord/StatCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { useEffect, useState } from "react";
import { collection, query, orderBy, limit, onSnapshot } from "firebase/firestore";
import { db } from "@/config/firebase";
import { useAuth } from "@/contexts/AuthContext";
import { useRealtimeStats } from "@/hooks/useRealtimeStats";

interface Agent {
  id: string;
  rank: number;
  name: string;
  points: number;
  isMe: boolean;
}

const AgentDashboard = () => {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { currentUser } = useAuth();
  const { stats, loading: statsLoading, error: statsError } = useRealtimeStats();

  // Afficher un message d'erreur si les stats ne peuvent pas être chargées
  if (statsError) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <div className="text-lg font-semibold text-red-500 mb-2">
          Erreur de chargement des données
        </div>
        <div className="text-muted-foreground text-center">
          {statsError}
        </div>
        <button
          onClick={() => window.location.reload()}
          className="mt-4 px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90"
        >
          Réessayer
        </button>
      </div>
    );
  }

  useEffect(() => {
    // Création d'une requête pour obtenir les agents triés par points
    const agentsQuery = query(
      collection(db, "agents"),
      orderBy("points", "desc"),
      limit(10)
    );

    // Écouter les changements en temps réel
    const unsubscribe = onSnapshot(agentsQuery, (snapshot) => {
      const agentsData = snapshot.docs.map((doc, index) => {
        const data = doc.data();
        return {
          id: doc.id,
          rank: index + 1,
          name: data.name,
          points: data.points || 0,
          isMe: doc.id === currentUser?.uid
        };
      });
      setAgents(agentsData);
      setIsLoading(false);
    });

    // Nettoyer l'abonnement lors du démontage du composant
    return () => unsubscribe();
  }, [currentUser]);

  return (
    <div className="space-y-6">
        {/* En-tête avec message de bienvenue */}
        <div>
          <h2 className="text-3xl font-bold text-foreground">Bienvenue</h2>
          <p className="text-muted-foreground mt-1">Voici votre performance du mois</p>
        </div>

        {/* Cartes de statistiques */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Collectes ce mois"
            value={`${stats?.collectesMois || 0} kg`}
            icon={Package}
            trend={{ value: 0, isPositive: true }}
            loading={statsLoading}
          />
          <StatCard
            title="Points gagnés"
            value={`${stats?.pointsGagnes || 0}`}
            icon={Award}
            trend={{ value: 0, isPositive: true }}
            description="10 points/kg"
            loading={statsLoading}
          />
          <StatCard
            title="Taux de réussite"
            value={`${(stats?.tauxReussite || 0).toFixed(1)}%`}
            icon={TrendingUp}
            trend={{ value: 0, isPositive: true }}
            loading={statsLoading}
          />
          <StatCard
            title="Collectes aujourd'hui"
            value={`${stats?.collectesAujourdhui || 0}`}
            icon={Calendar}
            description="Objectif: 15 collectes"
            loading={statsLoading}
          />
        </div>

        {/* Graphiques */}
        <div className="grid gap-6 md:grid-cols-2">
          {/* Évolution des collectes */}
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle>Évolution des Collectes (6 mois)</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300} minWidth={200}>
                <LineChart data={stats?.evolutionCollectes || []} style={{ minWidth: '0' }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="mois" stroke="hsl(var(--muted-foreground))" />
                  <YAxis stroke="hsl(var(--muted-foreground))" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "var(--radius)",
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="kg"
                    stroke="hsl(var(--primary))"
                    strokeWidth={2}
                    dot={{ fill: "hsl(var(--primary))", r: 4 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="points"
                    stroke="hsl(var(--secondary))"
                    strokeWidth={2}
                    dot={{ fill: "hsl(var(--secondary))", r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Performance hebdomadaire */}
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle>Performance Hebdomadaire</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300} minWidth={200}>
                <BarChart data={stats?.performanceHebdo || []} style={{ minWidth: '0' }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="jour" stroke="hsl(var(--muted-foreground))" />
                  <YAxis stroke="hsl(var(--muted-foreground))" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "var(--radius)",
                    }}
                  />
                  <Bar dataKey="collectes" fill="hsl(var(--primary))" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Statistiques Détaillées */}
        <div className="space-y-4">
          <div>
            <h3 className="text-2xl font-semibold mb-2">Statistiques Détaillées</h3>
            <p className="text-muted-foreground">Analyse approfondie de vos performances</p>
          </div>
          
          <div className="grid gap-6 md:grid-cols-3">
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle className="text-lg">Total année</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="text-3xl font-bold text-primary">
                    {stats?.totalAnnee?.kg || 0} kg
                  </div>
                  <p className="text-sm text-muted-foreground">Depuis janvier 2025</p>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-card">
              <CardHeader>
                <CardTitle className="text-lg">Points accumulés</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="text-3xl font-bold text-primary">
                    {stats?.totalAnnee?.points || 0}
                  </div>
                  <p className="text-sm text-muted-foreground">Total des points</p>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-card">
              <CardHeader>
                <CardTitle className="text-lg">Moyenne mensuelle</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="text-3xl font-bold text-primary">
                    {stats?.moyenneMensuelle?.kg || 0} kg
                  </div>
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-green-500" />
                    <span className="text-sm text-green-500">
                      +{(stats?.moyenneMensuelle?.evolution || 0).toFixed(1)}%
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle>Répartition par Type</CardTitle>
              </CardHeader>
              <CardContent>
                {statsLoading ? (
                  <div className="flex items-center justify-center h-[300px]">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={stats?.repartitionParType || []}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="type" stroke="hsl(var(--muted-foreground))" />
                      <YAxis stroke="hsl(var(--muted-foreground))" />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "hsl(var(--card))",
                          border: "1px solid hsl(var(--border))",
                          borderRadius: "var(--radius)",
                        }}
                      />
                      <Bar dataKey="quantite" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>

            <Card className="shadow-card">
              <CardHeader>
                <CardTitle>Comparaison avec l'Équipe</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm font-medium">Votre position</span>
                      <span className="text-primary font-bold">
                        {stats?.comparaisonEquipe?.position || '-'} / {stats?.comparaisonEquipe?.total || '-'}
                      </span>
                    </div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm font-medium">Écart avec le 1er</span>
                      <span className={stats?.comparaisonEquipe?.ecartPremier && stats?.comparaisonEquipe?.ecartPremier > 0 ? 'text-red-500' : 'text-green-500'}>
                        {stats?.comparaisonEquipe?.ecartPremier || 0} kg
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm font-medium">Par rapport à la moyenne</span>
                      <span className={`${stats?.comparaisonEquipe?.ecartMoyenne ? (stats.comparaisonEquipe.ecartMoyenne > 0 ? 'text-green-500' : 'text-red-500') : 'text-muted-foreground'}`}>
                        {stats?.comparaisonEquipe?.ecartMoyenne !== undefined && (stats.comparaisonEquipe.ecartMoyenne > 0 ? '+' : '')}{stats?.comparaisonEquipe?.ecartMoyenne ?? 0}%
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Classement et objectifs */}
        <div className="grid gap-6 md:grid-cols-2">
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle>Classement de l'Équipe</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {isLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  </div>
                ) : agents.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    Aucun agent classé pour le moment
                  </div>
                ) : (
                  agents.map((agent) => (
                    <div
                    key={agent.rank}
                    className={`flex items-center justify-between p-3 rounded-lg ${
                      agent.isMe ? "bg-primary/10 border border-primary/20" : "bg-muted/30"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`h-8 w-8 rounded-full flex items-center justify-center font-bold ${
                          agent.rank === 1
                            ? "bg-yellow-500 text-yellow-950"
                            : agent.rank === 2
                            ? "bg-gray-400 text-gray-950"
                            : "bg-orange-600 text-orange-950"
                        }`}
                      >
                        {agent.rank}
                      </div>
                      <span className={agent.isMe ? "font-semibold text-foreground" : "text-foreground"}>
                        {agent.name}
                      </span>
                    </div>
                    <span className="font-semibold text-primary">{agent.points} pts</span>
                    </div>
                  )))}
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-card">
            <CardHeader>
              <CardTitle>Objectifs du Mois</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {statsLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  </div>
                ) : (
                  <>
                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="text-sm font-medium text-foreground">
                          Collectes ({stats?.collectesMois || 0}/300 kg)
                        </span>
                        <span className="text-sm text-muted-foreground">
                          {Math.min(100, Math.round((stats?.collectesMois || 0) / 300 * 100))}%
                        </span>
                      </div>
                      <div className="h-3 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary rounded-full transition-all duration-500"
                          style={{ width: `${Math.min(100, Math.round((stats?.collectesMois || 0) / 300 * 100))}%` }}
                        />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="text-sm font-medium text-foreground">
                          Points ({stats?.pointsGagnes || 0}/3000)
                        </span>
                        <span className="text-sm text-muted-foreground">
                          {Math.min(100, Math.round((stats?.pointsGagnes || 0) / 3000 * 100))}%
                        </span>
                      </div>
                      <div className="h-3 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary rounded-full transition-all duration-500"
                          style={{ width: `${Math.min(100, Math.round((stats?.pointsGagnes || 0) / 3000 * 100))}%` }}
                        />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="text-sm font-medium text-foreground">
                          Taux de réussite ({(stats?.tauxReussite || 0).toFixed(1)}/100%)
                        </span>
                        <span className="text-sm text-muted-foreground">
                          {Math.min(100, Math.round(stats?.tauxReussite || 0))}%
                        </span>
                      </div>
                      <div className="h-3 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary rounded-full transition-all duration-500"
                          style={{ width: `${Math.min(100, Math.round(stats?.tauxReussite || 0))}%` }}
                        />
                      </div>
                    </div>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
};

export default AgentDashboard;
