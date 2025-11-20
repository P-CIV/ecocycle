import { collection, getDocs, addDoc, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';

/**
 * Initialise les données de test uniquement si les collections sont vides
 * Sera remplacé par les vraies données quand les agents feront des transactions
 */
export const initializeDemoData = async () => {
  try {
    const agentsSnap = await getDocs(collection(db, 'agents'));
    const collectesSnap = await getDocs(collection(db, 'collectes'));
    
    if (agentsSnap.size === 0 && collectesSnap.size === 0) {
      const agentRefs: any[] = [];
      const agents = [
        { nom: 'Jean Dupont', email: 'jean@demo.local', zone: 'zone_nord', totalKg: 0, points: 0 },
        { nom: 'Marie Martin', email: 'marie@demo.local', zone: 'zone_sud', totalKg: 0, points: 0 },
        { nom: 'Pierre Bernard', email: 'pierre@demo.local', zone: 'zone_est', totalKg: 0, points: 0 },
        { nom: 'Sophie Durand', email: 'sophie@demo.local', zone: 'zone_ouest', totalKg: 0, points: 0 },
      ];
      
      for (const agent of agents) {
        const now = new Date();
        const docRef = await addDoc(collection(db, 'agents'), {
          ...agent,
          dateInscription: Timestamp.fromDate(now),
          dernièreActivité: Timestamp.fromDate(now),
          status: 'actif',
          isVerified: true,
          totalCollectes: 0,
        });
        agentRefs.push({ id: docRef.id, ...agent });
      }
      
      const now = new Date();
      const collectesData = [
        { agentIdx: 0, type: 'plastique', quantite: 25, daysAgo: 2 },
        { agentIdx: 1, type: 'metal', quantite: 35, daysAgo: 3 },
        { agentIdx: 2, type: 'verre', quantite: 20, daysAgo: 4 },
        { agentIdx: 3, type: 'papier', quantite: 40, daysAgo: 5 },
      ];
      
      for (const c of collectesData) {
        const date = new Date(now);
        date.setDate(date.getDate() - c.daysAgo);
        
        const collecte = {
          agentId: agentRefs[c.agentIdx].id,
          agentName: agentRefs[c.agentIdx].nom,
          quantite: c.quantite,
          kg: c.quantite,
          type: c.type,
          points: c.quantite * 10,
          zone: agentRefs[c.agentIdx].zone,
          date: Timestamp.fromDate(date),
          status: 'success',
          validé: true,
        };
        
        await addDoc(collection(db, 'collectes'), collecte);
      }
      
      return { success: true, agentsCreated: agentRefs.length, collectesCreated: collectesData.length };
    } else if (agentsSnap.size === 0 || collectesSnap.size === 0) {
      return { success: false, reason: 'Collections incohérentes' };
    } else {
      return { success: true, reason: 'Données existantes' };
    }
  } catch (error) {
    console.error('❌ Erreur initialisation données:', error);
    return { success: false, error };
  }
};

