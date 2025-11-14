import { Users, Package, Award, AlertTriangle, Loader2, BarChart3 } from "lucide-react";
import { StatCard } from "@/components/admin/interface/tableau-de-bord/StatCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { PieLabelRenderProps } from "recharts";
import { useAdminDashboardStats } from "@/hooks/useAdminDashboardStats";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { useEffect } from "react";
import { initializeDemoData } from "@/utils/initializeDemoData";

// Couleurs des graphiques
const COLORS = [
  "hsl(var(--chart-1))",
  "hsl(var(--chart-2))",
  "hsl(var(--chart-3))",
  "hsl(var(--chart-4))",
  "hsl(var(--chart-5))",
];

const AdminDashboard = () => {
  const { stats, loading, error } = useAdminDashboardStats();

  // Initialiser les données de démonstration au premier chargement
  useEffect(() => {
    initializeDemoData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center space-y-4">
          <Loader2 className="w-8 h-8 animate-spin mx-auto" />
          <p className="text-muted-foreground">Chargement des données...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="shadow-card w-full max-w-md">
          <CardHeader>
            <div className="flex items-center space-x-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              <CardTitle>Erreur</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">{error.message}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 bg-gradient-to-br from-slate-50 via-blue-50 to-cyan-50 p-6 rounded-2xl">
      {/* En-tête avec gradient */}
      <div className="bg-gradient-to-r from-blue-600 via-cyan-500 to-teal-500 rounded-xl p-8 text-white shadow-lg">
        <h2 className="text-4xl font-bold">Tableau de Bord Admin</h2>
        <p className="text-blue-100 mt-2">Suivi des performances de collecte en temps réel</p>
      </div>

      {/* Firebase Status Check - MASQUÉ */}
      {/* <Card className="shadow-card">
        <CardHeader>
          <CardTitle>État de la Configuration</CardTitle>
        </CardHeader>
        <CardContent>
          <FirebaseStatusCheck />
        </CardContent>
      </Card> */}

      {/* KPIs Principaux avec couleurs dégradées */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Collectes"
          value={`${stats.totalCollectes}`}
          icon={Package}
          description="collectes enregistrées"
          className="bg-gradient-to-br from-orange-400 to-red-500"
        />
        <StatCard
          title="Poids Total"
          value={`${stats.totalKg} kg`}
          icon={BarChart3}
          description="collectés"
          className="bg-gradient-to-br from-blue-400 to-cyan-500"
        />
        <StatCard
          title="Agents Actifs"
          value={`${stats.agentsActifs}/${stats.totalAgents}`}
          icon={Users}
          description="agents en activité"
          className="bg-gradient-to-br from-green-400 to-emerald-500"
        />
        <StatCard
          title="Points Distribués"
          value={`${stats.pointsDistribues}`}
          icon={Award}
          description="points au total"
          className="bg-gradient-to-br from-purple-400 to-pink-500"
        />
      </div>

      {/* Graphique Evolution si données existent */}
      {stats.collectesParMois && stats.collectesParMois.length > 0 && 
       stats.collectesParMois.some(m => m.kg > 0) ? (
        <Card className="shadow-lg border-0 bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 text-white">
          <CardHeader>
            <CardTitle className="text-white">📈 Évolution des Collectes (6 mois)</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={stats.collectesParMois}>
                <defs>
                  <linearGradient id="colorKg" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis 
                  dataKey="mois" 
                  stroke="rgba(255,255,255,0.6)"
                  tickFormatter={(value) => format(new Date(value), 'MMM', { locale: fr })}
                />
                <YAxis stroke="rgba(255,255,255,0.6)" />
                <Tooltip
                  labelFormatter={(value) => format(new Date(value), 'MMMM yyyy', { locale: fr })}
                  contentStyle={{
                    backgroundColor: "rgba(15,23,42,0.9)",
                    border: "1px solid rgba(255,255,255,0.2)",
                    borderRadius: "var(--radius)",
                  }}
                  formatter={(value: number) => `${value} kg`}
                />
                <Area
                  type="monotone"
                  dataKey="kg"
                  stroke="#0ea5e9"
                  strokeWidth={3}
                  fill="url(#colorKg)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      ) : null}

      {/* Top Agents si données existent */}
      {stats.topAgents && stats.topAgents.length > 0 ? (
        <Card className="shadow-lg border-0 bg-gradient-to-br from-emerald-50 to-teal-50">
          <CardHeader>
            <CardTitle className="text-2xl text-emerald-900">🏆 Top 5 Meilleurs Collecteurs</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={stats.topAgents} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(16,185,129,0.1)" />
                <XAxis 
                  type="number" 
                  stroke="#10b981"
                  tickFormatter={(value) => `${value} kg`}
                />
                <YAxis 
                  dataKey="name" 
                  type="category" 
                  stroke="#10b981"
                  width={120}
                  tick={{ fontSize: 12 }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "rgba(255,255,255,0.95)",
                    border: "2px solid #10b981",
                    borderRadius: "var(--radius)",
                  }}
                  formatter={(value: number) => [`${value} kg`, 'Collectes']}
                />
                <Bar 
                  dataKey="collectes" 
                  fill="#10b981"
                  radius={[0, 8, 8, 0]} 
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      ) : null}

      {/* Répartition par type si données existent */}
      {stats.repartitionTypes && stats.repartitionTypes.length > 0 ? (
        <Card className="shadow-lg border-0 bg-gradient-to-br from-purple-50 to-pink-50">
          <CardHeader>
            <CardTitle className="text-2xl text-purple-900">♻️ Distribution par Type de Déchet</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={stats.repartitionTypes}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={(props: PieLabelRenderProps) => {
                    const payload = props.payload as { type: string; valeur: number };
                    return `${payload.type}: ${payload.valeur.toFixed(1)}%`;
                  }}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="valeur"
                >
                  {stats.repartitionTypes.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "rgba(255,255,255,0.95)",
                    border: "2px solid #a855f7",
                    borderRadius: "var(--radius)",
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      ) : null}

      {/* Message si pas de données */}
      {stats.totalCollectes === 0 && (
        <Card className="shadow-lg border-0 bg-gradient-to-br from-amber-50 to-orange-50">
          <CardHeader>
            <CardTitle className="text-amber-900">ℹ️ Aucune donnée disponible</CardTitle>
          </CardHeader>
          <CardContent className="text-amber-800">
            <p>Le dashboard attend que les agents commencent à enregistrer des collectes.</p>
            <p className="mt-2 text-sm">Une fois les premières collectes enregistrées, les graphes s'afficheront automatiquement.</p>
          </CardContent>
        </Card>
      )}

      {/* Résumé détaillé */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card className="shadow-lg border-0 bg-gradient-to-br from-blue-50 to-cyan-50">
          <CardHeader>
            <CardTitle className="text-2xl text-blue-900">📊 Statistiques du Mois</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex justify-between items-center p-3 rounded-lg bg-gradient-to-r from-orange-400 to-red-500 text-white font-semibold">
                <span>Total Collectes</span>
                <span className="text-lg">{stats.totalCollectes}</span>
              </div>
              <div className="flex justify-between items-center p-3 rounded-lg bg-gradient-to-r from-blue-400 to-cyan-500 text-white font-semibold">
                <span>Poids Total</span>
                <span className="text-lg">{stats.totalKg} kg</span>
              </div>
              <div className="flex justify-between items-center p-3 rounded-lg bg-gradient-to-r from-green-400 to-emerald-500 text-white font-semibold">
                <span>Moyenne par Collecte</span>
                <span className="text-lg">
                  {stats.totalCollectes > 0 ? (stats.totalKg / stats.totalCollectes).toFixed(1) : 0} kg
                </span>
              </div>
              <div className="flex justify-between items-center p-3 rounded-lg bg-gradient-to-r from-purple-400 to-pink-500 text-white font-semibold">
                <span>Croissance</span>
                <span className="text-lg">{stats.croissance > 0 ? '+' : ''}{stats.croissance.toFixed(1)}%</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-lg border-0 bg-gradient-to-br from-green-50 to-emerald-50">
          <CardHeader>
            <CardTitle className="text-2xl text-green-900">👥 Informations Équipe</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex justify-between items-center p-3 rounded-lg bg-gradient-to-r from-indigo-400 to-blue-500 text-white font-semibold">
                <span>Agents Total</span>
                <span className="text-lg">{stats.totalAgents}</span>
              </div>
              <div className="flex justify-between items-center p-3 rounded-lg bg-gradient-to-r from-cyan-400 to-teal-500 text-white font-semibold">
                <span>Agents Actifs</span>
                <span className="text-lg">{stats.agentsActifs}</span>
              </div>
              <div className="flex justify-between items-center p-3 rounded-lg bg-gradient-to-r from-yellow-400 to-orange-500 text-white font-semibold">
                <span>Points Distribués</span>
                <span className="text-lg">{stats.pointsDistribues}</span>
              </div>
              <div className="flex justify-between items-center p-3 rounded-lg bg-gradient-to-r from-rose-400 to-pink-500 text-white font-semibold">
                <span>Types Déchet</span>
                <span className="text-lg">{stats.repartitionTypes.length}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;
