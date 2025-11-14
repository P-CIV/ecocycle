import { db } from '@/lib/firebase';
import { 
  doc, 
  getDoc,
  runTransaction,
  increment,
  Transaction
} from 'firebase/firestore';

interface ValidationResult {
  success: boolean;
  points: number;
  message: string;
  userId?: string;
}

// Fonction pour valider un token et attribuer les points à l'utilisateur
// Utilise une "transaction" pour garantir que tout se passe bien ou rien ne se passe
export async function validateTokenAndAwardPoints(tokenId: string): Promise<ValidationResult> {
  try {
    return await runTransaction(db, async (transaction: Transaction) => {
      // ÉTAPE 1: Récupérer le token en base
      const tokenRef = doc(db, 'redeemTokens', tokenId);
      const tokenDoc = await transaction.get(tokenRef);

      if (!tokenDoc.exists()) {
        return { 
          success: false, 
          points: 0, 
          message: 'Token invalide' 
        };
      }

      const tokenData = tokenDoc.data();

      // ÉTAPE 2: Vérifier que le token est valide
      if (!tokenData.isValid || tokenData.used) {
        return { 
          success: false, 
          points: 0, 
          message: 'Token déjà utilisé' 
        };
      }

      // ÉTAPE 3: Vérifier que le token n'a pas expiré
      if (tokenData.expiresAt.toDate() < new Date()) {
        return { 
          success: false, 
          points: 0, 
          message: 'Token expiré' 
        };
      }

      // ÉTAPE 4: Calculer les points (10 par défaut, peut être personnalisé)
      const pointsToAward = 10;

      // ÉTAPE 5: Marquer le token comme utilisé
      transaction.update(tokenRef, {
        used: true,
        isValid: false,
        usedAt: new Date(),
        pointsAwarded: pointsToAward
      });

      // ÉTAPE 6: Ajouter les points à l'utilisateur
      const userRef = doc(db, 'users', tokenData.userId);
      const userDoc = await transaction.get(userRef);

      if (userDoc.exists()) {
        // Ajouter les points et mettre à jour les stats
        transaction.update(userRef, {
          points: increment(pointsToAward),
          totalCollectes: increment(1),
          lastCollecte: new Date()
        });
      }

      return {
        success: true,
        points: pointsToAward,
        message: 'Points attribués avec succès',
        userId: tokenData.userId
      };
    });
  } catch (error) {
    console.error('Erreur lors de la validation du token:', error);
    return {
      success: false,
      points: 0,
      message: 'Erreur lors de la validation'
    };
  }
}

// Récupère le nombre total de points d'un utilisateur
export async function getUserPoints(userId: string): Promise<number> {
  try {
    const userRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userRef);
    
    if (!userDoc.exists()) {
      return 0;
    }

    return userDoc.data().points || 0;
  } catch (error) {
    console.error('Erreur lors de la récupération des points:', error);
    return 0;
  }
}