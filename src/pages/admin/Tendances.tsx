import { TrendingUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ComposedChart, Bar, Area } from "recharts";
import { Badge } from "@/components/ui/badge";

// Données de tendances
const tendancesTemporelles = [
  { jour: "Lun", collectes: 145, moyenne: 130 },
  { jour: "Mar", collectes: 160, moyenne: 135 },
  { jour: "Mer", collectes: 175, moyenne: 140 },
  { jour: "Jeu", collectes: 155, moyenne: 138 },
  { jour: "Ven", collectes: 180, moyenne: 145 },
  { jour: "Sam", collectes: 120, moyenne: 110 },
  { jour: "Dim", collectes: 85, moyenne: 80 },
];

const tendancesSaisonnieres = [
  { mois: "Jan", hiver: 4500, moyenne: 4200 },
  { mois: "Fév", hiver: 5200, moyenne: 4800 },
  { mois: "Mar", printemps: 6800, moyenne: 6200 },
  { mois: "Avr", printemps: 5900, moyenne: 5500 },
  { mois: "Mai", printemps: 7500, moyenne: 7000 },
  { mois: "Juin", ete: 8200, moyenne: 7800 },
];

const insights = [
  {
    type: "positif",
    titre: "Forte croissance du plastique",
    description: "Les collectes de plastique ont augmenté de 28% ce trimestre",
    impact: "+28%",
  },
  {
    type: "attention",
    titre: "Baisse le weekend",
    description: "Les collectes diminuent de 40% les samedis et dimanches",
    impact: "-40%",
  },
  {
    type: "positif",
    titre: "Pic en fin de semaine",
    description: "Les vendredis sont 24% plus productifs que la moyenne",
    impact: "+24%",
  },
  {
    type: "attention",
    titre: "Zone Ouest sous-performante",
    description: "La zone Ouest est 15% en dessous de la moyenne",
    impact: "-15%",
  },
];

