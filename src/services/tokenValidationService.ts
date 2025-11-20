import { db } from '@/lib/firebase';
import { collection, query, where, getDocs, updateDoc, doc } from 'firebase/firestore';

export async function validateAndUseToken(token: string): Promise<boolean> {
  try {
    const tokensRef = collection(db, 'redeemTokens');
    const q = query(
      tokensRef,
      where('token', '==', token),
      where('isValid', '==', true),
      where('used', '==', false)
    );

    const snapshot = await getDocs(q);
    
    if (snapshot.empty) {
      return false;
    }

    const tokenDoc = snapshot.docs[0];
    const tokenData = tokenDoc.data();
    const expiresAt = tokenData.expiresAt.toDate();

    // Vérifier si le token n'est pas expiré
    if (expiresAt < new Date()) {
      return false;
    }

    // Marquer le token comme utilisé
    await updateDoc(doc(db, 'redeemTokens', tokenDoc.id), {
      used: true,
      isValid: false,
      usedAt: new Date()
    });

    return true;
  } catch (error) {
    console.error('Erreur lors de la validation du token:', error);
    return false;
  }
}
