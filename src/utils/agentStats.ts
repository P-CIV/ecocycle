import { db } from '@/config/firebase';
import { collection, query, where, getDocs, orderBy, limit, Timestamp, getDoc, doc } from 'firebase/firestore';

export interface AgentStats {
  collectesMois: number;
  pointsGagnes: number;
  tauxReussite: number;
  collectesAujourdhui: number;
  objectifCollectes: number;
  objectifPoints: number;
  evolutionCollectes: Array<{ mois: string; kg: number; points: number }>;
  performanceHebdo: Array<{ jour: string; collectes: number }>;
  classement: Array<{ rank: number; name: string; points: number; isMe: boolean }>;
  infoAgent?: {
    nom: string;
    email: string;
    dateCreation: Date;
    derniereActivite: Date;
  };
}

const getPerformanceHebdo = async (agentId: string): Promise<Array<{ jour: string; collectes: number }>> => {
  const now = new Date();
  const debutSemaine = new Date(now);
  debutSemaine.setDate(now.getDate() - 7);
  
  const collectesRef = collection(db, 'collectes');
  const queryHebdo = query(
    collectesRef,
    where('agentId', '==', agentId),
    where('date', '>=', Timestamp.fromDate(debutSemaine)),
    orderBy('date', 'asc')
  );
  
  const collectes = await getDocs(queryHebdo);
  const performanceParJour = new Map<string, number>();
  
  const joursMap: { [key: number]: string } = {
    0: 'Dim', 1: 'Lun', 2: 'Mar', 3: 'Mer', 4: 'Jeu', 5: 'Ven', 6: 'Sam'
  };
  
  // Initialiser tous les jours avec 0
  for (let i = 6; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(now.getDate() - i);
    performanceParJour.set(joursMap[date.getDay()], 0);
  }
  
  // Remplir avec les données réelles
  collectes.forEach(doc => {
    const data = doc.data();
    const date = data.date.toDate();
    const jour = joursMap[date.getDay()];
    performanceParJour.set(jour, (performanceParJour.get(jour) || 0) + 1);
  });
  
  return Array.from(performanceParJour.entries()).map(([jour, collectes]) => ({
    jour,
    collectes
  }));
};

const getEvolutionCollectes = async (agentId: string): Promise<Array<{ mois: string; kg: number; points: number }>> => {
  const now = new Date();
  const debutPeriode = new Date(now);
  debutPeriode.setMonth(now.getMonth() - 5); // 6 derniers mois
  
  const collectesRef = collection(db, 'collectes');
  const queryEvolution = query(
    collectesRef,
    where('agentId', '==', agentId),
    where('date', '>=', Timestamp.fromDate(debutPeriode)),
    orderBy('date', 'asc')
  );
  
  const collectes = await getDocs(queryEvolution);
  const evolutionParMois = new Map<string, { kg: number; points: number }>();
  
  const moisMap: { [key: number]: string } = {
    0: 'Jan', 1: 'Fév', 2: 'Mar', 3: 'Avr', 4: 'Mai', 5: 'Juin',
    6: 'Juil', 7: 'Août', 8: 'Sep', 9: 'Oct', 10: 'Nov', 11: 'Déc'
  };
  
  // Initialiser les 6 derniers mois avec 0
  for (let i = 5; i >= 0; i--) {
    const date = new Date(now);
    date.setMonth(now.getMonth() - i);
    evolutionParMois.set(moisMap[date.getMonth()], { kg: 0, points: 0 });
  }
  
  // Remplir avec les données réelles
  collectes.forEach(doc => {
    const data = doc.data();
    const date = data.date.toDate();
    const mois = moisMap[date.getMonth()];
    const current = evolutionParMois.get(mois) || { kg: 0, points: 0 };
    evolutionParMois.set(mois, {
      kg: current.kg + data.kg,
      points: current.points + (data.status === 'validee' ? data.points : 0)
    });
  });
  
  return Array.from(evolutionParMois.entries()).map(([mois, stats]) => ({
    mois,
    ...stats
  }));
};

export const getAgentStats = async (agentId: string): Promise<AgentStats> => {
  try {
    const now = new Date();
    const debutMois = new Date(now.getFullYear(), now.getMonth(), 1);
    const debutJour = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    // Récupérer les informations de l'agent
    const agentDoc = await getDoc(doc(db, 'agents', agentId));
    if (!agentDoc.exists()) {
      throw new Error('Agent non trouvé');
    }
    
    const agentData = agentDoc.data();
    const infoAgent = {
      nom: agentData.nom,
      email: agentData.email,
      dateCreation: agentData.dateCreation.toDate(),
      derniereActivite: agentData.derniereActivite.toDate()
    };

    // Récupérer les collectes du mois
    const collectesRef = collection(db, 'collectes');
    const queryMois = query(
      collectesRef,
      where('agentId', '==', agentId),
      where('date', '>=', Timestamp.fromDate(debutMois))
    );
    
    const collectesMois = await getDocs(queryMois);
    let totalKg = 0;
    let totalPoints = 0;
    let totalCollectes = 0;
    let collectesReussies = 0;

    collectesMois.forEach(doc => {
      const data = doc.data();
      totalKg += data.kg;
      totalPoints += data.points;
      totalCollectes++;
      if (data.status === 'validee') collectesReussies++;
    });

    // Récupérer les collectes du jour
    const queryJour = query(
      collectesRef,
      where('agentId', '==', agentId),
      where('date', '>=', Timestamp.fromDate(debutJour))
    );
    const collectesAujourdhui = (await getDocs(queryJour)).size;

    // Récupérer le classement
    const agentsRef = collection(db, 'agents');
    const queryClassement = query(agentsRef, orderBy('pointsTotaux', 'desc'), limit(10));
    const classementSnap = await getDocs(queryClassement);
    
    const classement = classementSnap.docs.map((doc, index) => ({
      rank: index + 1,
      name: doc.data().nom,
      points: doc.data().pointsTotaux,
      isMe: doc.id === agentId
    }));

    // Calculer les statistiques
    const tauxReussite = totalCollectes > 0 ? (collectesReussies / totalCollectes) * 100 : 0;

    return {
      collectesMois: totalKg,
      pointsGagnes: totalPoints,
      tauxReussite,
      collectesAujourdhui,
      objectifCollectes: 300, // À récupérer depuis la collection 'objectifs'
      objectifPoints: 3000,   // À récupérer depuis la collection 'objectifs'
      evolutionCollectes: await getEvolutionCollectes(agentId),
      performanceHebdo: await getPerformanceHebdo(agentId),
      classement,
      infoAgent
    };
  } catch (error) {
    console.error('Erreur lors de la récupération des statistiques:', error);
    throw error;
  }
};
