import { useAuth } from "@/contexts/AuthContext";
import { useState } from "react";
import { createQRCode } from "@/services/qrCodeService";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Scale, PackageCheck } from "lucide-react";
import { updateAgentStats } from "@/utils/updateAgentStats";
import { addDoc, collection } from 'firebase/firestore';
import { db } from "@/config/firebase";

interface CollecteFormProps {
  onSuccess?: () => void;
}

export function CollecteForm({ onSuccess }: CollecteFormProps) {
  const [kilos, setKilos] = useState("");
  const [typeDechet, setTypeDechet] = useState("plastique");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const { currentUser } = useAuth();

  // Points par type de déchet
  const POINTS_PAR_TYPE = {
    plastique: 12,
    papier: 8,
    verre: 10,
    polystyrène: 15,
    electronique: 20,
    textile: 10
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!currentUser) {
      toast({
        title: "Erreur d'authentification",
        description: "Vous devez être connecté pour effectuer une collecte",
        variant: "destructive"
      });
      return;
    }

    const kg = Number(kilos);
    if (!kilos || isNaN(kg) || kg <= 0) {
      toast({
        title: "Erreur de saisie",
        description: "Veuillez entrer un poids valide",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);

    try {
      // Calculer les points
      const pointsParKg = POINTS_PAR_TYPE[typeDechet as keyof typeof POINTS_PAR_TYPE];
      const points = Math.round(kg * pointsParKg);

      const collecteData = {
        kg,
        type: typeDechet,
        points,
        status: 'en_attente',
        date: new Date(),
        agentId: currentUser.uid,
        agentEmail: currentUser.email,
        createdAt: new Date()
      };

      // Ajouter la collecte à Firestore
      await addDoc(collection(db, 'collectes'), collecteData);

      // Mettre à jour les statistiques
      await updateAgentStats({
        kg,
        points,
        status: 'en_attente',
        date: new Date(),
        agentId: currentUser.uid
      });

      toast({
        title: "Collecte enregistrée",
        description: `Collecte de ${kg}kg de ${typeDechet} enregistrée avec succès`,
      });

      // Générer le QR code après l'enregistrement de la collecte
      try {
        // Tenter de générer le QR code
        const result = await createQRCode({
          type: typeDechet,
          poids: kg,
          points: Math.round(kg * POINTS_PAR_TYPE[typeDechet as keyof typeof POINTS_PAR_TYPE]),
          createdBy: currentUser.uid
        });

        if (result.success) {
          // Réinitialiser le formulaire
          setKilos("");
          setTypeDechet("plastique");
          
          // Appeler le callback de succès si fourni
          if (onSuccess) {
            onSuccess();
          }
        }
      } catch (qrError) {
        console.error('Erreur lors de la génération du QR code:', qrError);
        toast({
          title: "Attention",
          description: "La collecte a été enregistrée mais la génération du QR code a échoué",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Erreur lors de l\'enregistrement de la collecte:', error);
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de l'enregistrement de la collecte",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Scale className="w-5 h-5" />
          Nouvelle Collecte
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="kilos">Poids collecté (kg)</Label>
            <Input
              id="kilos"
              type="number"
              step="0.1"
              min="0"
              placeholder="Entrez le poids en kg"
              value={kilos}
              onChange={(e) => setKilos(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="type">Type de déchet</Label>
            <Select value={typeDechet} onValueChange={setTypeDechet}>
              <SelectTrigger>
                <SelectValue placeholder="Sélectionnez le type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="plastique">Plastique (12 pts/kg)</SelectItem>
                <SelectItem value="papier">Papier/Carton (8 pts/kg)</SelectItem>
                <SelectItem value="verre">Verre (10 pts/kg)</SelectItem>
                <SelectItem value="polystyrène">Polystyrène (15 pts/kg)</SelectItem>
                <SelectItem value="electronique">Électronique (20 pts/kg)</SelectItem>
                <SelectItem value="textile">Textile (10 pts/kg)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {kilos && !isNaN(Number(kilos)) && Number(kilos) > 0 && (
            <div className="p-4 bg-primary/10 rounded-lg">
              <p className="text-sm font-medium">
                Points estimés : {Math.round(Number(kilos) * POINTS_PAR_TYPE[typeDechet as keyof typeof POINTS_PAR_TYPE])} pts
              </p>
            </div>
          )}

          <Button 
            type="submit" 
            className="w-full"
            disabled={loading}
          >
            <PackageCheck className="w-4 h-4 mr-2" />
            {loading ? "Traitement..." : "Valider la collecte"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}