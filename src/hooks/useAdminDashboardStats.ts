import { useState, useEffect } from 'react';
import { collection, onSnapshot, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { subMonths, startOfMonth, endOfMonth, format } from 'date-fns';

interface Collecte { 
  id: string; 
  agentId?: string; 
  agentName?: string; 
  quantite?: number; 
  kg?: number; 
  poids?: number;
  points?: number; 
  type?: string; 
  zone?: string; 
  date?: Timestamp;
  timestamp?: Timestamp;
  status?: string; 
  validé?: boolean; 
}
interface Agent { 
  id: string; 
  nom?: string; 
  name?: string; 
  points?: number; 
  totalCollectes?: number; 
  totalKg?: number; 
  email?: string; 
  zone?: string; 
  dateInscription?: Timestamp; 
  dernièreActivité?: Timestamp; 
  status?: string; 
}

export interface DashboardStats { 
  totalCollectes: number; 
  totalKg: number; 
  agentsActifs: number; 
  totalAgents: number; 
  pointsDistribues: number; 
  croissance: number; 
  collectesParMois: Array<{ mois: string; collectes: number; kg: number }>; 
  topAgents: Array<{ name: string; collectes: number; points: number }>; 
  repartitionTypes: Array<{ type: string; valeur: number }>; 
  activitesRecentes: Array<any>; 
  alertes: Array<any>; 
}

// Données par défaut pour les 6 derniers mois
const getDefaultMonthsData = () => {
  const now = new Date();
  return [...Array(6)].map((_, i) => {
    const d = subMonths(now, i);
    return {
      mois: format(d, 'yyyy-MM-dd'), collectes: 0,
      kg: 0
    };
  }).reverse();
};

// Helper pour récupérer la date correcte (timestamp ou date)
const getCollecteDate = (collecte: Collecte): Date => {
  return (collecte.timestamp?.toDate?.() || collecte.date?.toDate?.() || new Date());
};

// Helper pour récupérer le poids correct (poids ou kg)
const getPoids = (collecte: Collecte): number => {
  return collecte.poids ?? collecte.kg ?? collecte.quantite ?? 0;
};

export const useAdminDashboardStats = () => {
  const [stats, setStats] = useState<DashboardStats>({
    totalCollectes: 0,
    totalKg: 0, agentsActifs: 0,
    totalAgents: 0,
    pointsDistribues: 0,
    croissance: 0, collectesParMois: getDefaultMonthsData(),
    topAgents: [],
    repartitionTypes: [],
    activitesRecentes: [],
    alertes: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [agentsData, setAgentsData] = useState<Agent[]>([]);
  const [collectesData, setCollectesData] = useState<Collecte[]>([]);

  // Fonction pour calculer les stats - utilise le state
  const calculateStats = (agents: Agent[], collectes: Collecte[]) => {
    try {
      const now = new Date();
      const lastMonth = subMonths(now, 1);
      
      // Filtrer les collectes du mois actuel et du mois dernier
      const thisMonth = collectes.filter(c => { 
        const d = getCollecteDate(c);
        return d >= startOfMonth(now) && d <= endOfMonth(now); 
      });
      const lastMonthData = collectes.filter(c => { 
        const d = getCollecteDate(c);
        return d >= startOfMonth(lastMonth) && d <= endOfMonth(lastMonth); 
      });
      
      // Calcul croissance
      const kgThis = thisMonth.reduce((sum, c) => {
        const val = getPoids(c);
        return sum + val;
      }, 0);
      const kgLast = lastMonthData.reduce((sum, c) => {
        const val = getPoids(c);
        return sum + val;
      }, 0);
      const growth = kgLast ? ((kgThis - kgLast) / kgLast) * 100 : 0;
      
      // Données mensuelles (6 derniers mois)
      const months = [...Array(6)].map((_, i) => { 
        const d = subMonths(now, i); 
        const start = startOfMonth(d); 
        const end = endOfMonth(d); 
        const data = collectes.filter(c => { 
          const cd = getCollecteDate(c);
          return cd >= start && cd <= end; 
        }); 
        const monthKg = data.reduce((sum, x) => {
          const val = getPoids(x);
          return sum + val;
        }, 0);
        return { 
          mois: format(d, 'yyyy-MM-dd'), 
          collectes: data.length, 
          kg: monthKg
        }; 
      }).reverse();
      
      // Top agents
      const top = agents
        .map(a => { 
          const coll = collectes.filter(c => c.agentId === a.id); 
          const kg = coll.reduce((sum, c) => {
            const val = getPoids(c);
            return sum + val;
          }, 0);
          return { 
            name: a.nom || a.name || 'Unknown', 
            collectes: kg, 
            points: coll.reduce((sum, c) => sum + (c.points || 0), 0) 
          }; 
        })
        .filter(x => x.collectes > 0)
        .sort((a, b) => b.collectes - a.collectes)
        .slice(0, 5);
      
      // Répartition par type
      const types: Record<string, number> = {}; 
      collectes.forEach(c => { 
        const t = (c.type || 'autre').toLowerCase(); 
        const val = getPoids(c);
        types[t] = (types[t] || 0) + val;
      });
      const total = Object.values(types).reduce((a, b) => a + b, 0);
      const dist = total > 0 ? Object.entries(types)
        .filter(([_, val]) => val > 0)
        .map(([type, val]) => ({ 
          type: type.charAt(0).toUpperCase() + type.slice(1), 
          valeur: Math.round((val / total) * 1000) / 10 
        }))
        .sort((a, b) => b.valeur - a.valeur) : [];
      
      // Agents actifs
      const active = agents.filter(a => { 
        const d = a.dernièreActivité?.toDate?.() || new Date(0); 
        return d >= subMonths(now, 1); 
      }).length;
      
      // Totaux
      const totalKg = collectes.reduce((sum, c) => {
        const val = getPoids(c);
        return sum + val;
      }, 0);
      const totalPts = collectes.reduce((sum, c) => sum + (c.points || 0), 0);
      
      setStats({ 
        totalCollectes: collectes.length, 
        totalKg, 
        agentsActifs: active, 
        totalAgents: agents.length, 
        pointsDistribues: totalPts, 
        croissance: Math.round(growth * 10) / 10, 
        collectesParMois: months, 
        topAgents: top, 
        repartitionTypes: dist, 
        activitesRecentes: collectes.slice(0, 10), 
        alertes: [] 
      });
      setLoading(false);
    } catch (e) { 
      console.error('Calc error:', e); 
      setError(e as Error); 
    }
  };

  useEffect(() => {
    let unsubAgents: (() => void) | undefined;
    let unsubCollectes: (() => void) | undefined;

    try {
      unsubAgents = onSnapshot(collection(db, 'agents'), snap => {
        const newAgentsData = snap.docs.map(d => ({ id: d.id, ...d.data() })) as Agent[];
        setAgentsData(newAgentsData);
      }, err => {
        console.error('❌ Agents error:', err);
        setError(err as Error);
      });
      
      unsubCollectes = onSnapshot(collection(db, 'collectes'), snap => {
        const newCollectesData = snap.docs.map(d => ({ id: d.id, ...d.data() })) as Collecte[];
        setCollectesData(newCollectesData);
      }, err => {
        console.error('❌ Collectes error:', err);
        setError(err as Error);
      });

      setLoading(false);
    } catch (e) {
      console.error('❌ Setup error:', e);
      setError(e as Error);
      setLoading(false);
    }
    
    return () => { 
      unsubAgents?.(); 
      unsubCollectes?.();
    };
  }, []);

  // Recalculer les stats quand les données changent
  useEffect(() => {
    if (agentsData.length > 0 || collectesData.length > 0) {
      calculateStats(agentsData, collectesData);
    }
  }, [agentsData, collectesData]);

  return { stats, loading, error };
};
