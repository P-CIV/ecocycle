import { useEffect, useState } from 'react';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export function useDebugFirebase() {
  const [debug, setDebug] = useState<{ agentsCount: number; collectesCount: number; agents: any[]; collectes: any[];
    error: string | null;
  }>({ agentsCount: 0, collectesCount: 0, agents: [], collectes: [],
    error: null
  });

  useEffect(() => {
    let unsubscribeAgents: () => void;
    let unsubscribeCollectes: () => void;

    try {
      // Test agents
      const agentsRef = collection(db, 'agents');
      unsubscribeAgents = onSnapshot( agentsRef,
        (snapshot) => {const agentsData = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          }));setDebug(prev => ({
            ...prev, agentsCount: snapshot.size, agents: agentsData
          }));
        },
        (error) => { console.error('✗ Erreur agents:', error);
          setDebug(prev => ({
            ...prev,
            error: `Agents error: ${error.message}`
          }));
        }
      );

      // Test collectes
      const collectesRef = collection(db, 'collectes');
      unsubscribeCollectes = onSnapshot( collectesRef,
        (snapshot) => {const collectesData = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          }));setDebug(prev => ({
            ...prev, collectesCount: snapshot.size, collectes: collectesData
          }));
        },
        (error) => { console.error('✗ Erreur collectes:', error);
          setDebug(prev => ({
            ...prev,
            error: `Collectes error: ${error.message}`
          }));
        }
      );

    } catch (error) { console.error('✗ Erreur setup:', error);
      setDebug(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Unknown error'
      }));
    }

    return () => {
      if (unsubscribeAgents) unsubscribeAgents();
      if (unsubscribeCollectes) unsubscribeCollectes();
    };
  }, []);

  return debug;
}

