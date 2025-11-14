import { useState, useEffect } from 'react';
import { collection, onSnapshot, Timestamp, query } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export interface CollecteValidation {
  id: string;
  agentId: string;
  agentName: string;
  type: string;
  kg: number;
  quantite?: number;
  date: Date;
  points: number;
  verified: boolean;
  status: 'pending' | 'approved' | 'rejected';
}

interface ValidationStatsData {
  totalCollectes: number;
  collectesPending: number;
  collectesApproved: number;
  collectesRejected: number;
  collectesVerifies: CollecteValidation[];
  pointsPending: number;
  pointsApproved: number;
}

interface ValidationStats {
  data: ValidationStatsData;
  loading: boolean;
  error: Error | null;
}

export const useValidationStats = (): ValidationStats => {
  const [stats, setStats] = useState<ValidationStats>({
    data: {
      totalCollectes: 0,
      collectesPending: 0,
      collectesApproved: 0,
      collectesRejected: 0,
      collectesVerifies: [],
      pointsPending: 0,
      pointsApproved: 0,
    },
    loading: true,
    error: null,
  });

  useEffect(() => {
    let isMounted = true;

    const setupListeners = async () => {
      try {
        // Créer les queries
        const collectesQuery = query(collection(db, 'collectes'));
        const agentsQuery = query(collection(db, 'agents'));

        let agentsData: Map<string, any> = new Map();

        // D'abord récupérer les agents
        const agentsUnsubscribe = onSnapshot(agentsQuery, (agentsSnapshot) => {
          agentsData = new Map();
          agentsSnapshot.forEach((doc) => {
            agentsData.set(doc.id, doc.data());
          });
        });

        // Ensuite recevoir les collectes
        const collectesUnsubscribe = onSnapshot(collectesQuery, (collectesSnapshot) => {
          if (!isMounted) return;

          const collectesVerifies: CollecteValidation[] = [];
          let totalCollectes = 0;
          let collectesPending = 0;
          let collectesApproved = 0;
          let collectesRejected = 0;
          let pointsPending = 0;
          let pointsApproved = 0;

          collectesSnapshot.forEach((doc) => {
            const data = doc.data();
            const agentData = agentsData.get(data.agentId) || {};
            
            totalCollectes++;

            let collecteDate: Date;
            try {
              collecteDate = data.date instanceof Timestamp 
                ? data.date.toDate() 
                : new Date(data.date);
            } catch {
              collecteDate = new Date();
            }

            const collecte: CollecteValidation = {
              id: doc.id,
              agentId: data.agentId || '',
              agentName: agentData.name || 'Agent inconnu',
              type: data.type || 'Non spécifié',
              kg: Number(data.kg) || 0,
              quantite: data.quantite,
              date: collecteDate,
              points: Number(data.points) || 0,
              verified: Boolean(data.verified),
              status: (data.status as 'pending' | 'approved' | 'rejected') || 'pending',
            };

            collectesVerifies.push(collecte);

            // Compter les statuts
            if (collecte.status === 'pending') {
              collectesPending++;
              pointsPending += collecte.points;
            } else if (collecte.status === 'approved') {
              collectesApproved++;
              pointsApproved += collecte.points;
            } else if (collecte.status === 'rejected') {
              collectesRejected++;
            }
          });

          // Trier par date décroissante (les plus récentes d'abord)
          collectesVerifies.sort((a, b) => b.date.getTime() - a.date.getTime());

          setStats({
            data: {
              totalCollectes,
              collectesPending,
              collectesApproved,
              collectesRejected,
              collectesVerifies,
              pointsPending,
              pointsApproved,
            },
            loading: false,
            error: null,
          });
        });

        return () => {
          collectesUnsubscribe();
          agentsUnsubscribe();
        };
      } catch (error) {
        if (isMounted) {
          setStats((prev) => ({
            ...prev,
            loading: false,
            error: error instanceof Error ? error : new Error('Erreur inconnue'),
          }));
        }
      }
    };

    setupListeners();

    return () => {
      isMounted = false;
    };
  }, []);

  return stats;
};
