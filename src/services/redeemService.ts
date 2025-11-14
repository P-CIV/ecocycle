import { db } from '@/lib/firebase';
import { collection, addDoc, getDocs, query, where, Timestamp } from 'firebase/firestore';
import { v4 as uuidv4 } from 'uuid';

interface RedeemToken {
  token: string;
  expiresAt: Date;
  isValid: boolean;
  createdAt: Date;
}

// Génère un nouveau token de validation pour un utilisateur
// Le token expire après 30 minutes
export async function generateRedeemToken(userId: string): Promise<RedeemToken> {
  try {
    const tokensRef = collection(db, 'redeemTokens');
    
    // Vérifier si l'utilisateur a déjà un token valide
    const existingTokenQuery = query(
      tokensRef,
      where('userId', '==', userId),
      where('isValid', '==', true)
    );
    
    const existingTokens = await getDocs(existingTokenQuery);
    if (!existingTokens.empty) {
      throw new Error('Un token valide existe déjà');
    }

    // Créer un token avec expiration à 30 minutes
    const now = new Date();
    const expiresAt = new Date(now.getTime() + 30 * 60000); // +30 minutes

    const newToken = {
      token: uuidv4(), // ID unique généré aléatoirement
      userId,
      createdAt: Timestamp.fromDate(now),
      expiresAt: Timestamp.fromDate(expiresAt),
      isValid: true,
      used: false
    };

    // Sauvegarder le token en base
    await addDoc(tokensRef, newToken);

    return {
      token: newToken.token,
      expiresAt: expiresAt,
      isValid: true,
      createdAt: now
    };
  } catch (error) {
    console.error('Erreur lors de la génération du token:', error);
    throw error;
  }
}

// Récupère le token valide d'un utilisateur
// Si aucun token n'existe ou s'il est expiré, en génère un nouveau
export async function getRedeemToken(userId: string): Promise<RedeemToken> {
  try {
    const tokensRef = collection(db, 'redeemTokens');
    const q = query(
      tokensRef,
      where('userId', '==', userId),
      where('isValid', '==', true)
    );

    const snapshot = await getDocs(q);
    
    if (snapshot.empty) {
      // Aucun token trouvé: créer un nouveau
      return await generateRedeemToken(userId);
    }

    const tokenDoc = snapshot.docs[0].data();
    const expiresAt = tokenDoc.expiresAt.toDate();
    
    // Vérifier que le token n'a pas expiré
    if (expiresAt < new Date()) {
      // Token expiré: créer un nouveau
      return await generateRedeemToken(userId);
    }

    // Token valide: le retourner
    return {
      token: tokenDoc.token,
      expiresAt: expiresAt,
      isValid: tokenDoc.isValid,
      createdAt: tokenDoc.createdAt.toDate()
    };
  } catch (error) {
    console.error('Erreur lors de la récupération du token:', error);
    throw error;
  }
}