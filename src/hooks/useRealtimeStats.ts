import { useState, useEffect } from 'react';
import { 
  onSnapshot, 
  query, 
  collection, 
  where, 
  orderBy,
  Timestamp
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/contexts/AuthContext';

export interface Agent {
  id: string;
  pointsTotaux: number;
  totalCollectes: number;
}

interface Activity {
  id: string;
  type: 'collecte' | 'points' | 'objectif';
  description: string;
  timestamp: Timestamp;
  points?: number;
  agentId: string;
}

export interface Collecte {
  id: string;
  timestamp: Timestamp;
  points: number;
  poids: number;
  type: string;
  status: 'success' | 'pending' | 'failed';
  agentId: string;
}

export interface RealtimeStats {
  collectesMois: number;
  collectesKgMois: number;
  pointsGagnes: number;
  tauxReussite: number;
  collectesAujourdhui: number;
  joursActifs: number;
  joursTotaux: number;
  evolutionCollectes: Array<{
    mois: string;
    kg: number;
    points: number;
  }>;
  performanceHebdo: Array<{
    jour: string;
    collectes: number;
  }>;
  totalAnnee: {
    kg: number;
    points: number;
  };
  moyenneMensuelle: {
    kg: number;
    evolution: number;
  };
  repartitionParType: Array<{
    type: string;
    quantite: number;
  }>;
  comparaisonEquipe: {
    position: number;
    total: number;
    ecartPremier: number;
    ecartMoyenne: number;
  };
  scansRecents: Array<{
    id: string;
    timestamp: Date;
    points: number;
    type: string;
    status: 'success' | 'pending' | 'failed';
  }>;
  activitesRecentes: Array<{
    id: string;
    type: 'collecte' | 'points' | 'objectif';
    description: string;
    timestamp: Date;
    points?: number;
  }>;
}



const initialStats: RealtimeStats = {
  collectesMois: 0,
  collectesKgMois: 0,
  pointsGagnes: 0,
  tauxReussite: 0,
  collectesAujourdhui: 0,
  joursActifs: 0,
  joursTotaux: 0,
  evolutionCollectes: [],
  performanceHebdo: [],
  totalAnnee: {
    kg: 0,
    points: 0
  },
  moyenneMensuelle: {
    kg: 0,
    evolution: 0
  },
  repartitionParType: [],
  comparaisonEquipe: {
    position: 0,
    total: 0,
    ecartPremier: 0,
    ecartMoyenne: 0
  },
  scansRecents: [],
  activitesRecentes: []
};

export const useRealtimeStats = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<RealtimeStats>(initialStats);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user?.uid) {
      setLoading(false);
      return;
    }

    setLoading(true);

    // Collection de référence pour les activités
    const activitesRef = collection(db, 'activites');
    const collectesRef = collection(db, 'collectes');
    
    const activitesQuery = query(
      activitesRef,
      where('agentId', '==', user.uid)
    );

    const collectesQuery = query(
      collectesRef,
      where('agentId', '==', user.uid)
    );

    // Fonction pour calculer les statistiques
    const toDate = (timestamp: any): Date | null => {
      if (!timestamp) return null;
      if (timestamp.toDate) return timestamp.toDate();
      if (timestamp instanceof Date) return timestamp;
      return null;
    };

    // Fonction pour obtenir la date d'une collecte (gère les deux formats: date et timestamp)
    const getCollecteDate = (collecte: any): Date | null => {
      const ts = collecte.timestamp || collecte.date;
      return toDate(ts);
    };

    const calculateStats = (
      activites: Activity[], 
      collectes: Collecte[],
      agents: Agent[]
    ): RealtimeStats => {
      const now = new Date();
      const debutMois = new Date(now.getFullYear(), now.getMonth(), 1);
      const aujourdhui = new Date(now.getFullYear(), now.getMonth(), now.getDate());

      // Fonction utilitaire pour obtenir le poids (ancien champ 'kg' ou nouveau 'poids')
      const getPoids = (collecte: any): number => {
        return (collecte.poids ?? collecte.kg ?? 0);
      };

      const collectesMois = collectes.filter(c => {
        const cDate = getCollecteDate(c);
        return cDate && cDate >= debutMois;
      });

      const collectesKgMois = collectesMois.reduce((acc, curr) => acc + getPoids(curr), 0);

      const collectesAujourdhui = collectes.filter(c => {
        const cDate = getCollecteDate(c);
        return cDate && cDate >= aujourdhui;
      });

      const pointsGagnes = collectesMois.reduce((acc, curr) => acc + curr.points, 0);

      const totalTentatives = collectesMois.length;
      const reussies = collectesMois.filter(c => c.status === 'success').length;
      const tauxReussite = totalTentatives ? (reussies / totalTentatives) * 100 : 0;

      const evolutionCollectes = [...Array(6)].map((_, i) => {
        const moisDate = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const collectesDuMois = collectes.filter(c => {
          const date = getCollecteDate(c);
          return date && date.getMonth() === moisDate.getMonth() &&
                 date.getFullYear() === moisDate.getFullYear();
        });
        
        return {
          mois: moisDate.toLocaleDateString('fr-FR', { month: 'short' }),
          kg: collectesDuMois.reduce((acc, curr) => acc + getPoids(curr), 0),
          points: collectesDuMois.reduce((acc, curr) => acc + (curr.points || 0), 0)
        };
      }).reverse();

      const performanceHebdo = [...Array(7)].map((_, i) => {
        const jour = new Date(now);
        jour.setDate(now.getDate() - i);
        const collectesDuJour = collectes.filter(c => {
          const date = getCollecteDate(c);
          return date && date.toDateString() === jour.toDateString();
        });

        return {
          jour: jour.toLocaleDateString('fr-FR', { weekday: 'short' }),
          collectes: collectesDuJour.length
        };
      }).reverse();

      const scansRecents = collectes
        .filter(c => getCollecteDate(c) !== null)
        .slice(0, 5)
        .map(c => ({
          id: c.id,
          timestamp: getCollecteDate(c)!,
          points: c.points,
          type: c.type,
          status: c.status
        }));

      const activitesRecentes = activites
        .filter(a => toDate(a.timestamp) !== null)
        .slice(0, 5)
        .map(a => ({
          id: a.id,
          type: a.type,
          description: a.description,
          timestamp: toDate(a.timestamp)!,
          points: a.points
        }));

      const debutAnnee = new Date(now.getFullYear(), 0, 1);
      const collectesAnnee = collectes.filter(c => {
        const cDate = getCollecteDate(c);
        return cDate && cDate >= debutAnnee;
      });

      const totalAnnee = collectesAnnee.reduce((acc, curr) => ({
        kg: acc.kg + getPoids(curr),
        points: acc.points + (curr.points || 0)
      }), { kg: 0, points: 0 });

      const moisActuel = now.getMonth() + 1;
      const moyenneMensuelle = {
        kg: moisActuel > 0 ? Math.round(totalAnnee.kg / moisActuel) : 0,
        evolution: 0
      };

      if (moisActuel > 1) {
        const moisPrecedent = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const finMoisPrecedent = new Date(now.getFullYear(), now.getMonth(), 0);
        
        const collectesMoisPrecedent = collectes.filter(c => {
          const date = getCollecteDate(c);
          return date && date >= moisPrecedent && date <= finMoisPrecedent;
        });

        const totalMoisPrecedent = collectesMoisPrecedent.reduce((acc, curr) => acc + getPoids(curr), 0);

        if (totalMoisPrecedent > 0) {
          const evolution = ((moyenneMensuelle.kg - totalMoisPrecedent) / totalMoisPrecedent) * 100;
          moyenneMensuelle.evolution = Number(evolution.toFixed(1));
        }
      }

      const typesDeDechet = ['plastique', 'papier', 'verre', 'polystyrène', 'carton'];
      const repartitionParType = typesDeDechet.map(type => {
        const collectesType = collectes.filter(c => (c.type || 'autre').toLowerCase() === type.toLowerCase());
        const quantite = collectesType.reduce((acc, curr) => acc + getPoids(curr), 0);
        return {
          type: type.charAt(0).toUpperCase() + type.slice(1),
          quantite
        };
      }).filter(t => t.quantite > 0);
      
      console.log('📦 Répartition par type:', {
        total_collectes: collectes.length,
        collectes_par_type: repartitionParType,
        types_bruts: collectes.map(c => ({ type: c.type, poids: getPoids(c) }))
      });

      const position = agents.findIndex(a => a.id === user.uid) + 1;
      const premierAgent = agents[0];
      const mesStats = agents.find(a => a.id === user.uid);
      const moyennePoints = agents.length > 0 ? 
        agents.reduce((acc, curr) => acc + curr.pointsTotaux, 0) / agents.length : 0;

      const comparaisonEquipe = {
        position: agents.length > 0 ? Math.min(position, agents.length) : 0,
        total: agents.length,
        ecartPremier: premierAgent && mesStats ? Math.max(0, premierAgent.pointsTotaux - mesStats.pointsTotaux) : 0,
        ecartMoyenne: mesStats && moyennePoints > 0 ? 
          Math.round(((mesStats.pointsTotaux - moyennePoints) / moyennePoints) * 100) : 0
      };

      const joursUniques = new Set(
        collectesMois
          .map(c => {
            const date = getCollecteDate(c);
            return date?.toISOString().split('T')[0];
          })
          .filter((d): d is string => !!d)
      );
      const joursActifs = joursUniques.size;

      const joursTotaux = new Date(
        now.getFullYear(),
        now.getMonth() + 1,
        0
      ).getDate();

      return {
        collectesMois: collectesMois.length,
        collectesKgMois,
        pointsGagnes,
        tauxReussite,
        collectesAujourdhui: collectesAujourdhui.length,
        joursActifs,
        joursTotaux,
        evolutionCollectes,
        performanceHebdo,
        scansRecents,
        activitesRecentes,
        totalAnnee,
        moyenneMensuelle,
        repartitionParType,
        comparaisonEquipe
      };
    };

    let activitesData: Activity[] = [];
    let collectesData: Collecte[] = [];
    let agentsData: Agent[] = [];

    const agentsRef = collection(db, 'agents');
    const agentsQuery = query(agentsRef, orderBy('pointsTotaux', 'desc'));

    const unsubscribeActivites = onSnapshot(
      activitesQuery,
      (snapshot) => {
        activitesData = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data()
        })) as Activity[];
        
        activitesData.sort((a, b) => {
          const aDate = toDate(a.timestamp) || new Date(0);
          const bDate = toDate(b.timestamp) || new Date(0);
          return bDate.getTime() - aDate.getTime();
        });
        
        setStats(calculateStats(activitesData, collectesData, agentsData));
        setLoading(false);
        setError(null);
      },
      (error) => {
        console.error('❌ Erreur écouteur activités:', error.code, error.message);
        console.warn('Continuant sans activités');
        setLoading(false);
      }
    );

    const unsubscribeCollectes = onSnapshot(
      collectesQuery,
      (snapshot) => {
        collectesData = snapshot.docs.map((doc) => {
          const data = doc.data();
          return {
            id: doc.id,
            timestamp: data.timestamp,
            date: data.date,
            points: data.points || 0,
            poids: data.poids,
            kg: data.kg,
            type: data.type || 'autre',
            status: data.status || 'success',
            agentId: data.agentId
          };
        }) as Collecte[];
        
        console.log('📦 Collectes mises à jour:', collectesData.length, 'collectes');
        console.log('   Types trouvés:', collectesData.map(c => c.type).filter((v, i, a) => a.indexOf(v) === i));
        
        collectesData.sort((a, b) => {
          const aDate = toDate(a.timestamp) || new Date(0);
          const bDate = toDate(b.timestamp) || new Date(0);
          return bDate.getTime() - aDate.getTime();
        });
        
        setStats(calculateStats(activitesData, collectesData, agentsData));
        setLoading(false);
      },
      (error) => {
        console.error('❌ Erreur écouteur collectes:', error.code, error.message);
        console.warn('Continuant sans collectes');
        setLoading(false);
      }
    );

    const unsubscribeAgents = onSnapshot(
      agentsQuery,
      (snapshot) => {
        agentsData = snapshot.docs.map((doc) => ({
          id: doc.id,
          pointsTotaux: doc.data().pointsTotaux || 0,
          totalCollectes: doc.data().collectesTotales || 0
        })) as Agent[];
        
        setStats(calculateStats(activitesData, collectesData, agentsData));
        setLoading(false);
        setError(null);
      },
      (error) => {
        console.error('❌ Erreur écouteur agents:', error.code, error.message);
        console.warn('Continuant sans agents');
        setLoading(false);
      }
    );

    return () => {
      unsubscribeActivites();
      unsubscribeCollectes();
      unsubscribeAgents();
    };
  }, [user?.uid]);

  return { stats, loading, error };
};