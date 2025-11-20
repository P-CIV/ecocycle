import { db } from '@/config/firebase';
import { doc, setDoc, updateDoc } from 'firebase/firestore';

interface AgentInitData {
  uid: string;
  nom: string;
  email: string;
  phone?: string;
  zone?: string;
}

export const initAgentData = async (agentData: AgentInitData) => {
  try {
    // Mise à jour du document utilisateur avec le nom
    await updateDoc(doc(db, 'users', agentData.uid), {
      displayName: agentData.nom
    });
    // Créer le document agent
    await setDoc(doc(db, 'agents', agentData.uid), {
      nom: agentData.nom,
      email: agentData.email,
      phone: agentData.phone || '',
      zone: agentData.zone,
      dateCreation: new Date(),
      pointsTotaux: 0, collectesTotales: 0,
      tauxReussite: 100,
      objectifs: { collectesMois: 300,
        pointsMois: 3000,
        tauxReussiteMin: 95
      },
      derniereActivite: new Date()
    });

    // Créer les statistiques initiales
    await setDoc(doc(db, 'statistiques', agentData.uid), { collectesMois: 0,
      pointsMois: 0, collectesJour: 0, collectesReussies: 0, collectesTotales: 0,
      derniereCollecte: null,
      historiqueCollectes: [],
      historiquePoints: [],
      miseAJour: new Date()
    });return true;
  } catch (error) { console.error('Erreur lors de l\'initialisation des données agent:', error);
    return false;
  }
};
