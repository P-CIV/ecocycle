import { collection, getDocs, addDoc, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';

/**
 * Initialise les données de test uniquement si les collections sont vides
 * Sera remplacé par les vraies données quand les agents feront des transactions
 */
export const initializeDemoData = async () => {
  try { console.log('🔍 Vérification des données en Firebase...');
    
    // Vérifier si agents existe et est vide
    const agentsSnap = await getDocs(collection(db, 'agents'));
    const collectesSnap = await getDocs(collection(db, 'collectes')); console.log(`📊 Agents actuels: ${agentsSnap.size}, Collectes actuelles: ${collectesSnap.size}`);
    
    // Créer les données de démonstration si les deux collections sont vides
    if (agentsSnap.size === 0 && collectesSnap.size === 0) { console.log('🆕 Initialisation des données de démonstration...');
      
      // Créer des agents
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
        agentRefs.push({ id: docRef.id, ...agent }); console.log(`✅ Agent créé: ${agent.nom} (${docRef.id})`);
      }
      
      // Créer des collectes de démonstration (6 derniers mois)
      const now = new Date();
      const collectesData = [
        // Semaine dernière (récent)
        { agentIdx: 0, type: 'plastique', quantite: 25, daysAgo: 2 },
        { agentIdx: 1, type: 'metal', quantite: 35, daysAgo: 3 },
        { agentIdx: 2, type: 'verre', quantite: 20, daysAgo: 4 },
        { agentIdx: 3, type: 'papier', quantite: 40, daysAgo: 5 },
        
        // 2 semaines
        { agentIdx: 0, type: 'papier', quantite: 30, daysAgo: 8 },
        { agentIdx: 1, type: 'plastique', quantite: 28, daysAgo: 9 },
        { agentIdx: 2, type: 'metal', quantite: 33, daysAgo: 10 },
        { agentIdx: 3, type: 'verre', quantite: 22, daysAgo: 11 },
        
        // 1 mois
        { agentIdx: 0, type: 'metal', quantite: 22, daysAgo: 20 },
        { agentIdx: 1, type: 'verre', quantite: 40, daysAgo: 21 },
        { agentIdx: 2, type: 'plastique', quantite: 18, daysAgo: 22 },
        { agentIdx: 3, type: 'papier', quantite: 35, daysAgo: 23 },
        
        // 2 mois
        { agentIdx: 0, type: 'papier', quantite: 32, daysAgo: 35 },
        { agentIdx: 1, type: 'metal', quantite: 25, daysAgo: 36 },
        { agentIdx: 2, type: 'verre', quantite: 28, daysAgo: 37 },
        { agentIdx: 3, type: 'plastique', quantite: 30, daysAgo: 38 },
        
        // 3 mois
        { agentIdx: 0, type: 'plastique', quantite: 26, daysAgo: 55 },
        { agentIdx: 1, type: 'papier', quantite: 36, daysAgo: 56 },
        { agentIdx: 2, type: 'metal', quantite: 24, daysAgo: 57 },
        { agentIdx: 3, type: 'verre', quantite: 32, daysAgo: 58 },
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
      } console.log(`✅ Données de démonstration créées: ${agentRefs.length} agents, ${collectesData.length} collectes`);
      return { success: true, agentsCreated: agentRefs.length, collectesCreated: collectesData.length };
    } else if (agentsSnap.size === 0 || collectesSnap.size === 0) { console.log('⚠️ Une des collections est vide. Données incohérentes.'); console.log(` Agents: ${agentsSnap.size}, Collectes: ${collectesSnap.size}`);
      return { success: false, reason: 'Collections incohérentes' };
    } else { console.log(`✅ Les données existent déjà (${agentsSnap.size} agents, ${collectesSnap.size} collectes)`);
      return { success: true, reason: 'Données existantes' };
    }
  } catch (error) { console.error('❌ Erreur initialisation données:', error);
    return { success: false, error };
  }
};
