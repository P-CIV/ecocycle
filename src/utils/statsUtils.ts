import { doc, updateDoc, increment, getDoc, addDoc, collection, serverTimestamp, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

// Si c'est la première fois que l'utilisateur utilise l'app,
// créer un profil avec les valeurs initiales
const initializeUserIfNeeded = async (userId: string) => {
  const userRef = doc(db, 'users', userId);
  const userDoc = await getDoc(userRef);
  
  if (!userDoc.exists()) {
    // Créer le profil avec les valeurs par défaut
    await setDoc(userRef, {
      points: 0,
      totalCollectes: 0,
      totalKg: 0,
      niveau: 'Débutant',
      lastActive: serverTimestamp(),
      createdAt: serverTimestamp()
    });
    return true;
  }
  return false;
};

// Met à jour les statistiques de l'agent après une collecte
// - Enregistre la collecte en base de données
// - Ajoute une activité (log de la collecte)
// - Ajoute des points à l'agent
// - Met à jour le niveau de l'agent
export const updateAgentStats = async (userId: string, newKg: number, typeDechet: string) => {
  try {
    // ÉTAPE 1: S'assurer que l'utilisateur existe en base
    await initializeUserIfNeeded(userId);
    
    // ÉTAPE 2: Récupérer les infos actuelles de l'utilisateur
    const userRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userRef);

    // Calcul des points: 10 points par kg collecté
    const points = newKg * 10;

    // ÉTAPE 3: Enregistrer la collecte dans la base
    const collecteDoc = await addDoc(collection(db, 'collectes'), {
      agentId: userId,
      timestamp: serverTimestamp(),
      points: points,
      poids: newKg,
      type: typeDechet,
      status: 'success'
    });

    // ÉTAPE 4: Enregistrer une activité (trace de la collecte)
    if (collecteDoc.id) {
      try {
        await addDoc(collection(db, 'activites'), {
          agentId: userId,
          type: 'collecte',
          description: `Collecte de ${newKg}kg de ${typeDechet}`,
          timestamp: serverTimestamp(),
          points: points,
          collecteId: collecteDoc.id
        });
      } catch (activityError) {
        console.error('Erreur lors de la création de l\'historique:', activityError);
        // On continue même si l'historique n'est pas créé
      }
    }

    // ÉTAPE 5: Ajouter les points à l'agent
    const userData = userDoc.data();
    const currentPoints = userData?.points || 0;
    const newTotalPoints = currentPoints + points;

    // Mettre à jour l'utilisateur avec les nouvelles données
    await updateDoc(userRef, {
      points: increment(points),
      totalCollectes: increment(1),
      totalKg: increment(newKg),
      lastActive: serverTimestamp(),
      niveau: getNewLevel(newTotalPoints),
    });

    return { points, newTotal: newTotalPoints };
  } catch (error) {
    console.error('Erreur lors de la mise à jour des statistiques:', error);
    throw error;
  }
};

// Détermine le niveau de l'agent selon ses points totaux
// Débutant: 0-1999
// Intermédiaire: 2000-4999
// Avancé: 5000-9999
// Expert: 10000+
const getNewLevel = (totalPoints: number) => {
  if (totalPoints >= 10000) return 'Expert';
  if (totalPoints >= 5000) return 'Avancé';
  if (totalPoints >= 2000) return 'Intermédiaire';
  return 'Débutant';
};