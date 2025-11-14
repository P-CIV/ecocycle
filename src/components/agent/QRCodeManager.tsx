import { useState, useCallback, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { db } from '@/lib/firebase';
import { 
  collection, 
  query, 
  where, 
  onSnapshot, 
  Timestamp, 
  deleteDoc, 
  doc, 
  getDocs,
  writeBatch,
  DocumentData,
  QueryDocumentSnapshot 
} from 'firebase/firestore';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

import { generateQRCode, cleanOldQRCodes, deleteQRCode as deleteQRCodeFromDB } from '@/services/qrService';

interface QRCodeHistoryItem {
  id: string;
  code: string;
  date: Date;
  type: string;
  poids: number;
  points: number;
  status: 'active' | 'used' | 'expired';
}

export const QRCodeManager = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [qrHistory, setQrHistory] = useState<QRCodeHistoryItem[]>([]);

  // Charger l'historique depuis Firestore
  useEffect(() => {
    if (!user?.uid) return;

    const qrCodesRef = collection(db, 'qrcodes');
    const q = query(
      qrCodesRef,
      where('createdBy', '==', user.uid)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const qrData = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          code: data.code,
          date: (data.createdAt as Timestamp).toDate(),
          type: data.type,
          poids: data.poids || 0,
          points: data.points || 0,
          status: data.status || 'active'
        };
      });

      setQrHistory(qrData);
    }, (error) => {
      console.error("Erreur lors du chargement des QR codes:", error);
      toast({
        title: "Erreur",
        description: "Impossible de charger l'historique des QR codes",
        variant: "destructive",
      });
    });

    return () => unsubscribe();
  }, [user?.uid, toast]);

  // Fonction de suppression d'un code QR
  const deleteQRCode = useCallback(async (id: string) => {
    try {
      await deleteDoc(doc(db, 'qrcodes', id));
      toast({
        title: "Code supprimé",
        description: "Le code QR a été supprimé avec succès",
      });
    } catch (error) {
      console.error("Erreur lors de la suppression:", error);
      toast({
        title: "Erreur",
        description: "Impossible de supprimer le code QR",
        variant: "destructive",
      });
    }
  }, [toast]);

  // Fonction de nettoyage de l'historique
  const clearHistory = useCallback(async () => {
    if (!user?.uid) return;

    try {
      const qrCodesRef = collection(db, 'qrcodes');
      const q = query(qrCodesRef, where('createdBy', '==', user.uid));
      const snapshot = await getDocs(q);
      
      const batch = writeBatch(db);
      snapshot.docs.forEach((doc: QueryDocumentSnapshot<DocumentData>) => {
        batch.delete(doc.ref);
      });
      await batch.commit();
      
      toast({
        title: "Historique nettoyé",
        description: "L'historique des codes QR a été effacé",
      });
    } catch (error) {
      console.error("Erreur lors du nettoyage:", error);
      toast({
        title: "Erreur",
        description: "Impossible de nettoyer l'historique",
        variant: "destructive",
      });
    }
  }, [toast, user?.uid]);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold">QR Codes Récents</h2>
        <div className="flex gap-2">
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="outline" className="flex items-center gap-2">
                <Trash2 className="h-4 w-4" />
                Nettoyer l'historique
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Êtes-vous sûr ?</AlertDialogTitle>
                <AlertDialogDescription>
                  Cette action va supprimer définitivement tout l'historique des codes QR.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Annuler</AlertDialogCancel>
                <AlertDialogAction onClick={clearHistory}>Continuer</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      <Card className="p-6">
        <h3 className="text-lg font-medium mb-4">Historique de vos codes générés</h3>
        <div className="space-y-4">
          {qrHistory.length === 0 ? (
            <div className="text-center text-muted-foreground py-8">
              Aucun code QR dans l'historique
            </div>
          ) : (
            qrHistory.map((item) => (
              <div 
                key={item.id} 
                className="flex items-center justify-between p-4 bg-muted/50 rounded-lg hover:bg-muted/70 transition-colors"
              >
                <div className="space-y-1">
                  <div className="font-medium">{item.code}</div>
                  <div className="text-sm text-muted-foreground">
                    {item.date.toLocaleString('fr-FR', {
                      year: 'numeric',
                      month: '2-digit',
                      day: '2-digit',
                      hour: '2-digit',
                      minute: '2-digit'
                    })} • {item.type} • {item.poids} kg
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <Badge variant="secondary">+{item.points} pts</Badge>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button 
                        variant="ghost" 
                        size="icon"
                        className="hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Supprimer ce code ?</AlertDialogTitle>
                        <AlertDialogDescription>
                          Cette action ne peut pas être annulée.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Annuler</AlertDialogCancel>
                        <AlertDialogAction 
                          onClick={() => deleteQRCode(item.id)}
                        >
                          Supprimer
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            ))
          )}
        </div>
      </Card>
    </div>
  );
};