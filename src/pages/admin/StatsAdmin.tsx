import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from "recharts";
import { Package, TrendingUp, Award, Users, AlertCircle } from "lucide-react";
import { StatCard } from "@/components/admin/interface/tableau-de-bord/StatCard";
import { collection, onSnapshot, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useState, useEffect } from 'react';
import { subMonths, format } from 'date-fns';
import { fr } from 'date-fns/locale';

const COLORS = [
  'hsl(var(--primary))',
  'hsl(var(--secondary))',
  'hsl(var(--accent))',
  'hsl(var(--muted))',
];

interface StatsData {
  totalCollectes: number;
  totalAgents: number;
  totalPoints: number;
  croissance: number; collectesParMois: Array<{
    mois: string; collectes: number;
    kg: number;
  }>;
  repartitionTypes: Array<{
    type: string;
    value: number;
  }>;
}

const StatsAdmin = () => {
  const [stats, setStats] = useState<StatsData>({
    totalCollectes: 0,
    totalAgents: 0,
    totalPoints: 0,
    croissance: 0, collectesParMois: [],
    repartitionTypes: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // 📊 Setup real-time listeners
    const agentsRef = collection(db, 'agents');
    const collectesRef = collection(db, 'collectes');

    const unsubAgents = onSnapshot(agentsRef, () => { console.log('👥 Agents updated');
      updateStats();
    });

    const unsubCollectes = onSnapshot(collectesRef, () => { console.log('♻️ Collectes updated');
      updateStats();
    });

    // Initial fetch
    updateStats();

    return () => {
      unsubAgents();
      unsubCollectes();
    };
  }, []);

  const updateStats = async () => {
    try {
      setLoading(true);

      // Fetch agents and collectes
      const agentsRef = collection(db, 'agents');
      const collectesRef = collection(db, 'collectes');

      const agentsSnapshot = await new Promise<any>((resolve) => {
        const unsub = onSnapshot(agentsRef, resolve);
        setTimeout(() => unsub(), 5000);
      });

      const collectesSnapshot = await new Promise<any>((resolve) => {
        const unsub = onSnapshot(collectesRef, resolve);
        setTimeout(() => unsub(), 5000);
      });

      // Initialize 6 months of data
      const monthlyData: { [key: string]: { collectes: number; kg: number } } = {};
      for (let i = 5; i >= 0; i--) {
        const month = subMonths(new Date(), i);
        const monthKey = format(month, 'MMM yy', { locale: fr });
        monthlyData[monthKey] = { collectes: 0, kg: 0 };
      }

      // Calculate statistics
      const typeCount: { [key: string]: number } = {};
      let totalKg = 0;
      let totalPoints = 0; collectesSnapshot.forEach((doc: any) => {
        const data = doc.data();

        try {
          // Parse date properly
          let date: Date;
          if (data.date instanceof Timestamp) {
            date = data.date.toDate();
          } else if (typeof data.date === 'string') {
            date = new Date(data.date);
          } else if (typeof data.date === 'number') {
            date = new Date(data.date);
          } else {
            date = new Date();
          }

          // Parse kg (handle both kg and quantite)
          const kg = parseFloat(data.kg || data.quantite || 0) || 0;
          const type = data.type || 'Autre';
          const points = parseFloat(data.points || 0) || 0;

          // Group by month
          const monthKey = format(date, 'MMM yy', { locale: fr });
          if (monthlyData[monthKey]) {
            monthlyData[monthKey].collectes += 1;
            monthlyData[monthKey].kg += kg;
          }

          // Count by type
          typeCount[type] = (typeCount[type] || 0) + 1;

          totalKg += kg;
          totalPoints += points; console.log(`📈 Collecte: ${type} - ${kg}kg`);
        } catch (e) { console.error('❌ Error processing collecte:', e, data);
        }
      });

      // Format monthly data (ensure chronological order)
      const collectesParMois = Object.entries(monthlyData)
        .map(([mois, data]) => ({
          mois, collectes: data.collectes,
          kg: Math.round(data.kg * 100) / 100,
        }))
        .sort((a, b) => {
          const dateA = new Date(a.mois);
          const dateB = new Date(b.mois);
          return dateA.getTime() - dateB.getTime();
        });

      // Calculate growth
      let croissance = 0;
      if (collectesParMois.length >= 2) {
        const lastMonth = collectesParMois[collectesParMois.length - 1];
        const previousMonth = collectesParMois[collectesParMois.length - 2];
        if (previousMonth.kg > 0) {
          croissance = ((lastMonth.kg - previousMonth.kg) / previousMonth.kg) * 100;
        }
      }

      // Format type data
      const total = Object.values(typeCount).reduce((a, b) => a + b, 0) || 1;
      const repartitionTypes = Object.entries(typeCount)
        .sort((a, b) => b[1] - a[1])
        .map(([type, count]) => ({
          type,
          value: Math.round((count / total) * 100),
        })); console.log('🏆 Final Stats:', {
        totalCollectes: collectesSnapshot.size,
        totalAgents: agentsSnapshot.size,
        totalKg,
        totalPoints,
        croissance,
        monthlyDataLength: collectesParMois.length,
        typeDataLength: repartitionTypes.length,
      });

      setStats({
        totalCollectes: collectesSnapshot.size,
        totalAgents: agentsSnapshot.size,
        totalPoints,
        croissance, collectesParMois,
        repartitionTypes,
      });

      setLoading(false);
    } catch (err) { console.error('❌ Erreur lors de la récupération des statistiques:', err);
      setError('Impossible de charger les statistiques');
      setLoading(false);
    }
  }

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
      <div className="bg-gradient-to-r from-emerald-600 via-teal-500 to-cyan-500 rounded-xl p-8 text-white shadow-lg">
        <h2 className="text-3xl font-bold">📊 Statistiques Détaillées</h2>
        <p className="text-emerald-100 mt-1">Vue d'ensemble des performances</p>
      </div>

      {/* KPIs */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Collectes"
          value={`${stats.totalCollectes}`}
          icon={Package}
          description="Depuis le début"
          className="bg-gradient-to-br from-orange-400 to-red-500"
        />
        <StatCard
          title="Agents Actifs"
          value={`${stats.totalAgents}`}
          icon={Users}
          description="Équipe actuelle"
          className="bg-gradient-to-br from-emerald-400 to-teal-500"
        />
        <StatCard
          title="Points Distribués"
          value={`${stats.totalPoints}`}
          icon={Award}
          description="Total cumulé"
          className="bg-gradient-to-br from-purple-400 to-pink-500"
        />
        <StatCard
          title="Croissance"
          value={`${stats.croissance.toFixed(1)}%`}
          icon={TrendingUp}
          className="bg-gradient-to-br from-blue-400 to-cyan-500"
          trend={{
            value: stats.croissance,
            isPositive: stats.croissance > 0
          }}
        />
      </div>

      {/* Graphiques */}
      <Card className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border-0 text-white shadow-lg">
        <CardHeader>
          <CardTitle className="text-white">♻️ Répartition par Type de Déchet</CardTitle>
        </CardHeader>
        <CardContent>
          {stats.repartitionTypes.length === 0 || stats.repartitionTypes.every(t => t.value === 0) ? (
            <div className="flex items-center justify-center h-[350px] text-slate-400">
              <div className="text-center">
                <AlertCircle className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p>Aucune donnée disponible</p>
              </div>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={350}>
              <PieChart>
                <Pie
                  data={stats.repartitionTypes}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={120}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ type, value }) => `${type} (${value}%)`}
                >
                  {stats.repartitionTypes.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value: any) => `${value}%`}
                  contentStyle={{
                    backgroundColor: 'rgba(30, 30, 30, 0.9)',
                    border: '1px solid rgba(255,255,255,0.2)',
                    borderRadius: '8px',
                    color: '#fff'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default StatsAdmin;