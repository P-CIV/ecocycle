import { useState } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { QrCode } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { createQRCode } from '@/services/qrCodeService';

interface QRGeneratorProps {
  type: string;
  poids: number;
  points: number;
  onSuccess?: () => void;
}

export const QRGenerator = ({ type, poids, points, onSuccess }: QRGeneratorProps) => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  const handleGenerate = async () => {
    if (!user?.uid) {
      toast({
        title: "Erreur d'authentification",
        description: "Vous devez être connecté pour générer un QR code",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      const result = await createQRCode({
        type,
        poids,
        points,
        createdBy: user.uid,
      });

      if (!result.success) {
        throw new Error('Échec de la génération du QR code');
      }

      toast({
        title: "Succès",
        description: `Le QR code ${result.code} a été généré avec succès`,
      });

      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error('Erreur lors de la génération du QR code:', error);
      toast({
        title: "Erreur",
        description: error instanceof Error 
          ? error.message 
          : "Une erreur est survenue lors de la génération du QR code",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      onClick={handleGenerate}
      disabled={loading}
      className="w-full mt-4"
    >
      <QrCode className="w-4 h-4 mr-2" />
      {loading ? "Génération en cours..." : "Générer le QR code"}
    </Button>
  );
};