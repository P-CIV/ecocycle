import { collection, getDocs, deleteDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { initializeDemoData } from './initializeDemoData';

/**
 * Nettoie et réinitialise les données de démonstration
 * Utile pour tester et déboguer
 */
export const resetDemoData = async () => {
  try {// Supprimer tous les agents
    const agentsSnap = await getDocs(collection(db, 'agents'));
    let agentsDeleted = 0;
    for (const doc of agentsSnap.docs) {
      await deleteDoc(doc.ref); agentsDeleted++;
    } // Supprimer toutes les collectes
    const collectesSnap = await getDocs(collection(db, 'collectes'));
    let collectesDeleted = 0;
    for (const doc of collectesSnap.docs) {
      await deleteDoc(doc.ref); collectesDeleted++;
    } // Réinitialiser les données const result = await initializeDemoData();return { success: true, agentsDeleted, collectesDeleted, reinitialization: result };
  } catch (error) { console.error('❌ Erreur lors du reset:', error);
    return { success: false, error };
  }
};

/**
 * Affiche l'état actuel des données
 */
export const checkDataStatus = async () => {
  try {
    const agentsSnap = await getDocs(collection(db, 'agents'));
    const collectesSnap = await getDocs(collection(db, 'collectes'));
    
    if (agentsSnap.size > 0) {
      agentsSnap.docs.forEach((doc) => {
        const data = doc.data();
        console.log(`Agent: ${data.nom} - Zone: ${data.zone}`);
      });
    }
    
    if (collectesSnap.size > 0) {
      collectesSnap.docs.slice(0, 5).forEach((doc) => {
        const data = doc.data();
        console.log(`Collecte: ${data.type} - ${data.kg}kg`);
      });
    }
    
    return { agents: agentsSnap.size, collectes: collectesSnap.size };
  } catch (error) {
    console.error('❌ Erreur lors de la vérification:', error);
    return { error };
  }
};