const Tendances = () => {
  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-rose-600 via-pink-500 to-fuchsia-500 rounded-xl p-8 text-white shadow-lg">
        <h2 className="text-3xl font-bold">📈 Analyse des Tendances</h2>
        <p className="text-rose-100 mt-1">
          Identifiez les patterns et optimisez vos opérations
        </p>
      </div>

      {/* Insights clés */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {insights.map((insight, index) => {
          const gradients = [
            'bg-gradient-to-br from-blue-400 to-cyan-500',
            'bg-gradient-to-br from-amber-400 to-orange-500',
            'bg-gradient-to-br from-emerald-400 to-teal-500',
            'bg-gradient-to-br from-purple-400 to-pink-500',
          ];
          return (
            <Card key={index} className={`${gradients[index % 4]} border-0 shadow-lg text-white`}>
              <CardContent className="pt-6">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h4 className="font-semibold text-white mb-1">{insight.titre}</h4>
                    <p className="text-sm text-white/90">{insight.description}</p>
                  </div>
                </div>
                <Badge className="bg-white/20 text-white border-white/30">
                  {insight.impact}
                </Badge>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Analyses par onglets */}
      <Tabs defaultValue="temporelles" className="space-y-4">
        <TabsList>
          <TabsTrigger value="temporelles">Temporelles</TabsTrigger>
          <TabsTrigger value="saisonnieres">Saisonnières</TabsTrigger>
          <TabsTrigger value="types">Par Type</TabsTrigger>
        </TabsList>

        <TabsContent value="temporelles" className="space-y-4">
          <Card className="bg-gradient-to-br from-blue-900 to-cyan-900 border-0 text-white shadow-lg">
            <CardHeader>
              <CardTitle className="text-white">Tendances Hebdomadaires</CardTitle>
              <CardDescription className="text-blue-100">
                Comparaison des collectes quotidiennes avec la moyenne
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <ComposedChart data={tendancesTemporelles}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                  <XAxis dataKey="jour" stroke="rgba(255,255,255,0.7)" />
                  <YAxis stroke="rgba(255,255,255,0.7)" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "rgba(15, 23, 42, 0.95)",
                      border: "1px solid rgba(255,255,255,0.2)",
                      borderRadius: "8px",
                      color: "#fff"
                    }}
                  />
                  <Bar dataKey="collectes" fill="#60a5fa" radius={[8, 8, 0, 0]} />
                  <Line
                    type="monotone"
                    dataKey="moyenne"
                    stroke="#22d3ee"
                    strokeWidth={2}
                    strokeDasharray="5 5"
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <div className="grid gap-6 lg:grid-cols-2">
            <Card className="bg-gradient-to-br from-emerald-50 to-teal-50 border-emerald-200 shadow-lg">
              <CardHeader>
                <CardTitle className="text-emerald-900">🏆 Meilleurs Jours</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    { jour: "Vendredi", kg: 180, variation: "+24%" },
                    { jour: "Mercredi", kg: 175, variation: "+21%" },
                    { jour: "Mardi", kg: 160, variation: "+11%" },
                  ].map((jour, index) => (
                    <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-gradient-to-r from-emerald-400 to-teal-400 text-white font-semibold">
                      <div>
                        <p className="text-white">{jour.jour}</p>
                        <p className="text-sm text-emerald-50">{jour.kg} kg moyenne</p>
                      </div>
                      <Badge className="bg-white text-emerald-600">{jour.variation}</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-sky-50 to-blue-50 border-sky-200 shadow-lg">
              <CardHeader>
                <CardTitle className="text-sky-900">💡 Recommandations</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="p-3 rounded-lg bg-gradient-to-r from-pink-400 to-red-400 text-white border-pink-200">
                    <p className="font-medium text-white mb-1">Optimiser le weekend</p>
                    <p className="text-sm text-white/90">
                      Planifier des incitations pour augmenter les collectes du samedi/dimanche
                    </p>
                  </div>
                  <div className="p-3 rounded-lg bg-gradient-to-r from-purple-400 to-indigo-400 text-white border-purple-200">
                    <p className="font-medium text-white mb-1">Capitaliser sur le vendredi</p>
                    <p className="text-sm text-white/90">
                      Renforcer les équipes le vendredi pour maximiser la productivité
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="saisonnieres" className="space-y-4">
          <Card className="bg-gradient-to-br from-amber-50 to-orange-50 border-amber-200 shadow-lg">
            <CardHeader>
              <CardTitle className="text-amber-900">🌡️ Évolution Saisonnière</CardTitle>
              <CardDescription className="text-amber-800">Impact des saisons sur les volumes de collecte</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <ComposedChart data={tendancesSaisonnieres}>
                  <defs>
                    <linearGradient id="colorSaison" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f97316" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.1)" />
                  <XAxis dataKey="mois" stroke="#666" />
                  <YAxis stroke="#666" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "rgba(255,255,255,0.95)",
                      border: "1px solid #f97316",
                      borderRadius: "8px",
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="hiver"
                    stroke="#3b82f6"
                    fill="url(#colorSaison)"
                  />
                  <Area
                    type="monotone"
                    dataKey="printemps"
                    stroke="#10b981"
                    fill="url(#colorSaison)"
                  />
                  <Area type="monotone" dataKey="ete" stroke="#f97316" fill="url(#colorSaison)" />
                  <Line
                    type="monotone"
                    dataKey="moyenne"
                    stroke="#6b7280"
                    strokeWidth={2}
                    strokeDasharray="5 5"
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="types" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-5">
            {[
              { type: "Plastique", variation: "+28%", gradient: "from-blue-400 to-cyan-500" },
              { type: "Papier", variation: "+22%", gradient: "from-amber-400 to-orange-500" },
              { type: "Verre", variation: "+18%", gradient: "from-emerald-400 to-teal-500" },
              { type: "Polystyrène", variation: "+15%", gradient: "from-purple-400 to-pink-500" },
              { type: "Autres", variation: "+12%", gradient: "from-rose-400 to-red-500" },
            ].map((type, index) => (
              <Card key={index} className={`bg-gradient-to-br ${type.gradient} border-0 shadow-lg text-white`}>
                <CardContent className="pt-6">
                  <div className="text-center">
                    <p className="text-sm text-white/90 mb-2">{type.type}</p>
                    <div className="flex items-center justify-center gap-2">
                      <TrendingUp className="h-5 w-5 text-white" />
                      <p className="text-2xl font-bold text-white">
                        {type.variation}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Tendances;
