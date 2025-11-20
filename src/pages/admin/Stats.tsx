import { Package, TrendingUp, Award, Calendar } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { useEffect, useState } from "react";
import { collection, query, where, orderBy, Timestamp, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";

// Types pour les données
interface StatsData {
  mois: string;
  kg: number;
  collectes: number;
}

const Stats = () => {
  const [statsData, setStatsData] = useState<StatsData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Récupérer les 6 derniers mois de données
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

        const collectesRef = collection(db, "collectes");
        const collectesQuery = query(
          collectesRef,
          where("date", ">=", Timestamp.fromDate(sixMonthsAgo)),
          orderBy("date", "desc")
        );

        const snapshot = await getDocs(collectesQuery);
        const months = ["Jan", "Fév", "Mar", "Avr", "Mai", "Juin", "Juil", "Août", "Sep", "Oct", "Nov", "Déc"];
        
        // Initialiser les données pour les 6 derniers mois
        const initialData: { [key: string]: StatsData } = {};
        for (let i = 5; i >= 0; i--) {
          const date = new Date();
          date.setMonth(date.getMonth() - i);
          const monthKey = months[date.getMonth()];
          initialData[monthKey] = { mois: monthKey, kg: 0, collectes: 0 };
        }

        // Agréger les données
        snapshot.docs.forEach(doc => {
          const data = doc.data();
          const date = data.date.toDate();
          const monthKey = months[date.getMonth()];
          if (initialData[monthKey]) {
            initialData[monthKey].kg += data.kg || 0;
            initialData[monthKey].collectes += 1;
          }
        });

        setStatsData(Object.values(initialData));
        setLoading(false);
      } catch (err) {
        console.error("Erreur lors de la récupération des statistiques:", err);
        setError("Impossible de charger les statistiques");
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 rounded-lg bg-destructive/10 text-destructive">
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-foreground">Statistiques Globales</h2>
        <p className="text-muted-foreground mt-1">Vue d'ensemble des performances</p>
      </div>

      {/* KPIs */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Collecté</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {statsData.reduce((sum, stat) => sum + stat.kg, 0)} kg
            </div>
            <p className="text-xs text-muted-foreground">
              +{statsData[statsData.length - 1]?.kg || 0} kg ce mois
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Nombre de Collectes</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {statsData.reduce((sum, stat) => sum + stat.collectes, 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              +{statsData[statsData.length - 1]?.collectes || 0} ce mois
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Points Distribués</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {statsData.reduce((sum, stat) => sum + (stat.kg * 10), 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              +{(statsData[statsData.length - 1]?.kg || 0) * 10} ce mois
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Croissance</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {statsData.length > 1 
                ? Math.round(((statsData[statsData.length - 1].kg - statsData[statsData.length - 2].kg) 
                    / statsData[statsData.length - 2].kg) * 100)
                : 0}%
            </div>
            <p className="text-xs text-muted-foreground">
              Par rapport au mois dernier
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Graphiques */}
      <Tabs defaultValue="collectes" className="space-y-4">
        <TabsList>
          <TabsTrigger value="collectes">Collectes</TabsTrigger>
          <TabsTrigger value="points">Points</TabsTrigger>
        </TabsList>

        <TabsContent value="collectes" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Évolution des Collectes</CardTitle>
            </CardHeader>
            <CardContent className="pt-2">
              <ResponsiveContainer width="100%" height={350}>
                <LineChart data={statsData}>
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
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="points" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Points Distribués</CardTitle>
            </CardHeader>
            <CardContent className="pt-2">
              <ResponsiveContainer width="100%" height={350}>
                <BarChart data={statsData}>
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
                  <Bar
                    dataKey="collectes"
                    fill="hsl(var(--primary))"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Stats;
