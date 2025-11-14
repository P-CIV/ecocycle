import { TrendingUp, Package, Award, Calendar } from "lucide-react";
import { StatCard } from "@/components/agent/interface/tableau-de-bord/StatCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useRealtimeStats } from "@/hooks/useRealtimeStats";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from "recharts";

interface TypeDeDechet {
  type: string;
  quantite: number;
}

const Stats = () => {
  const { stats, loading: statsLoading, error: statsError } = useRealtimeStats();

  // Afficher le chargement
  if (statsLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Afficher les erreurs
  if (statsError) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <div className="text-lg font-semibold text-red-500 mb-2"> Erreur de chargement des données
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

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-blue-600 via-cyan-500 to-teal-500 rounded-xl p-8 text-white shadow-lg">
        <h2 className="text-3xl font-bold">📊 Statistiques Détaillées</h2>
        <p className="text-blue-100 mt-1">Analyse approfondie de vos performances</p>
      </div>

      {/* KPIs principaux */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total année"
          value={`${stats?.totalAnnee?.kg || 0} kg`}
          icon={Package}
          description="Depuis janvier 2025"
          className="bg-gradient-to-br from-orange-400 to-red-500"
        />
        <StatCard
          title="Points accumulés"
          value={`${stats?.totalAnnee?.points || 0}`}
          icon={Award}
          description="Total des points"
          className="bg-gradient-to-br from-purple-400 to-pink-500"
        />
        <StatCard
          title="Moyenne mensuelle"
          value={`${stats?.moyenneMensuelle?.kg || 0} kg`}
          icon={TrendingUp}
          className="bg-gradient-to-br from-emerald-400 to-teal-500"
          trend={{ value: stats?.moyenneMensuelle?.evolution || 0, isPositive: true }}
        />
        <StatCard
          title="Jours actifs"
          value={`${stats?.joursActifs || 0}/${stats?.joursTotaux || 0}`}
          icon={Calendar}
          description={`Taux: ${((stats?.joursActifs || 0) / (stats?.joursTotaux || 1) * 100).toFixed(1)}%`}
          className="bg-gradient-to-br from-blue-400 to-cyan-500"
        />
      </div>

      {/* Onglets d'analyse */}
      <Tabs defaultValue="evolution" className="space-y-4">
        <TabsList>
          <TabsTrigger value="evolution">Évolution</TabsTrigger>
          <TabsTrigger value="types">Par Type</TabsTrigger>
          <TabsTrigger value="comparaison">Comparaison</TabsTrigger>
        </TabsList>

        <TabsContent value="evolution" className="space-y-4">
          <div className="grid gap-6 lg:grid-cols-2">
            <Card className="bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-200 shadow-lg">
              <CardHeader>
                <CardTitle className="text-blue-900">📈 Évolution des Collectes (kg)</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={stats?.evolutionCollectes || []}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.1)" />
                    <XAxis dataKey="mois" stroke="#0891b2" />
                    <YAxis stroke="#0891b2" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "rgba(255,255,255,0.95)",
                        border: "2px solid #0891b2",
                        borderRadius: "8px",
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="kg"
                      stroke="#0891b2"
                      strokeWidth={3}
                      dot={{ fill: "#0891b2", r: 5 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-emerald-50 to-teal-50 border-emerald-200 shadow-lg">
              <CardHeader>
                <CardTitle className="text-emerald-900">📊 Nombre de Collectes</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={stats?.evolutionCollectes || []}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.1)" />
                    <XAxis dataKey="mois" stroke="#059669" />
                    <YAxis stroke="#059669" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "rgba(255,255,255,0.95)",
                        border: "2px solid #059669",
                        borderRadius: "8px",
                      }}
                    />
                    <Bar dataKey="collectes" fill="#10b981" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="types" className="space-y-4">
          <div className="grid gap-6 lg:grid-cols-2">
            <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200 shadow-lg">
              <CardHeader>
                <CardTitle className="text-purple-900">🎯 Performance par Type de Déchet</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={350}>
                  <RadarChart data={stats?.repartitionParType || []}>
                    <PolarGrid stroke="rgba(0,0,0,0.1)" />
                    <PolarAngleAxis dataKey="type" stroke="#a855f7" />
                    <PolarRadiusAxis stroke="#a855f7" />
                    <Radar
                      name="Collectes"
                      dataKey="quantite"
                      stroke="#a855f7"
                      fill="#a855f7"
                      fillOpacity={0.5}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "rgba(255,255,255,0.95)",
                        border: "2px solid #a855f7",
                        borderRadius: "8px",
                      }}
                    />
                  </RadarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-orange-50 to-amber-50 border-orange-200 shadow-lg">
              <CardHeader>
                <CardTitle className="text-orange-900">📋 Répartition Détaillée</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {stats?.repartitionParType?.map((type: TypeDeDechet, index: number) => {
                    const maxQuantite = Math.max(...(stats?.repartitionParType?.map(t => t.quantite) || [0]));
                    return (
                      <div key={index} className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="font-medium text-orange-900">{type.type}</span>
                          <span className="text-orange-700 font-semibold">{type.quantite} collectes</span>
                        </div>
                        <div className="h-3 bg-orange-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-orange-400 to-amber-500 rounded-full transition-all"
                            style={{ width: `${(type.quantite / (maxQuantite || 1)) * 100}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="mt-6 p-4 rounded-lg bg-gradient-to-br from-orange-400 to-amber-500 text-white">
                  <p className="text-sm font-medium text-white/90 mb-1">Type le plus collecté</p>
                  {stats?.repartitionParType && stats.repartitionParType.length > 0 && (
                    <>
                      <p className="text-2xl font-bold text-white">
                        {stats.repartitionParType.reduce((max, type) => 
                          type.quantite > max.quantite ? type : max
                        ).type}
                      </p>
                      <p className="text-sm text-white/80">
                        {stats.repartitionParType.reduce((max, type) => 
                          type.quantite > max.quantite ? type : max
                        ).quantite} collectes ce mois
                      </p>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="comparaison" className="space-y-4">
          <Card className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border-0 text-white shadow-lg">
            <CardHeader>
              <CardTitle className="text-white">🏆 Comparaison avec la Moyenne de l'Équipe</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={350}>
                <BarChart data={stats?.evolutionCollectes?.slice(-2) || []}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                  <XAxis dataKey="periode" stroke="rgba(255,255,255,0.7)" />
                  <YAxis stroke="rgba(255,255,255,0.7)" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "rgba(15, 23, 42, 0.95)",
                      border: "1px solid rgba(255,255,255,0.2)",
                      borderRadius: "8px",
                      color: "#fff"
                    }}
                  />
                  <Bar dataKey="moi" fill="#60a5fa" radius={[8, 8, 0, 0]} name="Vous" />
                  <Bar dataKey="moyenne" fill="#22d3ee" radius={[8, 8, 0, 0]} name="Moyenne équipe" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <div className="grid gap-4 md:grid-cols-3">
            <Card className="bg-gradient-to-br from-purple-400 to-pink-500 border-0 shadow-lg text-white">
              <CardContent className="pt-6">
                <div className="text-center">
                  <p className="text-sm text-white/90 mb-2">Votre position</p>
                  <p className="text-4xl font-bold text-white">
                    {stats?.comparaisonEquipe?.position || '-'}
                    <span className="text-2xl">ème</span>
                  </p>
                  <p className="text-sm text-white/80 mt-2">
                    sur {stats?.comparaisonEquipe?.total || '-'} agents
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-amber-400 to-orange-500 border-0 shadow-lg text-white">
              <CardContent className="pt-6">
                <div className="text-center">
                  <p className="text-sm text-white/90 mb-2">Écart avec le 1er</p>
                  <p className={`text-4xl font-bold text-white`}>
                    {stats?.comparaisonEquipe?.ecartPremier ? 
                      `${stats.comparaisonEquipe.ecartPremier > 0 ? '+' : ''}${stats.comparaisonEquipe.ecartPremier}` : '0'} pts
                  </p>
                  <p className="text-sm text-white/80 mt-2">
                    {stats?.comparaisonEquipe?.ecartPremier === 0 ? '🥇 En tête !' :
                     stats?.comparaisonEquipe?.ecartPremier && stats.comparaisonEquipe.ecartPremier < 1000 ? '📈 Rattrapable !' : 
                     '💪 Continue tes efforts !'}
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-emerald-400 to-teal-500 border-0 shadow-lg text-white">
              <CardContent className="pt-6">
                <div className="text-center">
                  <p className="text-sm text-white/90 mb-2">Par rapport à la moyenne</p>
                  <p className={`text-4xl font-bold text-white`}>
                    {stats?.comparaisonEquipe?.ecartMoyenne !== undefined ? 
                      `${stats.comparaisonEquipe.ecartMoyenne > 0 ? '+' : ''}${stats.comparaisonEquipe.ecartMoyenne}%` : 
                      '0%'}
                  </p>
                  <p className="text-sm text-white/80 mt-2">
                    {stats?.comparaisonEquipe?.ecartMoyenne && stats.comparaisonEquipe.ecartMoyenne >= 20 ? '⭐ Excellent !' :
                     stats?.comparaisonEquipe?.ecartMoyenne && stats.comparaisonEquipe.ecartMoyenne > 0 ? '✅ Bien joué !' :
                     '💪 Continue tes efforts !'}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Stats;
