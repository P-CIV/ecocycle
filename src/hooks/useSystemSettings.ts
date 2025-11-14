import { useState, useEffect, useCallback } from 'react';
import { db } from '@/lib/firebase';
import { doc, getDoc, updateDoc, serverTimestamp, collection, getDocs, query, where } from 'firebase/firestore';

interface SystemSettings {
  points_par_kg: number;
  bonus_mensuel: number;
  seuil_minimum_retrait: number;
  types_dechets: string[];
  derniere_mise_a_jour?: any;
  id?: string;
}

interface Zone {
  id: string;
  nom: string;
  statut: 'active' | 'inactive';
  agents_max: number;
  created_at?: any;
  agents_count?: number;
}

interface SystemSettingsState {
  settings: SystemSettings | null;
  zones: Zone[];
  loading: boolean;
  error: string | null;
  isMounted: boolean;
}

export const useSystemSettings = () => {
  const [state, setState] = useState<SystemSettingsState>({
    settings: null,
    zones: [],
    loading: true,
    error: null,
    isMounted: true,
  });

  // Charger les paramètres système
  const loadSystemSettings = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));

      // Récupérer les paramètres
      const paramsRef = doc(db, 'parametres', 'points_config');
      const paramsDoc = await getDoc(paramsRef);

      let settings: SystemSettings | null = null;
      if (paramsDoc.exists()) {
        settings = {
          id: paramsDoc.id,
          ...paramsDoc.data() as SystemSettings,
        };
      }

      // Récupérer les zones
      const zonesRef = collection(db, 'zones');
      const zonesSnap = await getDocs(zonesRef);
      const zones: Zone[] = [];

      for (const zoneDoc of zonesSnap.docs) {
        const zoneData = zoneDoc.data();
        
        // Compter les agents dans cette zone
        const agentsRef = collection(db, 'agents');
        const agentsQuery = query(agentsRef, where('zone', '==', zoneDoc.id));
        const agentsSnap = await getDocs(agentsQuery);

        zones.push({
          id: zoneDoc.id,
          nom: zoneData.nom || 'Zone inconnue',
          statut: zoneData.statut || 'active',
          agents_max: zoneData.agents_max || 10,
          agents_count: agentsSnap.size,
          created_at: zoneData.created_at,
        });
      }

      if (state.isMounted) {
        setState(prev => ({
          ...prev,
          settings,
          zones,
          loading: false,
        }));
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erreur inconnue';
      console.error('Erreur lors du chargement des paramètres:', message);
      if (state.isMounted) {
        setState(prev => ({
          ...prev,
          error: message,
          loading: false,
        }));
      }
    }
  }, [state.isMounted]);

  // Mettre à jour les paramètres
  const updateSettings = useCallback(async (updates: Partial<SystemSettings>) => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));

      const paramsRef = doc(db, 'parametres', 'points_config');
      await updateDoc(paramsRef, {
        ...updates,
        derniere_mise_a_jour: serverTimestamp(),
      });

      if (state.isMounted) {
        setState(prev => ({
          ...prev,
          settings: prev.settings ? { ...prev.settings, ...updates } : null,
          loading: false,
        }));
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erreur inconnue';
      console.error('Erreur lors de la mise à jour:', message);
      if (state.isMounted) {
        setState(prev => ({
          ...prev,
          error: message,
          loading: false,
        }));
      }
    }
  }, [state.isMounted]);

  // Mettre à jour une zone
  const updateZone = useCallback(async (zoneId: string, updates: Partial<Zone>) => {
    try {
      const zoneRef = doc(db, 'zones', zoneId);
      await updateDoc(zoneRef, updates);

      if (state.isMounted) {
        setState(prev => ({
          ...prev,
          zones: prev.zones.map(z => 
            z.id === zoneId ? { ...z, ...updates } : z
          ),
        }));
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erreur inconnue';
      console.error('Erreur lors de la mise à jour de la zone:', message);
      if (state.isMounted) {
        setState(prev => ({
          ...prev,
          error: message,
        }));
      }
    }
  }, [state.isMounted]);

  // Charger les données au mount
  useEffect(() => {
    loadSystemSettings();

    return () => {
      setState(prev => ({ ...prev, isMounted: false }));
    };
  }, []);

  return {
    ...state,
    loadSystemSettings,
    updateSettings,
    updateZone,
  };
};
