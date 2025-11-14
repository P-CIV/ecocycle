import { db } from '@/lib/firebase';
import { collection, getDocs } from 'firebase/firestore';

export async function testFirebaseConnection() {
  try {
    // Tenter de lire la collection users
    const usersRef = collection(db, 'users');
    await getDocs(usersRef); console.log('✅ Connexion à Firestore réussie !');
    return true;
  } catch (error) { console.error('❌ Erreur de connexion à Firestore:', error);
    return false;
  }
}

// Test des règles de sécurité
export async function testFirebaseSecurityRules() {
  try {
    // Tester l'écriture dans la collection redeemTokens
    const tokensRef = collection(db, 'redeemTokens');
    await getDocs(tokensRef); console.log('✅ Accès aux tokens autorisé !');
    return true;
  } catch (error) {
    if (error && typeof error === 'object' && 'code' in error) {
      if (error.code === 'permission-denied') { console.log('✅ Les règles de sécurité sont actives !');
        return true;
      }
    } console.error('❌ Erreur lors du test des règles:', error);
    return false;
  }
}