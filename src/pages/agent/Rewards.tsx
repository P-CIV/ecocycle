import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/components/ui/use-toast";
import { Coins, TrendingUp, Wallet, AlertCircle, Phone, DollarSign } from "lucide-react";
import { doc, getDoc, updateDoc, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";

interface UserRewards {
  points: number;
  pointsRetires: number;
  dernierRetrait: string | null;
}

// Configuration de conversion points → francs CFA
const POINTS_TO_CFA = 5; // 1 point = 5 francs CFA
const OPERATORS = [
  { id: 'orange_money', name: 'Orange Money', logo: '/assets/images/orange.png', placeholder: '0X XX XX XX XX' },
  { id: 'mtn_money', name: 'MTN Money', logo: '/assets/images/mtn.png', placeholder: '0X XX XX XX XX' },
  { id: 'moov_money', name: 'Moov Money', logo: '/assets/images/moov.png', placeholder: '0X XX XX XX XX' },
  { id: 'wave', name: 'Wave', logo: '/assets/images/wave.png', placeholder: '0X XX XX XX XX' }
];

const Rewards = () => {
  const { currentUser } = useAuth();
  const { toast } = useToast();
  const [rewards, setRewards] = useState<UserRewards>({ points: 0, pointsRetires: 0, dernierRetrait: null });
  const [loading, setLoading] = useState(true);
  const [pointsInput, setPointsInput] = useState<string>("");
  const [phoneNumber, setPhoneNumber] = useState<string>("");
  const [operateur, setOperateur] = useState<string>("");
  const [isWithdrawing, setIsWithdrawing] = useState(false);
  const [seuilMinimum, setSeuilMinimum] = useState(1000);

  // Calcul automatique du montant en francs CFA
  const montantCFA = pointsInput ? parseInt(pointsInput) * POINTS_TO_CFA : 0;
  const canWithdraw = rewards.points >= seuilMinimum;

  // Récupérer les points de l'utilisateur en temps réel et le seuil
  useEffect(() => {
    if (!currentUser?.uid) return;

    let unsubscribe: (() => void) | undefined;

    const loadUserData = async () => {
      try {
        // Charger les paramètres globaux (une seule fois)
        const settingsRef = doc(db, 'settings', 'global');
        const settingsDoc = await getDoc(settingsRef);
        if (settingsDoc.exists()) {
          setSeuilMinimum(settingsDoc.data().seuil_minimum_retrait || 1000);
        }

        // Écouter les changements de points de l'utilisateur en temps réel
        const userRef = doc(db, 'users', currentUser.uid);
        unsubscribe = onSnapshot(userRef, (userDoc) => {
          if (userDoc.exists()) {
            const userData = userDoc.data();
            setRewards({
              points: userData.points || 0,
              pointsRetires: userData.pointsRetires || 0,
              dernierRetrait: userData.dernierRetrait || null
            });
          } else {
            // Le document n'existe pas encore, initialiser avec 0
            setRewards({
              points: 0,
              pointsRetires: 0,
              dernierRetrait: null
            });
          }
          setLoading(false);
        });
      } catch (error) {
        console.error('Erreur lors du chargement des données:', error);
        toast({
          title: "Erreur",
          description: "Impossible de charger vos données",
          variant: "destructive"
        });
        setLoading(false);
      }
    };

    loadUserData();

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [currentUser?.uid, toast]);

  const handleWithdraw = async () => {
    // Validation
    if (!pointsInput || !operateur || !phoneNumber) {
      toast({
        title: "Erreur",
        description: "Veuillez remplir tous les champs",
        variant: "destructive"
      });
      return;
    }

    const montantPoints = parseInt(pointsInput);
    
    if (montantPoints < seuilMinimum) {
      toast({
        title: "Montant insuffisant",
        description: `Le montant minimum requis est ${seuilMinimum} points`,
        variant: "destructive"
      });
      return;
    }

    if (montantPoints > rewards.points) {
      toast({
        title: "Points insuffisants",
        description: `Vous n'avez que ${rewards.points} points disponibles`,
        variant: "destructive"
      });
      return;
    }

    // Validation du numéro de téléphone
    if (!/^[0-9+\s-()]+$/.test(phoneNumber) || phoneNumber.replace(/\D/g, '').length < 7) {
      toast({
        title: "Numéro invalide",
        description: "Veuillez entrer un numéro de téléphone valide",
        variant: "destructive"
      });
      return;
    }

    setIsWithdrawing(true);
    try {
      // Mettre à jour les points de l'utilisateur
      const userRef = doc(db, 'users', currentUser!.uid);
      const operatorName = OPERATORS.find(op => op.id === operateur)?.name || operateur;
      
      await updateDoc(userRef, {
        points: rewards.points - montantPoints,
        pointsRetires: (rewards.pointsRetires || 0) + montantPoints,
        dernierRetrait: new Date().toISOString(),
        methodeRetraitDerniere: operateur,
        numeroTelephoneDernier: phoneNumber
      });

      // Créer un enregistrement de retrait
      // TODO: Créer une collection 'retraits' avec les détails

      setRewards(prev => ({
        ...prev,
        points: prev.points - montantPoints,
        pointsRetires: prev.pointsRetires + montantPoints,
        dernierRetrait: new Date().toISOString()
      }));

      toast({
        title: "Retrait effectué ! ✅",
        description: `${montantPoints} points (${montantCFA.toLocaleString('fr-FR')} FCFA) retirés via ${operatorName}. Vous recevrez l'argent dans 24-48h.`,
      });

      // Réinitialiser le formulaire
      setPointsInput("");
      setPhoneNumber("");
      setOperateur("");
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

      {/* Section Retrait - Flux Amélioré */}
      <Card className="border-border/50 shadow-lg bg-gradient-to-br from-amber-50 to-orange-50 border-amber-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-amber-900 text-2xl">
            <Coins className="w-6 h-6 text-amber-600" />
            Effectuer un Retrait
          </CardTitle>
          <CardDescription className="text-amber-700 text-base">
            Convertissez vos points en argent mobile
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
                  Vous avez besoin de {seuilMinimum - rewards.points} points supplémentaires pour effectuer un retrait
                </p>
              </div>
            </div>
          )}

          <div className="space-y-6">
            {/* ÉTAPE 1: Nombre de points à retirer */}
            <div className="space-y-3 pb-6 border-b-2 border-amber-200">
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-amber-600 text-white font-bold">1</div>
                <Label className="text-base font-bold text-amber-900">
                  Entrez le nombre de points à retirer
                </Label>
              </div>
              <Input
                type="number"
                placeholder={`Minimum: ${seuilMinimum}`}
                value={pointsInput}
                onChange={(e) => setPointsInput(e.target.value)}
                min={seuilMinimum}
                max={rewards.points}
                disabled={!canWithdraw || isWithdrawing}
                className="bg-white border-amber-300 text-lg py-6 font-semibold"
              />
              <p className="text-xs text-amber-700">
                Minimum requis: <span className="font-bold">{seuilMinimum} points</span>
              </p>
            </div>

            {/* ÉTAPE 2: Affichage de la conversion */}
            {pointsInput && (
              <div className="space-y-3 pb-6 border-b-2 border-amber-200">
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-amber-600 text-white font-bold">✓</div>
                  <Label className="text-base font-bold text-amber-900">
                    Conversion automatique
                  </Label>
                </div>
                <div className="bg-white rounded-lg p-4 border-2 border-amber-300">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center">
                      <div className="text-sm text-amber-700">Points</div>
                      <div className="text-3xl font-bold text-amber-600">{parseInt(pointsInput).toLocaleString('fr-FR')}</div>
                    </div>
                    <div className="text-center flex flex-col items-center justify-center">
                      <div className="text-2xl text-amber-500 mb-2">→</div>
                      <div className="text-sm text-amber-700">Francs CFA</div>
                      <div className="text-3xl font-bold text-green-600">{montantCFA.toLocaleString('fr-FR')} FCFA</div>
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 mt-3 text-center">
                    Taux de conversion: 1 point = {POINTS_TO_CFA} FCFA
                  </p>
                </div>
              </div>
            )}

            {/* ÉTAPE 3: Sélection de l'opérateur */}
            {pointsInput && (
              <div className="space-y-3 pb-6 border-b-2 border-amber-200">
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-amber-600 text-white font-bold">2</div>
                  <Label className="text-base font-bold text-amber-900">
                    Choisissez votre opérateur
                  </Label>
                </div>
                <Select value={operateur} onValueChange={setOperateur} disabled={!canWithdraw || isWithdrawing}>
                  <SelectTrigger className="bg-white border-amber-300 h-14">
                    <SelectValue placeholder="Sélectionnez un opérateur" />
                  </SelectTrigger>
                  <SelectContent>
                    {OPERATORS.map(op => (
                      <SelectItem key={op.id} value={op.id}>
                        <div className="flex items-center gap-2">
                          <img src={op.logo} alt={op.name} className="w-5 h-5 rounded-full" onError={(e) => {
                            e.currentTarget.style.display = 'none';
                          }} />
                          <span className="font-medium">{op.name}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* ÉTAPE 4: Numéro de téléphone */}
            {operateur && (
              <div className="space-y-3 pb-6 border-b-2 border-amber-200">
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-amber-600 text-white font-bold">3</div>
                  <Label className="text-base font-bold text-amber-900">
                    Entrez votre numéro de téléphone
                  </Label>
                </div>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-amber-600" />
                  <Input
                    type="tel"
                    placeholder={OPERATORS.find(op => op.id === operateur)?.placeholder || "+..."}
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    disabled={!canWithdraw || isWithdrawing}
                    className="bg-white border-amber-300 pl-10 text-lg py-6 font-semibold"
                  />
                </div>
                <p className="text-xs text-amber-700">
                  Utilisez le format: <span className="font-mono font-bold">0X XX XX XX XX</span>
                </p>
              </div>
            )}

            {/* BOUTON RETRAIT - Visible quand tous les champs sont remplis */}
            {pointsInput && operateur && phoneNumber && (
              <div className="space-y-4 pt-4 bg-gradient-to-r from-orange-50 to-amber-50 p-4 rounded-lg border-2 border-orange-200">
                <Button
                  onClick={handleWithdraw}
                  disabled={!canWithdraw || !pointsInput || !operateur || !phoneNumber || isWithdrawing}
                  className="w-full gap-2 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-bold py-6 text-lg rounded-lg"
                  size="lg"
                >
                  <Coins className="w-5 h-5" />
                  {isWithdrawing ? 'Traitement en cours...' : `Retirer ${montantCFA.toLocaleString('fr-FR')} FCFA`}
                </Button>
                <p className="text-xs text-center text-amber-700">
                  💡 Vous recevrez l'argent dans <strong>24-48 heures</strong>
                </p>
              </div>
            )}

            {/* Message si formulaire incomplet */}
            {(!pointsInput || !operateur || !phoneNumber) && canWithdraw && (
              <div className="text-center p-4 bg-blue-50 rounded-lg border border-blue-200">
                <p className="text-sm text-blue-700">
                  ➜ Suivez les étapes ci-dessus pour effectuer votre retrait
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Informations importantes */}
      <Card className="bg-green-50 border-green-200">
        <CardHeader>
          <CardTitle className="text-green-900 text-base">🎁 Comment gagner des points</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-green-800">
          <p>
            • Chaque transaction enregistrée vous rapporte <strong>5 points exactement</strong>
          </p>
          <p>
            • Plus vous effectuez de transactions, plus vous accumulez de points!
          </p>
          <p>
            • Taux de conversion: <strong>1 point = 5 FCFA</strong>
          </p>
          <p>
            • Exemple: 10 transactions = 50 points = 250 FCFA
          </p>
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
