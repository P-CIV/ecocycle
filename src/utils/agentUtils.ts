import { doc, setDoc } from 'firebase/firestore';
import { db } from '@/config/firebase';

export const initializeAgentData = async (userId: string, email: string, name?: string) => {
  try {
    const agentData = {
      id: userId,
      email,
      name: name || email.split('@')[0], // Utilise la partie avant @ si pas de nom
      points: 0,
      totalCollectes: 0,
      totalKg: 0,
      createdAt: new Date().toISOString(),
      lastActive: new Date().toISOString(),
      status: 'active',
      achievements: [],
      niveau: 'Débutant',
      tauxReussite: 100,
    };

    await setDoc(doc(db, 'agents', userId), agentData);
    return agentData;
  } catch (error) {
    console.error('Erreur lors de l\'initialisation des données agent:', error);
    throw error;
  }
};
