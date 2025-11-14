import { useState, useEffect } from 'react';
import { 
  onSnapshot, 
  query, 
  collection, 
  where, 
  orderBy,
  getDocs,
  Timestamp
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/contexts/AuthContext';

export interface Agent {
  id: string;
  points: number;
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

    console.log('Initialisation des écouteurs pour:', user.uid);
    setLoading(true);

    // Collection de référence pour les activités
    const activitesRef = collection(db, 'activites');
    const collectesRef = collection(db, 'collectes');
    
    // Requête pour les activités de l'agent
    const activitesQuery = query(
      activitesRef,
      where('agentId', '==', user.uid),
      orderBy('timestamp', 'desc')
    );

    // Requête pour les collectes de l'agent
    const collectesQuery = query(
      collectesRef,
      where('agentId', '==', user.uid),
      orderBy('timestamp', 'desc')
    );

    // Fonction pour calculer les statistiques
    const calculateStats = async (
      activites: Activity[], 
      collectes: Collecte[]
    ): Promise<RealtimeStats> => {
      const now = new Date();
      const debutMois = new Date(now.getFullYear(), now.getMonth(), 1);
      const aujourdhui = new Date(now.getFullYear(), now.getMonth(), now.getDate());

      // Filtrer les collectes du mois
      const collectesMois = collectes.filter(c => 
        c.timestamp.toDate() >= debutMois
      );

      // Filtrer les collectes d'aujourd'hui
      const collectesAujourdhui = collectes.filter(c => 
        c.timestamp.toDate() >= aujourdhui
      );

      // Calculer les points totaux
      const pointsGagnes = collectesMois.reduce((acc, curr) => acc + curr.points, 0);

      // Calculer le taux de réussite
      const totalTentatives = collectesMois.length;
      const reussies = collectesMois.filter(c => c.status === 'success').length;
      const tauxReussite = totalTentatives ? (reussies / totalTentatives) * 100 : 0;

      // Préparer les données pour les graphiques
      const evolutionCollectes = [...Array(6)].map((_, i) => {
        const moisDate = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const collectesDuMois = collectes.filter(c => {
          const date = c.timestamp.toDate();
          return date.getMonth() === moisDate.getMonth() &&
                 date.getFullYear() === moisDate.getFullYear();
        });
        
        return {
          mois: moisDate.toLocaleDateString('fr-FR', { month: 'short' }),
          kg: collectesDuMois.reduce((acc, curr) => acc + curr.poids, 0),
          points: collectesDuMois.reduce((acc, curr) => acc + curr.points, 0)
        };
      }).reverse();

      // Performance hebdomadaire
      const performanceHebdo = [...Array(7)].map((_, i) => {
        const jour = new Date(now);
        jour.setDate(now.getDate() - i);
        const collectesDuJour = collectes.filter(c => {
          const date = c.timestamp.toDate();
          return date.toDateString() === jour.toDateString();
        });

        return {
          jour: jour.toLocaleDateString('fr-FR', { weekday: 'short' }),
          collectes: collectesDuJour.length
        };
      }).reverse();

      // Scans récents
      const scansRecents = collectes
        .slice(0, 5)
        .map(c => ({
          id: c.id,
          timestamp: c.timestamp.toDate(),
          points: c.points,
          type: c.type,
          status: c.status
        }));

      // Activités récentes
      const activitesRecentes = activites
        .slice(0, 5)
        .map(a => ({
          id: a.id,
          type: a.type,
          description: a.description,
          timestamp: a.timestamp.toDate(),
          points: a.points
        }));

      // Calcul du total annuel
      const debutAnnee = new Date(now.getFullYear(), 0, 1);
      const collectesAnnee = collectes.filter(c => 
        c.timestamp.toDate() >= debutAnnee
      );

      // Calcul du total annuel à partir des collectes réelles uniquement
      const totalAnnee = collectesAnnee.reduce((acc, curr) => ({
        kg: acc.kg + (curr.poids || 0),
        points: acc.points + (curr.points || 0)
      }), { kg: 0, points: 0 });

      // Calcul de la moyenne mensuelle et de son évolution
      const moisActuel = now.getMonth() + 1;
      const moyenneMensuelle = {
        kg: moisActuel > 0 ? Math.round(totalAnnee.kg / moisActuel) : 0,
        evolution: 0 // On initialise à 0, sera calculé ci-dessous
      };

      // Calcul de l'évolution par rapport au mois précédent
      if (moisActuel > 1) {
        const moisPrecedent = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const finMoisPrecedent = new Date(now.getFullYear(), now.getMonth(), 0);
        
        const collectesMoisPrecedent = collectes.filter(c => {
          const date = c.timestamp.toDate();
          return date >= moisPrecedent && date <= finMoisPrecedent;
        });

        const totalMoisPrecedent = collectesMoisPrecedent.reduce((acc, curr) => acc + (curr.poids || 0), 0);
        const moyenneMoisPrecedent = totalMoisPrecedent;

        if (moyenneMoisPrecedent > 0) {
          const evolution = ((moyenneMensuelle.kg - moyenneMoisPrecedent) / moyenneMoisPrecedent) * 100;
          moyenneMensuelle.evolution = Number(evolution.toFixed(1));
        }
      }

      // Répartition par type avec initialisation de tous les types possibles
      const typesDeDechet = ['plastique', 'papier', 'verre', 'polystyrène', 'carton'];
      const repartitionParType = typesDeDechet.map(type => ({
        type,
        quantite: collectes
          .filter(c => c.type === type)
          .reduce((acc, curr) => acc + (curr.poids || 0), 0)
      }));

      // Calculer les statistiques de l'équipe
      const agentsSnapshot = await getDocs(agentsQuery);
      const agentsData = agentsSnapshot.docs.map(doc => ({
        id: doc.id,
        points: doc.data().points || 0,
        totalCollectes: doc.data().totalCollectes || 0
      }));

      const position = agentsData.findIndex(a => a.id === user.uid) + 1;
      const premierAgent = agentsData[0];
      const mesStats = agentsData.find(a => a.id === user.uid);
      const moyennePoints = agentsData.reduce((acc, curr) => acc + curr.points, 0) / agentsData.length;

      // Position dans l'équipe et comparaisons avec gestion robuste des cas limites
      const comparaisonEquipe = {
        position: agentsData.length > 0 ? Math.min(position, agentsData.length) : 0,
        total: agentsData.length,
        ecartPremier: premierAgent && mesStats ? Math.max(0, premierAgent.points - mesStats.points) : 0,
        ecartMoyenne: mesStats && moyennePoints > 0 ? 
          Math.round(((mesStats.points - moyennePoints) / moyennePoints) * 100) : 0
      };

      // Calcul des jours actifs dans le mois
      const joursUniques = new Set(
        collectesMois.map(c => 
          c.timestamp.toDate().toISOString().split('T')[0]
        )
      );
      const joursActifs = joursUniques.size;

      // Calcul du nombre total de jours dans le mois actuel
      const joursTotaux = new Date(
        now.getFullYear(),
        now.getMonth() + 1,
        0
      ).getDate();

      return {
        collectesMois: collectesMois.length,
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

    // Requête pour les statistiques de l'équipe
    const agentsRef = collection(db, 'agents');
    const agentsQuery = query(agentsRef, orderBy('points', 'desc'));

    // Observer les activités
    console.log('Création de la requête activités pour l\'utilisateur:', user?.uid);
    console.log('Query activités:', activitesQuery);
    
    const unsubscribeActivites = onSnapshot(
      activitesQuery,
      (snapshot) => {
        console.log('Mise à jour des activités reçue');
        console.log('Nombre de docs:', snapshot.docs.length);
        console.log('Docs:', snapshot.docs.map(doc => ({id: doc.id, ...doc.data()})));
        if (snapshot.empty) {
          console.log('Aucune activité trouvée');
        }
        activitesData = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data()
        })) as Activity[];
        
        if (activitesData && collectesData) {
          try {
            calculateStats(activitesData, collectesData).then(newStats => {
              setStats(newStats);
              setLoading(false);
              setError(null); // Réinitialiser l'erreur si la requête réussit
            }).catch(err => {
              console.error('Erreur lors du calcul des statistiques:', err);
              setError('Erreur lors de la mise à jour des statistiques');
            });
          } catch (err) {
            console.error('Erreur lors du calcul des statistiques:', err);
            setError('Erreur lors de la mise à jour des statistiques');
          }
        }
      },
      (error) => {
        console.error('Erreur de l\'écouteur des activités:', error);
        console.error('Code d\'erreur:', error.code);
        console.error('Message d\'erreur:', error.message);
        console.error('Stack trace:', error.stack);
        
        if (error.code === 'permission-denied') {
          setError('Vous n\'avez pas les permissions nécessaires pour accéder aux activités');
        } else if (error.code === 'unavailable') {
          setError('Service temporairement indisponible. Veuillez réessayer plus tard.');
        } else {
          setError(`Erreur de connexion aux activités: ${error.message}. Veuillez vérifier votre connexion internet.`);
        }
        setLoading(false);
      }
    );

    // Observer les collectes
    const unsubscribeCollectes = onSnapshot(
      collectesQuery,
      (snapshot) => {
        console.log('Mise à jour des collectes reçue');
        console.log('Nombre de collectes:', snapshot.docs.length);
        console.log('Collectes:', snapshot.docs.map(doc => ({id: doc.id, ...doc.data()})));
        if (snapshot.empty) {
          console.log('Aucune collecte trouvée');
        }
        collectesData = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data()
        })) as Collecte[];
        
        if (activitesData && collectesData) {
          try {
            calculateStats(activitesData, collectesData).then(newStats => {
              setStats(newStats);
              setLoading(false);
            }).catch(err => {
              console.error('Erreur lors du calcul des statistiques:', err);
              setError('Erreur lors de la mise à jour des statistiques');
            });
          } catch (err) {
            console.error('Erreur lors du calcul des statistiques:', err);
            setError('Erreur lors de la mise à jour des statistiques');
          }
        }
      },
      (error) => {
        console.error('Erreur de l\'écouteur des collectes:', error);
        setError('Erreur de connexion aux collectes');
        setLoading(false);
      }
    );

    // Cleanup
    return () => {
      unsubscribeActivites();
      unsubscribeCollectes();
    };
  }, [user?.uid]);

  return { stats, loading, error };
};