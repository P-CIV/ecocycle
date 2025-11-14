import { auth, db } from '@/lib/firebase';
import { collection, getDocs, doc, getDoc } from 'firebase/firestore';

export const testFirebaseConnection = async () => {
  try {
    // Test de la connexion Firestore avec les collections autorisées console.log('Test de la connexion à Firestore...');
    
    // Test des collections accessibles pour l'agent
    const collections = ['collectes', 'points', 'statistiques']; console.log('Vérification des collections autorisées...');
    
    for (const collectionName of collections) {
      try {
        const collectionRef = collection(db, collectionName);
        await getDocs(collectionRef); console.log(`✅ Collection ${collectionName} accessible`);
      } catch (error) { console.error(`❌ Erreur avec la collection ${collectionName}:`, error);
      }
    }

    // Test des règles de sécurité console.log('Test des règles de sécurité...');
    if (auth.currentUser) {
      const userDoc = doc(db, 'users', auth.currentUser.uid);
      const userSnapshot = await getDoc(userDoc); console.log('✅ Lecture des données utilisateur réussie'); console.log('État de l\'utilisateur:', userSnapshot.exists() ? 'Document trouvé' : 'Document non trouvé');
    } else { console.log('⚠️ Aucun utilisateur connecté pour tester les règles de sécurité');
    }

    return true;
  } catch (error) { console.error('❌ Erreur lors du test de connexion:', error);
    return false;
  }
};