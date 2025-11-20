import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/components/ui/use-toast";
import { Coins, TrendingUp, Wallet, AlertCircle } from "lucide-react";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

interface UserRewards {
  points: number;
  pointsRetires: number;
  dernierRetrait: string | null;
}

const Rewards = () => {
  const { currentUser } = useAuth();
  const { toast } = useToast();
  const [rewards, setRewards] = useState<UserRewards>({ points: 0, pointsRetires: 0, dernierRetrait: null });
  const [loading, setLoading] = useState(true);
  const [montantRetrait, setMontantRetrait] = useState<string>("");
  const [methodePaiement, setMethodePaiement] = useState<string>("");
  const [isWithdrawing, setIsWithdrawing] = useState(false);
  const [seuilMinimum, setSeuilMinimum] = useState(1000);

  // Récupérer les points de l'utilisateur et le seuil
  useEffect(() => {
    const loadUserData = async () => {
      if (!currentUser?.uid) return;

      try {
        // Récupérer les points de l'utilisateur
        const userRef = doc(db, 'users', currentUser.uid);
        const userDoc = await getDoc(userRef);

        if (userDoc.exists()) {
          const userData = userDoc.data();
          setRewards({
            points: userData.points || 0,
            pointsRetires: userData.pointsRetires || 0,
            dernierRetrait: userData.dernierRetrait || null
          });
        }

        // Récupérer les paramètres globaux
        const settingsRef = doc(db, 'settings', 'global');
        const settingsDoc = await getDoc(settingsRef);
        if (settingsDoc.exists()) {
          setSeuilMinimum(settingsDoc.data().seuil_minimum_retrait || 1000);
        }
      } catch (error) {
        console.error('Erreur lors du chargement des données:', error);
        toast({
          title: "Erreur",
          description: "Impossible de charger vos données",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    loadUserData();
  }, [currentUser?.uid]);

  const handleWithdraw = async () => {
    if (!montantRetrait || !methodePaiement) {
      toast({
        title: "Erreur",
        description: "Veuillez remplir tous les champs",
        variant: "destructive"
      });
      return;
    }

    const montant = parseInt(montantRetrait);
    
    if (montant < seuilMinimum) {
      toast({
        title: "Montant insuffisant",
        description: `Le montant minimum requis est ${seuilMinimum} points`,
        variant: "destructive"
      });
      return;
    }

    if (montant > rewards.points) {
      toast({
        title: "Points insuffisants",
        description: `Vous n'avez que ${rewards.points} points disponibles`,
        variant: "destructive"
      });
      return;
    }

    setIsWithdrawing(true);
    try {
      // Mettre à jour les points de l'utilisateur
      const userRef = doc(db, 'users', currentUser!.uid);
      await updateDoc(userRef, {
        points: rewards.points - montant,
        pointsRetires: (rewards.pointsRetires || 0) + montant,
        dernierRetrait: new Date().toISOString(),
        methodeRetraitDerniere: methodePaiement
      });

      // Créer un enregistrement de retrait
      // TODO: Créer une collection 'retraits' avec les détails

      setRewards(prev => ({
        ...prev,
        points: prev.points - montant,
        pointsRetires: prev.pointsRetires + montant,
        dernierRetrait: new Date().toISOString()
      }));

      toast({
        title: "Retrait effectué !",
        description: `${montant} points retirés via ${methodePaiement}`,
      });

      setMontantRetrait("");
      setMethodePaiement("");
    } catch (error) {
      console.error('Erreur lors du retrait:', error);
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors du retrait",
        variant: "destructive"
      });
    } finally {
      setIsWithdrawing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  const pointsDisponibles = rewards.points;
  const canWithdraw = pointsDisponibles >= seuilMinimum;

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="bg-gradient-to-r from-orange-500 via-amber-500 to-yellow-500 rounded-xl p-8 text-white shadow-lg">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-4xl font-bold flex items-center gap-3">
              <Coins className="h-10 w-10" />
              Retrait de Bonus
            </h2>
            <p className="text-orange-100 mt-2 text-lg">
              Convertissez vos points en argent mobile
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Carte Points disponibles */}
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200 shadow-lg">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-sm text-blue-900">Points Disponibles</CardTitle>
                <CardDescription className="text-blue-700">Solde actuel</CardDescription>
              </div>
              <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white">
                <Wallet className="w-5 h-5" />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-blue-600">
              {pointsDisponibles.toLocaleString('fr-FR')}
            </div>
            <p className="text-xs text-blue-600 mt-2">
              Points prêts pour le retrait
            </p>
          </CardContent>
        </Card>

        {/* Carte Points retirés */}
        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200 shadow-lg">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-sm text-green-900">Points Retirés</CardTitle>
                <CardDescription className="text-green-700">Total historique</CardDescription>
              </div>
              <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center text-white">
                <TrendingUp className="w-5 h-5" />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-green-600">
              {rewards.pointsRetires.toLocaleString('fr-FR')}
            </div>
            <p className="text-xs text-green-600 mt-2">
              {rewards.dernierRetrait 
                ? `Dernier: ${new Date(rewards.dernierRetrait).toLocaleDateString('fr-FR')}`
                : "Aucun retrait effectué"}
            </p>
          </CardContent>
        </Card>

        {/* Carte Seuil minimum */}
        <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200 shadow-lg">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-sm text-orange-900">Seuil Minimum</CardTitle>
                <CardDescription className="text-orange-700">Requis pour retrait</CardDescription>
              </div>
              <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center text-white">
                <AlertCircle className="w-5 h-5" />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-orange-600">
              {seuilMinimum.toLocaleString('fr-FR')}
            </div>
            <p className="text-xs text-orange-600 mt-2">
              {canWithdraw 
                ? "✅ Vous pouvez retirer"
                : `⏳ ${seuilMinimum - pointsDisponibles} points restants`}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Section Retrait */}
      <Card className="border-border/50 shadow-lg bg-gradient-to-br from-amber-50 to-orange-50 border-amber-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-amber-900">
            <Coins className="w-5 h-5 text-amber-600" />
            Effectuer un Retrait
          </CardTitle>
          <CardDescription className="text-amber-700">
            Choisissez votre méthode de paiement préférée
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Alerte si points insuffisants */}
          {!canWithdraw && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-red-900">Points insuffisants</p>
                <p className="text-sm text-red-700">
                  Vous avez besoin de {seuilMinimum - pointsDisponibles} points supplémentaires pour effectuer un retrait
                </p>
              </div>
            </div>
          )}

          <div className="space-y-4">
            {/* Montant à retirer */}
            <div className="space-y-2">
              <Label htmlFor="montant" className="text-base font-medium text-amber-900">
                Montant à retirer (en points)
              </Label>
              <Input
                id="montant"
                type="number"
                placeholder={`Minimum: ${seuilMinimum}`}
                value={montantRetrait}
                onChange={(e) => setMontantRetrait(e.target.value)}
                min={seuilMinimum}
                max={pointsDisponibles}
                disabled={!canWithdraw || isWithdrawing}
                className="bg-white border-amber-200"
              />
              <p className="text-xs text-amber-700">
                {montantRetrait && pointsDisponibles - parseInt(montantRetrait) >= 0
                  ? `Vous conserverez ${(pointsDisponibles - parseInt(montantRetrait)).toLocaleString('fr-FR')} points`
                  : `Montant minimum: ${seuilMinimum} points`}
              </p>
            </div>

            {/* Méthode de paiement */}
            <div className="space-y-2">
              <Label htmlFor="methode" className="text-base font-medium text-amber-900">
                Méthode de paiement
              </Label>
              <Select value={methodePaiement} onValueChange={setMethodePaiement} disabled={!canWithdraw || isWithdrawing}>
                <SelectTrigger className="bg-white border-amber-200">
                  <SelectValue placeholder="Sélectionnez une méthode" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="orange_money">
                    <div className="flex items-center gap-2">
                      <img src="/assets/images/orange.png" alt="Orange Money" className="w-6 h-6" />
                      Orange Money
                    </div>
                  </SelectItem>
                  <SelectItem value="mtn_money">
                    <div className="flex items-center gap-2">
                      <img src="/assets/images/mtn.png" alt="MTN Money" className="w-6 h-6" />
                      MTN Money
                    </div>
                  </SelectItem>
                  <SelectItem value="moov_money">
                    <div className="flex items-center gap-2">
                      <img src="/assets/images/moov.png" alt="Moov Money" className="w-6 h-6" />
                      Moov Money
                    </div>
                  </SelectItem>
                  <SelectItem value="wave">
                    <div className="flex items-center gap-2">
                      <img src="/assets/images/wave.png" alt="Wave" className="w-6 h-6" />
                      Wave
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-amber-700">
                Choisissez le portefeuille mobile où recevoir votre argent
              </p>
            </div>

            {/* Bouton de retrait */}
            <Button
              onClick={handleWithdraw}
              disabled={!canWithdraw || !montantRetrait || !methodePaiement || isWithdrawing}
              className="w-full gap-2 mt-6 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-semibold py-6 text-lg"
              size="lg"
            >
              <Coins className="w-5 h-5" />
              {isWithdrawing ? 'Traitement en cours...' : 'Retirer mes Points'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Informations importantes */}
      <Card className="bg-blue-50 border-blue-200">
        <CardHeader>
          <CardTitle className="text-blue-900 text-base">ℹ️ Informations importantes</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-blue-800">
          <p>
            • Les retraits sont traités dans un délai de <strong>24-48 heures</strong> après validation
          </p>
          <p>
            • Vous pouvez effectuer <strong>jusqu'à 3 retraits par mois</strong>
          </p>
          <p>
            • Les frais de transaction peuvent s'appliquer selon la méthode de paiement
          </p>
          <p>
            • Une vérification d'identité peut être requise pour les premiers retraits
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default Rewards;
