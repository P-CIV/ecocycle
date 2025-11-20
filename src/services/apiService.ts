import { db } from '@/lib/firebase';
import { collection, doc, getDoc, updateDoc, addDoc, Timestamp } from 'firebase/firestore';

interface ScanResult {
  success: boolean;
  points: number;
  message: string;
  collecteId?: string;
}

interface CollecteData {
  userId: string;
  tokenId: string;
  points: number;
  timestamp: Date;
  location?: {
    latitude: number;
    longitude: number;
  };
  type: string;
  weight?: number;
}

export const apiService = {
  async validateScan(tokenId: string, scanData: {
    location: { latitude: number; longitude: number; };
    type: string;
    weight?: number;
  }): Promise<ScanResult> {
    try {
      // 1. Vérifier le token
      const tokensRef = collection(db, 'redeemTokens');
      const tokenQuery = await getDoc(doc(tokensRef, tokenId));
      
      if (!tokenQuery.exists()) {
        return {
          success: false,
          points: 0,
          message: 'Token invalide'
        };
      }

      const tokenData = tokenQuery.data();
      
      // Vérifier si le token n'est pas expiré ou déjà utilisé
      if (!tokenData.isValid || tokenData.used || tokenData.expiresAt.toDate() < new Date()) {
        return {
          success: false,
          points: 0,
          message: 'Token expiré ou déjà utilisé'
        };
      }

      // 2. Calculer les points en fonction du type et du poids
      const points = calculatePoints(scanData.type, scanData.weight);

      // 3. Créer l'enregistrement de la collecte
      const collecteData: CollecteData = {
        userId: tokenData.userId,
        tokenId: tokenId,
        points: points,
        timestamp: new Date(),
        location: scanData.location,
        type: scanData.type,
        weight: scanData.weight
      };

      const collecteRef = await addDoc(collection(db, 'collectes'), collecteData);

      // 4. Mettre à jour le token comme utilisé
      await updateDoc(doc(tokensRef, tokenId), {
        used: true,
        isValid: false,
        usedAt: Timestamp.now()
      });

      // 5. Mettre à jour les points de l'utilisateur
      await updateUserPoints(tokenData.userId, points);

      return {
        success: true,
        points: points,
        message: 'Scan validé avec succès',
        collecteId: collecteRef.id
      };
    } catch (error) {
      console.error('Erreur lors de la validation du scan:', error);
      return {
        success: false,
        points: 0,
        message: 'Erreur lors de la validation'
      };
    }
  }
};

// Fonction utilitaire pour calculer les points
function calculatePoints(type: string, weight?: number): number {
  const basePoints = {
    'plastique': 10,
    'verre': 15,
    'papier': 8,
    'polystèrene': 20
  }[type] || 5;

  if (weight) {
    // Bonus points pour le poids (1 point supplémentaire par kg)
    return basePoints + Math.floor(weight);
  }

  return basePoints;
}

// Mise à jour des points de l'utilisateur
async function updateUserPoints(userId: string, newPoints: number) {
  const userRef = doc(db, 'users', userId);
  const userDoc = await getDoc(userRef);

  if (userDoc.exists()) {
    const currentPoints = userDoc.data().points || 0;
    await updateDoc(userRef, {
      points: currentPoints + newPoints,
      lastUpdated: Timestamp.now()
    });
  }
}
