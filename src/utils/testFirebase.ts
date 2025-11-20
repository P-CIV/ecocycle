import { auth, db } from '@/lib/firebase';
import { collection, getDocs, doc, getDoc } from 'firebase/firestore';

export const testFirebaseConnection = async () => {
  try {
    const collections = ['collectes', 'points', 'statistiques'];
    for (const collectionName of collections) {
      try {
        const collectionRef = collection(db, collectionName);
        await getDocs(collectionRef);
      } catch (error) {
        console.error(`Erreur avec la collection ${collectionName}:`, error);
      }
    }

    if (auth.currentUser) {
      const userDoc = doc(db, 'users', auth.currentUser.uid);
      await getDoc(userDoc);
    }

    return true;
  } catch (error) {
    console.error('Erreur lors du test de connexion:', error);
    return false;
  }
};
