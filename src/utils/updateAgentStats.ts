import { db } from '@/config/firebase';
import { doc, updateDoc, setDoc, increment, Timestamp } from 'firebase/firestore';

interface UpdateAgentStatsData {
  kg?: number;
  poids?: number;
  points: number;
  status: 'validee' | 'en_attente' | 'rejetee';
  date?: Date;
  agentId: string;
  type?: string;
}

export const updateAgentStats = async (data: UpdateAgentStatsData) => {
  try {
    const agentRef = doc(db, 'agents', data.agentId);
    const userRef = doc(db, 'users', data.agentId);
    
    const poids = data.poids || data.kg || 0;
    // Chaque transaction rapporte exactement 5 points
    const pointsToAdd = data.status === 'validee' ? 5 : 0;

    const agentUpdates = {
      pointsTotaux: increment(pointsToAdd),
      collectesTotales: increment(1),
      derniereActivite: Timestamp.fromDate(new Date()),
    };

    // Mettre à jour les stats de l'agent dans la collection 'agents'
    await updateDoc(agentRef, agentUpdates);

    // IMPORTANT: Aussi mettre à jour les points dans la collection 'users' 
    // pour que le portefeuille de retrait affiche les bons points
    // Utiliser setDoc avec merge:true pour créer le document s'il n'existe pas
    const userUpdates = {
      points: increment(pointsToAdd),
      updatedAt: Timestamp.fromDate(new Date())
    };
    
    await setDoc(userRef, userUpdates, { merge: true }).then(() => {
      console.log(`✅ +${pointsToAdd} points ajoutés au portefeuille de ${data.agentId}`);
    }).catch((error) => {
      console.error('Erreur mise à jour user points:', error);
    });

    console.log(`✅ Stats agent ${data.agentId} mises à jour: +${pointsToAdd} points, +1 collecte`);

    return true;
  } catch (error) {
    console.error('Erreur mise à jour stats:', error);
    return false;
  }
};
