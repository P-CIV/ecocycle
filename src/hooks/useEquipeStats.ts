import { useState, useEffect } from 'react';
import { collection, onSnapshot, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';

interface Agent {
  id: string;
  nom?: string;
  name?: string;
  email?: string;
  phone?: string;
  tel?: string;
  points?: number;
  totalCollectes?: number;
  totalKg?: number; collectes?: number;
  kg?: number;
  zone?: string;
  status?: string;
  statut?: string;
  dateInscription?: Timestamp;
  dernièreActivité?: Timestamp;
  avatar?: string;
  initiales?: string;
}

export interface EquipeStats { agents: Agent[];
  totalAgents: number; agentsActifs: number;
  pointsMoyens: number;
  totalPoints: number;
}

export const useEquipeStats = () => {
  const [stats, setStats] = useState<EquipeStats>({ agents: [],
    totalAgents: 0, agentsActifs: 0,
    pointsMoyens: 0,
    totalPoints: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);

    try {
      const agentsRef = collection(db, 'agents');
      
      const unsubscribe = onSnapshot(agentsRef, (snapshot) => {
        try {
          const agentsList: Agent[] = [];
          let totalPoints = 0;
          let agentsActifs = 0;

          snapshot.forEach((doc) => {
            const data = doc.data();
            
            // Normaliser les données (gérer les variantes de noms de champs)
            const agent: Agent = {
              id: doc.id,
              nom: data.nom || data.name || 'Inconnu',
              email: data.email || '',
              phone: data.phone || data.tel || '',
              tel: data.tel || data.phone || '',
              points: typeof data.points === 'number' ? data.points : 0,
              totalCollectes: typeof data.totalCollectes === 'number' ? data.totalCollectes : (typeof data.collectes === 'number' ? data.collectes : 0), collectes: typeof data.collectes === 'number' ? data.collectes : (typeof data.totalCollectes === 'number' ? data.totalCollectes : 0),
              totalKg: typeof data.totalKg === 'number' ? data.totalKg : (typeof data.kg === 'number' ? data.kg : 0),
              kg: typeof data.kg === 'number' ? data.kg : (typeof data.totalKg === 'number' ? data.totalKg : 0),
              zone: data.zone || 'N/A',
              status: data.status || data.statut || 'actif',
              statut: data.statut || data.status || 'actif',
              dateInscription: data.dateInscription,
              dernièreActivité: data.dernièreActivité,
              avatar: data.avatar,
              initiales: data.initiales || generateInitiales(data.nom || data.name || 'Inconnu'),
            }; agentsList.push(agent);
            totalPoints += agent.points || 0;
            
            // Compter les agents actifs
            if ((agent.statut || agent.status) === 'actif') { agentsActifs++;
            }
          });

          // Trier par points décroissants agentsList.sort((a, b) => (b.points || 0) - (a.points || 0));

          const pointsMoyens = agentsList.length > 0 ? Math.round(totalPoints / agentsList.length) : 0;

          setStats({ agents: agentsList,
            totalAgents: agentsList.length, agentsActifs,
            pointsMoyens,
            totalPoints,
          });

          setLoading(false);
        } catch (err) { console.error('❌ Erreur lors du traitement des agents:', err);
          setError(err instanceof Error ? err : new Error('Erreur inconnue'));
          setLoading(false);
        }
      }, (error) => { console.error('❌ Erreur Firebase lors de la lecture des agents:', error);
        setError(error);
        setLoading(false);
      });

      return () => unsubscribe();
    } catch (err) { console.error('❌ Erreur lors de la configuration du listener:', err);
      setError(err instanceof Error ? err : new Error('Erreur inconnue'));
      setLoading(false);
    }
  }, []);

  return { stats, loading, error };
};

// Fonction utilitaire pour générer les initiales
function generateInitiales(nom: string): string {
  return nom
    .split(' ')
    .map(word => word.charAt(0))
    .join('')
    .toUpperCase()
    .slice(0, 2);
}
