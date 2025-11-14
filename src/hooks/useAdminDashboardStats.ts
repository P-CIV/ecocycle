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
  points?: number; 
  type?: string; 
  zone?: string; 
  date?: Timestamp; 
  status?: string; 
  validé?: boolean; 
}
interface Agent { id: string; nom?: string; name?: string; points?: number; totalCollectes?: number; totalKg?: number; email?: string; zone?: string; dateInscription?: Timestamp; dernièreActivité?: Timestamp; status?: string; }
export interface DashboardStats { totalCollectes: number; totalKg: number; agentsActifs: number; totalAgents: number; pointsDistribues: number; croissance: number; collectesParMois: Array<{ mois: string; collectes: number; kg: number }>; topAgents: Array<{ name: string; collectes: number; points: number }>; repartitionTypes: Array<{ type: string; valeur: number }>; activitesRecentes: Array<any>; alertes: Array<any>; }

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

  useEffect(() => {
    let unsubAgents: (() => void) | undefined;
    let unsubCollectes: (() => void) | undefined;
    let agentsData: Agent[] = [];
    let collectesData: Collecte[] = [];
    let timeoutId: NodeJS.Timeout | null = null;

    const calc = () => { console.log('Calcul:', agentsData.length, 'agents,', collectesData.length, 'collectes');
      
      try {
        const now = new Date();
        const lastMonth = subMonths(now, 1);
        
        // Filtrer les collectes du mois actuel et du mois dernier
        const thisMonth = collectesData.filter(c => { 
          const d = c.date?.toDate?.() || new Date(); 
          return d >= startOfMonth(now) && d <= endOfMonth(now); 
        });
        const lastMonthData = collectesData.filter(c => { 
          const d = c.date?.toDate?.() || new Date(); 
          return d >= startOfMonth(lastMonth) && d <= endOfMonth(lastMonth); 
        });
        
        // Calcul croissance - utiliser quantite ou kg
        const kgThis = thisMonth.reduce((sum, c) => {
          const val = c.kg || c.quantite || 0;
          return sum + (typeof val === 'number' ? val : 0);
        }, 0);
        const kgLast = lastMonthData.reduce((sum, c) => {
          const val = c.kg || c.quantite || 0;
          return sum + (typeof val === 'number' ? val : 0);
        }, 0);
        const growth = kgLast ? ((kgThis - kgLast) / kgLast) * 100 : 0; console.log('📈 This month:', kgThis, 'kg | Last month:', kgLast, 'kg | Growth:', growth, '%');
        
        // Données mensuelles (6 derniers mois)
        const months = [...Array(6)].map((_, i) => { 
          const d = subMonths(now, i); 
          const start = startOfMonth(d); 
          const end = endOfMonth(d); 
          const data = collectesData.filter(c => { 
            const cd = c.date?.toDate?.() || new Date(); 
            return cd >= start && cd <= end; 
          }); 
          const monthKg = data.reduce((sum, x) => {
            const val = x.kg || x.quantite || 0;
            return sum + (typeof val === 'number' ? val : 0);
          }, 0);
          return { 
            mois: format(d, 'yyyy-MM-dd'), collectes: data.length, 
            kg: monthKg
          }; 
        }).reverse(); console.log('📅 Months data:', months);
        
        // Top agents - chercher les agents avec leurs collectes
        const top = agentsData
          .map(a => { 
            const coll = collectesData.filter(c => c.agentId === a.id); 
            const kg = coll.reduce((sum, c) => {
              const val = c.kg || c.quantite || 0;
              return sum + (typeof val === 'number' ? val : 0);
            }, 0);
            return { 
              name: a.nom || a.name || 'Unknown', collectes: kg, 
              points: coll.reduce((sum, c) => sum + (c.points || 0), 0) 
            }; 
          })
          .filter(x => x.collectes > 0)
          .sort((a, b) => b.collectes - a.collectes)
          .slice(0, 5); console.log('🏆 Top agents:', top);
        
        // Répartition par type
        const types: Record<string, number> = {}; collectesData.forEach(c => { 
          const t = c.type || 'Autre'; 
          const val = c.kg || c.quantite || 0;
          types[t] = (types[t] || 0) + (typeof val === 'number' ? val : 0);
        });
        const total = Object.values(types).reduce((a, b) => a + b, 0);
        const dist = total > 0 ? Object.entries(types).map(([type, val]) => ({ 
          type, 
          valeur: Math.round((val / total) * 1000) / 10 
        })) : []; console.log('♻️ Distribution:', dist);
        
        // Agents actifs
        const active = agentsData.filter(a => { 
          const d = a.dernièreActivité?.toDate?.() || new Date(0); 
          return d >= subMonths(now, 1); 
        }).length;
        
        // Totaux
        const totalKg = collectesData.reduce((sum, c) => {
          const val = c.kg || c.quantite || 0;
          return sum + (typeof val === 'number' ? val : 0);
        }, 0);
        const totalPts = collectesData.reduce((sum, c) => sum + (c.points || 0), 0); console.log('Totals - KG:', totalKg, '| Points:', totalPts);
        
        setStats({ 
          totalCollectes: collectesData.length, 
          totalKg, agentsActifs: active, 
          totalAgents: agentsData.length, 
          pointsDistribues: totalPts, 
          croissance: Math.round(growth * 10) / 10, collectesParMois: months, 
          topAgents: top, 
          repartitionTypes: dist, 
          activitesRecentes: collectesData.slice(0, 10), 
          alertes: [] 
        });
        setLoading(false);
      } catch (e) { console.error('Calc error:', e); 
        setError(e as Error); 
        setLoading(false);
      }
    };
    
    try { console.log('🔌 Starting listeners...');
      unsubAgents = onSnapshot(collection(db, 'agents'), snap => { console.log('👥 Agents:', snap.size); agentsData = snap.docs.map(d => ({ id: d.id, ...d.data() })) as Agent[]; 
        calc(); 
      }, err => { console.error('❌ Agents error:', err); 
        setError(err as Error); 
        setLoading(false);
      });
      
      unsubCollectes = onSnapshot(collection(db, 'collectes'), snap => { console.log('📦 Collectes:', snap.size); collectesData = snap.docs.map(d => ({ id: d.id, ...d.data() })) as Collecte[]; 
        calc(); 
      }, err => { console.error('❌ Collectes error:', err); 
        setError(err as Error); 
        setLoading(false);
      });
      
      // Timeout de 3s pour arrêter le loading
      timeoutId = setTimeout(() => { console.log('⏰ Timeout: affichage des données disponibles');
        setLoading(false);
      }, 3000);
    } catch (e) { console.error('❌ Setup error:', e); 
      setError(e as Error); 
      setLoading(false); 
    }
    
    return () => { 
      unsubAgents?.(); 
      unsubCollectes?.(); 
      if (timeoutId) clearTimeout(timeoutId); 
    };
  }, []);

  return { stats, loading, error };
};
