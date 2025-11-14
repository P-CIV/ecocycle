import { db } from '@/config/firebase';
import { doc, updateDoc, increment, getDoc, Timestamp } from 'firebase/firestore';

interface CollecteData {
  kg: number;
  points: number;
  status: 'en_attente' | 'validee' | 'rejetee';
  date: Date;
  agentId: string;
}

export const updateAgentStats = async (collecteData: CollecteData) => {
  try {
    const agentRef = doc(db, 'agents', collecteData.agentId);
    const statsRef = doc(db, 'statistiques', collecteData.agentId);

    // Récupérer les stats actuelles
    const statsDoc = await getDoc(statsRef);
    const stats = statsDoc.data() || {};
    
    // Calculer le nouveau taux de réussite
    let tauxReussite = stats.tauxReussite || 100;
    if (collecteData.status === 'validee' || collecteData.status === 'rejetee') {
      const totalCollectes = (stats.collectesTotales || 0) + 1;
      const collectesReussies = (stats.collectesReussies || 0) + (collecteData.status === 'validee' ? 1 : 0);
      tauxReussite = (collectesReussies / totalCollectes) * 100;
    }

    // Mettre à jour les statistiques
    const updates: {
      pointsTotaux: any;
      collectesTotales: any;
      derniereActivite: Timestamp;
      tauxReussite: number;
    } = {
      pointsTotaux: increment(collecteData.status === 'validee' ? collecteData.points : 0),
      collectesTotales: increment(1),
      derniereActivite: Timestamp.fromDate(new Date()),
      tauxReussite: tauxReussite
    };

    // Mettre à jour le document agent
    await updateDoc(agentRef, updates);

    // Mettre à jour les statistiques
    await updateDoc(statsRef, {
      collectesMois: increment(collecteData.kg),
      pointsMois: increment(collecteData.status === 'validee' ? collecteData.points : 0),
      collectesJour: increment(1),
      collectesTotales: increment(1),
      collectesReussies: increment(collecteData.status === 'validee' ? 1 : 0),
      derniereCollecte: Timestamp.fromDate(collecteData.date),
      miseAJour: Timestamp.fromDate(new Date())
    });

    return true;
  } catch (error) {
    console.error('Erreur lors de la mise à jour des statistiques:', error);
    return false;
  }
};