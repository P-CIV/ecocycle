import { Users, Package, Award, TrendingUp } from "lucide-react";
import { StatCard } from "@/components/admin/interface/tableau-de-bord/StatCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AgentDetailsModal } from "@/components/admin/interface/tableau-de-bord/AgentDetailsModal";
import { RealtimeNotifications } from "@/components/admin/interface/tableau-de-bord/RealtimeNotifications";
import { ExportButton } from "@/components/admin/interface/tableau-de-bord/ExportButton";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  AreaChart, 
  Area, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell, 
  Legend,
  LineChart,
  Line,
  ScatterChart,
  Scatter,
  type PieLabelRenderProps 
} from "recharts";
import { useState, useEffect } from "react";
import { collection, query, where, Timestamp, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { formatNumber, formatDate, formatPercent, formatKg } from "@/lib/utils";
import { PeriodFilter } from "@/components/admin/interface/tableau-de-bord/PeriodFilter";
import { 
  processCollectesData, 
  processTypesDistribution,
  processPerformanceByZone,
  type CollecteMensuelle,
  type AgentPerformance,
  type TypeDistribution,
  type Collecte,
  type ZonePerformance
} from "@/utils/dashboardUtils";

const COLORS = [
  "hsl(var(--chart-1))",
  "hsl(var(--chart-2))",
  "hsl(var(--chart-3))",
  "hsl(var(--chart-4))",
  "hsl(var(--chart-5))",
];

const AdminDashboard = () => {
  const [collectesGlobales, setCollectesGlobales] = useState<CollecteMensuelle[]>([]);
  const [performanceEquipe, setPerformanceEquipe] = useState<AgentPerformance[]>([]);
  const [repartitionTypes, setRepartitionTypes] = useState<TypeDistribution[]>([]);
  const [performanceZones, setPerformanceZones] = useState<ZonePerformance[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState<"7d" | "30d" | "6m">("30d");
  const [selectedAgentId, setSelectedAgentId] = useState<string | null>(null);
  const [showNotifications, setShowNotifications] = useState<boolean>(false);
  const [agents, setAgents] = useState<Array<any>>([]);
  const [activeTab, setActiveTab] = useState("overview");

  // Platform start date for fresh view
  const [platformStartDate, setPlatformStartDate] = useState<Date | null>(() => {
    try {
      const raw = localStorage.getItem("platformStartDate");
      return raw ? new Date(raw) : null;
    } catch {
      return null;
    }
  });

  useEffect(() => {
    // Setup real-time listeners
    const agentsRef = collection(db, "agents");
    const unsubAgents = onSnapshot(agentsRef, snapshot => {
      let list: any[] = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      if (platformStartDate) {
        list = list.filter(a => a.dateInscription && (a.dateInscription.seconds * 1000) >= platformStartDate.getTime());
      }
      setAgents(list);
    }, err => console.error("Agents snapshot error:", err));

    // Collectes listener with period filter
    const collectesRef = collection(db, 'collectes');
    const startDate = new Date();
    switch (selectedPeriod) {
      case "7d":
        startDate.setDate(startDate.getDate() - 7);
        break;
      case "30d":
        startDate.setDate(startDate.getDate() - 30);
        break;
      case "6m":
        startDate.setMonth(startDate.getMonth() - 6);
        break;
    }

    const effectiveStart = platformStartDate && platformStartDate > startDate ? platformStartDate : startDate;
    const collectesQuery = query(
      collectesRef,
      where('date', '>=', Timestamp.fromDate(effectiveStart))
    );

    const unsubCollectes = onSnapshot(collectesQuery, snapshot => {
      const collectes = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

      try {
        // Process data for different views
        const collectesByMonth = processCollectesData(collectes as Collecte[]);
        setCollectesGlobales(collectesByMonth);
        
        const typesData = processTypesDistribution(collectes as Collecte[]);
        setRepartitionTypes(typesData);
        
        const zonesData = processPerformanceByZone(collectes as Collecte[], agents);
        setPerformanceZones(zonesData);

        // Compute performance per agent
        const mapAgg: Record<string, { collectes: number; kg: number; points: number }> = {};
        for (const c of collectes as any[]) {
          const aid = c.agentId || 'unknown';
          if (!mapAgg[aid]) mapAgg[aid] = { collectes: 0, kg: 0, points: 0 };
          mapAgg[aid].collectes += 1;
          mapAgg[aid].kg += Number(c.kg || 0);
          mapAgg[aid].points += Number(c.points || 0);
        }

        const perf = Object.entries(mapAgg).map(([agentId, agg]) => {
          const a = agents.find((x: any) => x.id === agentId) || { nom: 'Inconnu' };
          return {
            agent: a.nom || a.name || 'Inconnu',
            agentId,
            collectes: agg.collectes,
            kg: agg.kg,
            points: agg.points
          } as AgentPerformance;
        });

          perf.sort((a, b) => (Number(b.collectes) || 0) - (Number(a.collectes) || 0));
        setPerformanceEquipe(perf.slice(0, 10));
        
        setLastUpdated(new Date());
        setLoading(false);
      } catch (err) {
        console.error('Error processing collectes snapshot', err);
        setLoading(false);
      }
    }, err => console.error('Collectes snapshot error:', err));

    return () => {
      unsubAgents();
      unsubCollectes();
    };
  }, [selectedPeriod, platformStartDate]);

  const renderKPICards = () => (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <StatCard
        title="Total Collectes"
        value={loading ? "..." : formatKg(collectesGlobales.reduce((s, m) => s + (m.kg || 0), 0))}
        icon={Package}
        className="bg-gradient-to-r from-emerald-400 to-teal-500 text-white"
        iconBg="bg-white/20"
        description={loading ? "Chargement..." : `Cette ${selectedPeriod === "7d" ? "semaine" : selectedPeriod === "30d" ? "mois" : "période"}`}
      />

      <StatCard
        title="Agents Actifs"
        value={loading ? "..." : formatNumber(performanceEquipe.length)}
        icon={Users}
        className="bg-gradient-to-r from-indigo-500 to-violet-500 text-white"
        iconBg="bg-white/20"
        description={loading ? "Chargement..." : `Sur ${formatNumber(agents.length)} agents`}
      />

      <StatCard
        title="Points Distribués"
        value={
          loading
            ? "..."
            : (() => {
                const totalPoints = performanceEquipe.reduce((s, a) => s + (a.points || 0), 0);
                return formatNumber(totalPoints || collectesGlobales.reduce((s, m) => s + (m.kg || 0), 0) * 10);
              })()
        }
        icon={Award}
        className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white"
        iconBg="bg-white/20"
        description={loading ? "Chargement..." : "Cette période"}
      />

      <StatCard
        title="Croissance"
        value={
          loading
            ? "..."
            : (() => {
                if (collectesGlobales.length < 2) return "N/A";
                const last = collectesGlobales[collectesGlobales.length - 1].kg || 0;
                const prev = collectesGlobales[collectesGlobales.length - 2].kg || 0;
                if (prev === 0) return "N/A";
                const pct = ((last - prev) / prev) * 100;
                return formatPercent(pct);
              })()
        }
        icon={TrendingUp}
        className="bg-gradient-to-r from-pink-500 to-rose-500 text-white"
        iconBg="bg-white/20"
        description={loading ? "Chargement..." : "vs période précédente"}
      />
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Notifications en temps réel */}
      <RealtimeNotifications enabled={showNotifications} />
      
      {/* Modal de détails agent */}
      <AgentDetailsModal
        agentId={selectedAgentId}
        onClose={() => setSelectedAgentId(null)}
      />

      {/* En-tête avec contrôles */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-foreground">Tableau de Bord Admin</h2>
          <p className="text-muted-foreground mt-1">Analyse complète et gestion des performances</p>
        </div>
        <div className="flex items-center gap-4">
          <PeriodFilter
            selectedPeriod={selectedPeriod}
            onPeriodChange={setSelectedPeriod}
          />
          <div className="flex items-center gap-2">
            <Button size="sm" variant="outline" onClick={() => {
              const now = new Date();
              setPlatformStartDate(now);
              try { localStorage.setItem('platformStartDate', now.toISOString()); } catch {}
            }}>
              Démarrer plateforme
            </Button>
            <Button size="sm" variant="ghost" onClick={() => {
              setPlatformStartDate(null);
              try { localStorage.removeItem('platformStartDate'); } catch {}
            }}>
              Réinitialiser vue
            </Button>
            <div className="flex items-center gap-2">
              <Switch checked={showNotifications} onCheckedChange={setShowNotifications} />
              <span className="text-sm">Notifications</span>
            </div>
          </div>
        </div>
      </div>

      {/* KPIs principaux */}
      {renderKPICards()}

      {/* Contenu principal avec onglets */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Vue Globale</TabsTrigger>
          <TabsTrigger value="zones">Par Zone</TabsTrigger>
          <TabsTrigger value="team">Équipe</TabsTrigger>
          <TabsTrigger value="analytics">Analyses</TabsTrigger>
        </TabsList>

        {/* Vue Globale */}
        <TabsContent value="overview" className="space-y-6">
          <Card className="shadow-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div>
                <CardTitle>Évolution des Collectes</CardTitle>
                <div className="text-xs text-muted-foreground">
                  {lastUpdated ? `Mise à jour: ${formatDate(lastUpdated)}` : "Mise à jour: -"}
                </div>
              </div>
              <ExportButton
                data={collectesGlobales.map(c => ({
                  mois: c.mois,
                  kg_collectes: c.kg,
                  nombre_collectes: c.nombre
                }))}
                filename="evolution_collectes"
                disabled={loading || collectesGlobales.length === 0}
              />
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <AreaChart data={collectesGlobales}>
                  <defs>
                    <linearGradient id="colorKg" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                    </linearGradient>
                  </defs>
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
                  <Area
                    type="monotone"
                    dataKey="kg"
                    stroke="hsl(var(--primary))"
                    strokeWidth={3}
                    fill="url(#colorKg)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <div className="grid gap-6 lg:grid-cols-2">
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle>Types de Déchets</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={repartitionTypes}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={(props: PieLabelRenderProps) => {
                        const payload = props.payload as unknown as TypeDistribution;
                        return `${payload.type}: ${payload.valeur}%`;
                      }}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="valeur"
                    >
                      {repartitionTypes.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card className="shadow-card">
              <CardHeader>
                <CardTitle>Activité Récente</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {performanceEquipe.slice(0, 5).map((agent, index) => (
                    <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                      <div>
                        <p className="font-medium">{agent.agent}</p>
                        <p className="text-sm text-muted-foreground">{formatKg(Number(agent.kg) || 0)} collectés</p>
                      </div>
                      <span className="text-sm font-medium text-primary">{agent.points || 0} pts</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Vue par Zones */}
        <TabsContent value="zones" className="space-y-6">
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle>Performance par Zone Géographique</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={performanceZones}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="zone" stroke="hsl(var(--muted-foreground))" />
                  <YAxis stroke="hsl(var(--muted-foreground))" />
                  <Tooltip />
                  <Bar dataKey="kg" fill="hsl(var(--primary))" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <div className="grid gap-4 md:grid-cols-5">
            {performanceZones.map((zone) => (
              <Card key={zone.zone} className="shadow-card">
                <CardContent className="pt-6">
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground mb-2">{zone.zone}</p>
                    <p className="text-2xl font-bold text-primary">{formatKg(Number(zone.kg) || 0)}</p>
                    <p className="text-sm text-muted-foreground mt-2">{zone.agents} agents</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Vue Équipe */}
        <TabsContent value="team" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-3">
            <Card className="shadow-card">
              <CardContent className="pt-6">
                <div className="text-center">
                  <p className="text-sm text-muted-foreground mb-2">Effectif actuel</p>
                  <p className="text-4xl font-bold text-foreground">{agents.length}</p>
                  <p className="text-sm text-primary mt-2">
                    {agents.length > 0 ? `+${agents.length}` : "Aucun"} depuis {platformStartDate ? formatDate(platformStartDate) : "le début"}
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-card">
              <CardContent className="pt-6">
                <div className="text-center">
                  <p className="text-sm text-muted-foreground mb-2">Agents Actifs</p>
                  <p className="text-4xl font-bold text-primary">{performanceEquipe.length}</p>
                  <p className="text-sm text-muted-foreground mt-2">Cette période</p>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-card">
              <CardContent className="pt-6">
                <div className="text-center">
                  <p className="text-sm text-muted-foreground mb-2">Moyenne par Agent</p>
                  <p className="text-4xl font-bold text-primary">
                    {loading ? "..." : formatKg(collectesGlobales.reduce((s, m) => s + (m.kg || 0), 0) / (performanceEquipe.length || 1))}
                  </p>
                  <p className="text-sm text-muted-foreground mt-2">kg/agent</p>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="shadow-card">
            <CardHeader>
              <CardTitle>Liste des Agents</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                {agents.map((agent) => (
                  <div
                    key={agent.id}
                    className="p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors cursor-pointer"
                    onClick={() => setSelectedAgentId(agent.id)}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-medium">{agent.nom || agent.name}</p>
                        <p className="text-sm text-muted-foreground">Zone: {agent.zone || "Non assignée"}</p>
                        <p className="text-sm text-muted-foreground">
                          Inscrit: {agent.dateInscription ? formatDate(new Date(agent.dateInscription.seconds * 1000)) : "—"}
                        </p>
                      </div>
                      <Button variant="ghost" size="sm" onClick={(e) => {
                        e.stopPropagation();
                        setSelectedAgentId(agent.id);
                      }}>
                        Détails
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Vue Analyses */}
        <TabsContent value="analytics" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle>Taux de Réussite par Agent</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={performanceEquipe} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" />
                    <YAxis dataKey="agent" type="category" width={120} />
                    <Tooltip />
                    <Bar dataKey="kg" fill="hsl(var(--primary))" radius={[0, 8, 8, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card className="shadow-card">
              <CardHeader>
                <CardTitle>Points vs Collectes</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                    <CartesianGrid />
                    <XAxis type="number" dataKey="collectes" name="collectes" unit=" col." />
                    <YAxis type="number" dataKey="points" name="points" unit=" pts" />
                    <Tooltip cursor={{ strokeDasharray: '3 3' }} />
                    <Scatter name="Agents" data={performanceEquipe} fill="hsl(var(--primary))" />
                  </ScatterChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          <Card className="shadow-card">
            <CardHeader>
              <CardTitle>Évolution des Performances</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={collectesGlobales}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="mois" />
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <Tooltip />
                  <Legend />
                  <Line yAxisId="left" type="monotone" dataKey="kg" stroke="hsl(var(--primary))" />
                  <Line yAxisId="right" type="monotone" dataKey="nombre" stroke="hsl(var(--secondary))" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminDashboard;