import { db } from '@/lib/firebase';
import { collection, getDocs, query, where } from 'firebase/firestore';

export const debugCollectes = async (userId: string) => {
  try {
    const collectesRef = collection(db, 'collectes');
    
    const allCollectes = await getDocs(collectesRef);
    console.log('Total collectes dans DB:', allCollectes.size);
    console.log('Toutes les collectes:', allCollectes.docs.map(d => ({
      id: d.id,
      agentId: d.data().agentId,
      timestamp: d.data().timestamp,
      poids: d.data().poids,
      type: d.data().type
    })));

    const userCollectesQuery = query(
      collectesRef,
      where('agentId', '==', userId)
    );
    const userCollectes = await getDocs(userCollectesQuery);
    console.log('Collectes de l\'utilisateur:', userCollectes.size);
    console.log('Collectes user:', userCollectes.docs.map(d => ({
      id: d.id,
      agentId: d.data().agentId,
      timestamp: d.data().timestamp,
      poids: d.data().poids,
      type: d.data().type
    })));

    const agentsRef = collection(db, 'agents');
    const allAgents = await getDocs(agentsRef);
    console.log('Total agents dans DB:', allAgents.size);
    console.log('Tous les agents:', allAgents.docs.map(d => ({
      id: d.id,
      pointsTotaux: d.data().pointsTotaux,
      collectesTotales: d.data().collectesTotales
    })));

  } catch (error) {
    console.error('Erreur debug:', error);
  }
};
