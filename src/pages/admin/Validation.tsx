import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import { useValidationStats } from '@/hooks/useValidationStats';

const Validation = () => {
  const { data: stats, loading, error } = useValidationStats();

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-red-600 via-orange-500 to-yellow-500 rounded-xl p-8 text-white shadow-lg">
        <h2 className="text-3xl font-bold">✅ Validation des Points</h2>
        <p className="text-red-100 mt-1">Vérification et approbation des collectes</p>
      </div>

      {loading && (
        <Card className="shadow-card bg-gradient-to-r from-slate-100 to-slate-200">
          <CardContent className="flex items-center justify-center py-12">
            <div className="text-center">
              <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2 text-primary" />
              <p className="text-muted-foreground">Chargement...</p>
            </div>
          </CardContent>
        </Card>
      )}

      {error && (
        <Card className="border-red-300 bg-red-50 shadow-lg">
          <CardContent className="pt-6">
            <p className="text-red-700 font-semibold">Erreur: {error.message}</p>
          </CardContent>
        </Card>
      )}

      {!loading && !error && (
        <div className="grid gap-4 md:grid-cols-4">
          <Card className="bg-gradient-to-br from-slate-400 to-gray-500 border-0 shadow-lg text-white">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-white/90">Total</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{stats.totalCollectes}</div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-amber-400 to-yellow-500 border-0 shadow-lg text-white">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-white/90">En attente</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{stats.collectesPending}</div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-emerald-400 to-green-500 border-0 shadow-lg text-white">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-white/90">Approuvées</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{stats.collectesApproved}</div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-red-400 to-rose-500 border-0 shadow-lg text-white">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-white/90">Rejetées</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{stats.collectesRejected}</div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default Validation;
