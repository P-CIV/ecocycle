import { collection, getDocs, deleteDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { initializeDemoData } from './initializeDemoData';

/**
 * Nettoie et réinitialise les données de démonstration
 * Utile pour tester et déboguer
 */
export const resetDemoData = async () => {
  try { console.log('🧹 Nettoyage des collections...');
    
    // Supprimer tous les agents
    const agentsSnap = await getDocs(collection(db, 'agents'));
    let agentsDeleted = 0;
    for (const doc of agentsSnap.docs) {
      await deleteDoc(doc.ref); agentsDeleted++;
    } console.log(`🗑️  ${agentsDeleted} agents supprimés`);
    
    // Supprimer toutes les collectes
    const collectesSnap = await getDocs(collection(db, 'collectes'));
    let collectesDeleted = 0;
    for (const doc of collectesSnap.docs) {
      await deleteDoc(doc.ref); collectesDeleted++;
    } console.log(`🗑️  ${collectesDeleted} collectes supprimées`);
    
    // Réinitialiser les données console.log('🔄 Réinitialisation des données...');
    const result = await initializeDemoData(); console.log('✅ Reset complet:', result);
    return { success: true, agentsDeleted, collectesDeleted, reinitialization: result };
  } catch (error) { console.error('❌ Erreur lors du reset:', error);
    return { success: false, error };
  }
};

/**
 * Affiche l'état actuel des données
 */
export const checkDataStatus = async () => {
  try { console.log('📊 Vérification de l\'état des données...');
    
    const agentsSnap = await getDocs(collection(db, 'agents'));
    const collectesSnap = await getDocs(collection(db, 'collectes')); console.log(`👥 Agents: ${agentsSnap.size}`); console.log(`📦 Collectes: ${collectesSnap.size}`);
    
    if (agentsSnap.size > 0) { console.log('👥 Agents:'); agentsSnap.docs.forEach((doc, i) => {
        const data = doc.data(); console.log(`  ${i + 1}. ${data.nom} (${doc.id}) - Zone: ${data.zone}`);
      });
    }
    
    if (collectesSnap.size > 0) { console.log('📦 Dernières collectes:'); collectesSnap.docs.slice(0, 5).forEach((doc, i) => {
        const data = doc.data(); console.log(`  ${i + 1}. ${data.agentName} - ${data.kg}kg de ${data.type}`);
      });
    }
    
    return { agents: agentsSnap.size, collectes: collectesSnap.size,
    };
  } catch (error) { console.error('❌ Erreur lors de la vérification:', error);
    return { error };
  }
};
