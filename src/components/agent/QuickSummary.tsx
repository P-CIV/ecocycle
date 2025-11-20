import { Trophy, Star, Target } from "lucide-react";

interface QuickSummaryProps {
  totalCollectes: number;
  pointsTotal: number;
  objectifMois: number;
}

export const QuickSummary = ({ totalCollectes, pointsTotal, objectifMois }: QuickSummaryProps) => {
  const progression = (totalCollectes / objectifMois) * 100;

  return (
    <div className="quick-summary-card rounded-xl p-6 bg-gradient-to-br from-emerald-500 via-teal-600 to-cyan-700 text-white shadow-lg hover-card glass-effect">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center backdrop-blur-md">
            <Trophy className="h-5 w-5 text-yellow-300 floating" />
          </div>
          Résumé du Mois
        </h3>
        <div className="px-3 py-1 rounded-full bg-white/10 backdrop-blur-sm text-xs font-medium">
          {new Date().toLocaleDateString('fr-FR', { month: 'long' })}
        </div>
      </div>
      
      <div className="grid grid-cols-3 gap-4">
        <div className="p-4 rounded-xl bg-white/10 backdrop-blur-sm hover:bg-white/20 transition-all">
          <div className="flex items-center justify-center mb-3">
            <div className="w-12 h-12 rounded-lg bg-yellow-500/20 flex items-center justify-center">
              <Star className="h-6 w-6 text-yellow-300 floating" />
            </div>
          </div>
          <div className="text-2xl font-bold text-center">{totalCollectes}</div>
          <div className="text-xs text-center text-emerald-100">Collectes</div>
        </div>
        
        <div className="p-4 rounded-xl bg-white/10 backdrop-blur-sm hover:bg-white/20 transition-all">
          <div className="flex items-center justify-center mb-3">
            <div className="w-12 h-12 rounded-lg bg-emerald-500/20 flex items-center justify-center">
              <Trophy className="h-6 w-6 text-emerald-300 floating" />
            </div>
          </div>
          <div className="text-2xl font-bold text-center">{pointsTotal}</div>
          <div className="text-xs text-center text-emerald-100">Points</div>
        </div>
        
        <div className="p-4 rounded-xl bg-white/10 backdrop-blur-sm hover:bg-white/20 transition-all">
          <div className="flex items-center justify-center mb-3">
            <div className="w-12 h-12 rounded-lg bg-cyan-500/20 flex items-center justify-center">
              <Target className="h-6 w-6 text-cyan-300 floating" />
            </div>
          </div>
          <div className="text-2xl font-bold text-center">{progression.toFixed(0)}%</div>
          <div className="text-xs text-center text-emerald-100">Objectif</div>
        </div>
      </div>

      {/* Barre de progression améliorée */}
      <div className="mt-6 space-y-3">
        <div className="w-full h-3 bg-white/10 rounded-full overflow-hidden backdrop-blur-sm">
          <div 
            className="h-full rounded-full transition-all duration-500 relative bg-gradient-to-r from-emerald-300 via-emerald-400 to-cyan-400"
            style={{ width: `${Math.min(progression, 100)}%` }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent animate-shimmer"></div>
          </div>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-emerald-100">{totalCollectes} collectes</span>
          <span className="text-emerald-100 font-medium">Objectif: {objectifMois}</span>
        </div>
      </div>
    </div>
  );
};
