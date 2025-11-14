import { useState } from "react";
import { Calculator, ArrowRight, Zap, Gift } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

const Convertisseur = () => {
  const [kilos, setKilos] = useState<string>("");
  const [points, setPoints] = useState<number>(0);
  const tauxConversion = 10; // 10 points par kg

  const handleConvert = () => {
    const kg = parseFloat(kilos);
    if (!isNaN(kg) && kg > 0) {
      setPoints(kg * tauxConversion);
    }
  };



  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-blue-600 via-cyan-500 to-teal-500 rounded-xl p-8 text-white shadow-lg">
        <h2 className="text-3xl font-bold">💰 Convertisseur Kg → Points</h2>
        <p className="text-blue-100 mt-1"> Calculez vos points en fonction du poids collecté (1 kg = {tauxConversion} points)
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Convertisseur principal */}
        <Card className="shadow-card overflow-hidden bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
          <CardHeader className="bg-gradient-to-r from-blue-500/10 via-cyan-500/10 to-teal-500/5">
            <CardTitle className="flex items-center gap-2 text-blue-700 dark:text-blue-400">
              <Calculator className="h-5 w-5" /> Calculateur de Points
            </CardTitle>
            <CardDescription>
              Entrez le poids en kilogrammes pour calculer les points
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6 pt-6">
            <div className="space-y-2">
              <Label htmlFor="kilos" className="font-semibold text-slate-700 dark:text-slate-300">Poids collecté (kg)</Label>
              <Input
                id="kilos"
                type="number"
                placeholder="0"
                value={kilos}
                onChange={(e) => setKilos(e.target.value)}
                className="text-lg border-blue-200 dark:border-blue-800 focus:ring-blue-500"
                min="0"
                step="0.1"
              />
            </div>

            <Button 
              onClick={handleConvert} 
              className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white shadow-lg hover:shadow-xl transition-all" 
              size="lg"
            >
              Convertir <ArrowRight className="ml-2 h-4 w-4" />
            </Button>

            {points > 0 && (
              <div className="p-6 rounded-lg bg-gradient-to-br from-blue-400 to-cyan-500 text-white shadow-lg border-0 animate-fade-in">
                <p className="text-sm text-blue-100 mb-1">Points gagnés</p>
                <p className="text-5xl font-bold">✨ {points}</p>
                <p className="text-sm text-blue-100 mt-2">
                  Pour {parseFloat(kilos).toFixed(1)} kg collectés
                </p>
              </div>
            )}

            <div className="pt-4 border-t border-slate-200 dark:border-slate-700">
              <h4 className="font-semibold text-slate-700 dark:text-slate-300 mb-3">Échelle de conversion</h4>
              <div className="space-y-2">
                {[
                  { kg: 10, pts: 100 },
                  { kg: 25, pts: 250 },
                  { kg: 50, pts: 500 },
                  { kg: 100, pts: 1000 },
                ].map((tier) => (
                  <div key={tier.kg} className="flex justify-between p-3 rounded-lg bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-slate-800 dark:to-slate-700 border border-blue-200 dark:border-blue-800">
                    <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{tier.kg} kg</span>
                    <span className="text-sm font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">{tier.pts} points</span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>


      </div>

      {/* Informations supplémentaires */}
      <Card className="shadow-card overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-cyan-500/5">
          <CardTitle className="text-emerald-700 dark:text-emerald-400">📚 Comment ça marche ?</CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="grid gap-4 md:grid-cols-3">
            <div className="p-6 rounded-lg bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-900/20 dark:to-amber-900/20 border border-orange-200 dark:border-orange-800">
              <div className="h-12 w-12 rounded-full bg-gradient-to-br from-orange-400 to-amber-500 flex items-center justify-center mb-4 shadow-lg">
                <span className="text-xl font-bold text-white">1</span>
              </div>
              <h4 className="font-semibold text-orange-800 dark:text-orange-300 mb-2">⚖️ Pesez vos déchets</h4>
              <p className="text-sm text-orange-700 dark:text-orange-200">
                Utilisez une balance pour connaître le poids exact de votre collecte
              </p>
            </div>

            <div className="p-6 rounded-lg bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 border border-blue-200 dark:border-blue-800">
              <div className="h-12 w-12 rounded-full bg-gradient-to-br from-blue-400 to-cyan-500 flex items-center justify-center mb-4 shadow-lg">
                <Zap className="text-xl text-white font-bold" />
              </div>
              <h4 className="font-semibold text-blue-800 dark:text-blue-300 mb-2">⚡ Convertissez en points</h4>
              <p className="text-sm text-blue-700 dark:text-blue-200">
                Entrez le poids dans le convertisseur pour calculer vos points
              </p>
            </div>

            <div className="p-6 rounded-lg bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 border border-emerald-200 dark:border-emerald-800">
              <div className="h-12 w-12 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center mb-4 shadow-lg">
                <Gift className="text-xl text-white font-bold" />
              </div>
              <h4 className="font-semibold text-emerald-800 dark:text-emerald-300 mb-2">🎁 Accumulez des récompenses</h4>
              <p className="text-sm text-emerald-700 dark:text-emerald-200">
                Plus vous collectez, plus vous gagnez de points et de récompenses
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Convertisseur;
