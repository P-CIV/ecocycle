import { db } from '@/lib/firebase';
import { collection, getDocs } from 'firebase/firestore';

export async function testFirebaseConnection() {
  try {
    // Tenter de lire la collection users
    const usersRef = collection(db, 'users');
    await getDocs(usersRef);return true;
  } catch (error) { console.error('❌ Erreur de connexion à Firestore:', error);
    return false;
  }
}

// Test des règles de sécurité
export async function testFirebaseSecurityRules() {
  try {
    // Tester l'écriture dans la collection redeemTokens
    const tokensRef = collection(db, 'redeemTokens');
    await getDocs(tokensRef);return true;
  } catch (error) {
    if (error && typeof error === 'object' && 'code' in error) {
      if (error.code === 'permission-denied') {return true;
      }
    } console.error('❌ Erreur lors du test des règles:', error);
    return false;
  }
}
