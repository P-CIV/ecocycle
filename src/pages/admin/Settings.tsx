import { useState } from 'react';
import { useSystemSettings } from '@/hooks/useSystemSettings';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { 
  Settings as SettingsIcon,
  Save,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  Trash2,
  Plus,
  MapPin,
  Users,
  Coins,
  Package
} from 'lucide-react';
import { motion } from 'framer-motion';

export default function Settings() {
  const { settings, zones, loading, error, updateSettings, updateZone, loadSystemSettings } = useSystemSettings();
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  // État pour le formulaire des paramètres
  const [formData, setFormData] = useState({
    points_par_kg: settings?.points_par_kg ?? 10,
    bonus_mensuel: settings?.bonus_mensuel ?? 100,
    seuil_minimum_retrait: settings?.seuil_minimum_retrait ?? 1000,
  });

  // État pour les types de déchets
  const [newWasteType, setNewWasteType] = useState('');

  const handleSettingChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSaveSettings = async () => {
    try {
      setIsSaving(true);
      await updateSettings(formData);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (err) {
      console.error('Erreur:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddWasteType = async () => {
    if (!newWasteType.trim() || !settings) return;
    
    const newTypes = [...(settings.types_dechets || []), newWasteType.trim()];
    await updateSettings({ types_dechets: newTypes });
    setNewWasteType('');
  };

  const handleRemoveWasteType = async (type: string) => {
    if (!settings) return;
    
    const newTypes = settings.types_dechets.filter(t => t !== type);
    await updateSettings({ types_dechets: newTypes });
  };

  const handleZoneUpdate = async (zoneId: string, field: string, value: any) => {
    await updateZone(zoneId, { [field]: value });
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="min-h-screen bg-background">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="space-y-6"
      >
        {/* En-tête */}
        <div className="bg-gradient-to-r from-teal-600 via-green-500 to-emerald-600 rounded-xl p-8 text-white shadow-lg flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold flex items-center gap-3">
              ⚙️ Paramètres système
            </h1>
            <p className="text-teal-100 mt-2">Configuration globale de la plateforme</p>
          </div>
          <Button
            onClick={loadSystemSettings}
            variant="outline"
            size="lg"
            className="gap-2 bg-white text-teal-600 hover:bg-teal-50"
          >
            <RefreshCw className="w-4 h-4" />
            Actualiser
          </Button>
        </div>

        {/* Messages d'erreur/succès */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-3 p-4 bg-red-500/10 border border-red-500/20 rounded-lg"
          >
            <AlertCircle className="w-5 h-5 text-red-500" />
            <span className="text-red-700">{error}</span>
          </motion.div>
        )}

        {showSuccess && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="flex items-center gap-3 p-4 bg-green-500/10 border border-green-500/20 rounded-lg"
          >
            <CheckCircle className="w-5 h-5 text-green-500" />
            <span className="text-green-700">Paramètres mis à jour avec succès</span>
          </motion.div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Colonne 1: KPI Cards */}
          <div className="space-y-6">
            {/* Card Points par kg */}
            <Card className="bg-gradient-to-br from-yellow-50 to-amber-50 border-yellow-200 shadow-lg hover:shadow-xl transition-all">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-yellow-400 to-amber-500 flex items-center justify-center text-white">
                      <Coins className="w-5 h-5" />
                    </div>
                    <div>
                      <CardTitle className="text-sm text-amber-900">Points par kg</CardTitle>
                      <CardDescription className="text-amber-700">Conversion déchets → points</CardDescription>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-amber-600">
                  {settings?.points_par_kg ?? '-'}
                </div>
                <p className="text-xs text-amber-600 mt-2">
                  {settings?.points_par_kg ? `${settings.points_par_kg} points par kg collecté` : 'Non défini'}
                </p>
              </CardContent>
            </Card>

            {/* Card Bonus mensuel */}
            <Card className="bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-200 shadow-lg hover:shadow-xl transition-all">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-blue-400 to-cyan-500 flex items-center justify-center text-white">
                      <Coins className="w-5 h-5" />
                    </div>
                    <div>
                      <CardTitle className="text-sm text-cyan-900">Bonus mensuel</CardTitle>
                      <CardDescription className="text-cyan-700">Bonus de performance</CardDescription>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-cyan-600">
                  {settings?.bonus_mensuel ?? '-'}
                </div>
                <p className="text-xs text-cyan-600 mt-2">
                  Points bonus pour les agents performants
                </p>
              </CardContent>
            </Card>

            {/* Card Seuil minimum retrait */}
            <Card className="bg-gradient-to-br from-emerald-50 to-teal-50 border-emerald-200 shadow-lg hover:shadow-xl transition-all">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-white">
                      <Package className="w-5 h-5" />
                    </div>
                    <div>
                      <CardTitle className="text-sm text-teal-900">Seuil minimum retrait</CardTitle>
                      <CardDescription className="text-teal-700">Points pour retrait</CardDescription>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-teal-600">
                  {settings?.seuil_minimum_retrait ?? '-'}
                </div>
                <p className="text-xs text-teal-600 mt-2">
                  Minimum de points requis pour faire un retrait
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Colonne 2: Formulaire de configuration */}
          <div className="lg:col-span-2 space-y-6">
            {/* Configuration des paramètres */}
            <Card className="border-border/50 shadow-lg bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-purple-900">
                  <SettingsIcon className="w-5 h-5 text-purple-600" />
                  Configuration des paramètres
                </CardTitle>
                <CardDescription className="text-purple-700">
                  Modifiez les paramètres globaux du système
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Points par kg */}
                <div className="space-y-2">
                  <Label htmlFor="points_par_kg" className="text-base font-medium">
                    Points par kg collecté
                  </Label>
                  <Input
                    id="points_par_kg"
                    type="number"
                    min="0"
                    step="1"
                    value={formData.points_par_kg}
                    onChange={(e) => handleSettingChange('points_par_kg', parseInt(e.target.value))}
                    className="bg-card border-border/50"
                  />
                  <p className="text-xs text-muted-foreground">
                    Nombre de points accordés pour 1 kg de déchets collectés
                  </p>
                </div>

                {/* Bonus mensuel */}
                <div className="space-y-2">
                  <Label htmlFor="bonus_mensuel" className="text-base font-medium">
                    Bonus mensuel
                  </Label>
                  <Input
                    id="bonus_mensuel"
                    type="number"
                    min="0"
                    step="1"
                    value={formData.bonus_mensuel}
                    onChange={(e) => handleSettingChange('bonus_mensuel', parseInt(e.target.value))}
                    className="bg-card border-border/50"
                  />
                  <p className="text-xs text-muted-foreground">
                    Bonus de points alloué mensuellement aux agents performants
                  </p>
                </div>

                {/* Seuil minimum retrait */}
                <div className="space-y-2">
                  <Label htmlFor="seuil_minimum_retrait" className="text-base font-medium">
                    Seuil minimum de retrait
                  </Label>
                  <Input
                    id="seuil_minimum_retrait"
                    type="number"
                    min="0"
                    step="100"
                    value={formData.seuil_minimum_retrait}
                    onChange={(e) => handleSettingChange('seuil_minimum_retrait', parseInt(e.target.value))}
                    className="bg-card border-border/50"
                  />
                  <p className="text-xs text-muted-foreground">
                    Nombre minimum de points requis pour effectuer un retrait
                  </p>
                </div>

                {/* Bouton de sauvegarde */}
                <Button
                  onClick={handleSaveSettings}
                  disabled={isSaving}
                  className="w-full gap-2 mt-6"
                  size="lg"
                >
                  <Save className="w-4 h-4" />
                  {isSaving ? 'Enregistrement...' : 'Enregistrer les modifications'}
                </Button>
              </CardContent>
            </Card>

            {/* Types de déchets */}
            <Card className="border-border/50 shadow-lg bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-blue-900">
                  <Package className="w-5 h-5 text-blue-600" />
                  Types de déchets acceptés
                </CardTitle>
                <CardDescription className="text-blue-700">
                  Gérez les catégories de déchets collectables
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Liste des types */}
                <div className="flex flex-wrap gap-2">
                  {settings?.types_dechets?.map((type) => (
                    <Badge
                      key={type}
                      variant="secondary"
                      className="flex items-center gap-2 px-3 py-2 text-sm"
                    >
                      {type}
                      <button
                        onClick={() => handleRemoveWasteType(type)}
                        className="ml-1 hover:text-destructive transition-colors"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </Badge>
                  ))}
                </div>

                {/* Ajouter un nouveau type */}
                <div className="flex gap-2 mt-4">
                  <Input
                    placeholder="Nouveau type de déchet..."
                    value={newWasteType}
                    onChange={(e) => setNewWasteType(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleAddWasteType()}
                    className="bg-card border-border/50 flex-1"
                  />
                  <Button
                    onClick={handleAddWasteType}
                    size="sm"
                    className="gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    Ajouter
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Gestion des zones */}
        <Card className="border-border/50 shadow-lg bg-gradient-to-br from-emerald-50 to-teal-50 border-emerald-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-emerald-900">
              <MapPin className="w-5 h-5 text-emerald-600" />
              Gestion des zones géographiques
            </CardTitle>
            <CardDescription className="text-emerald-700">
              Configurez les zones de collecte et leurs limites
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b border-border/50">
                  <tr className="text-left text-muted-foreground font-medium">
                    <th className="pb-3 px-4">Zone</th>
                    <th className="pb-3 px-4">Statut</th>
                    <th className="pb-3 px-4">Agents</th>
                    <th className="pb-3 px-4">Capacité max</th>
                    <th className="pb-3 px-4">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/30">
                  {zones.map((zone) => (
                    <tr key={zone.id} className="hover:bg-card/50 transition-colors">
                      <td className="py-3 px-4 font-medium">{zone.nom}</td>
                      <td className="py-3 px-4">
                        <Badge variant={zone.statut === 'active' ? 'default' : 'secondary'}>
                          {zone.statut === 'active' ? 'Active' : 'Inactive'}
                        </Badge>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1">
                          <Users className="w-4 h-4 text-primary" />
                          {zone.agents_count ?? 0} agent{(zone.agents_count ?? 0) !== 1 ? 's' : ''}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <Input
                          type="number"
                          min="1"
                          value={zone.agents_max}
                          onChange={(e) => handleZoneUpdate(zone.id, 'agents_max', parseInt(e.target.value))}
                          className="w-20 bg-card border-border/50"
                        />
                      </td>
                      <td className="py-3 px-4">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleZoneUpdate(zone.id, 'statut', zone.statut === 'active' ? 'inactive' : 'active')}
                          className="text-xs"
                        >
                          {zone.statut === 'active' ? 'Désactiver' : 'Activer'}
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {zones.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  Aucune zone configurée
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
