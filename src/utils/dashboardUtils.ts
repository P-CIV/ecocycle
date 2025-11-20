import { Timestamp } from 'firebase/firestore';

export interface Collecte {
  id: string;
  userId: string;
  agentName: string;
  date: Timestamp;
  quantite: number;
  type: string;
  status: string;
}

export interface AgentPerformance {
  agent: string;
  collectes: number;
  points: number;
  [key: string]: string | number; // Pour la compatibilité avec Recharts
}

export interface CollecteMensuelle {
  mois: string;
  collectes: number;
  kg: number;
  [key: string]: string | number; // Pour la compatibilité avec Recharts
}

export interface TypeDistribution {
  type: string;
  valeur: number;
  [key: string]: string | number; // Pour la compatibilité avec Recharts
}

export interface ZonePerformance {
  zone: string;
  kg: number;
  agents: number;
  [key: string]: string | number; // Pour la compatibilité avec Recharts
}

// Structure de base pour stocker les données des graphiques
export interface ChartDataInput {
  [key: string]: string | number;
}

// Fonctions qui aident à organiser les données
export const processCollectesData = (collectes: Collecte[]): CollecteMensuelle[] => {
  const months = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Août', 'Sep', 'Oct', 'Nov', 'Déc'];
  const collectesByMonth: { [key: string]: CollecteMensuelle } = {};

  // Initialiser les données pour les 6 derniers mois
  for (let i = 5; i >= 0; i--) {
    const date = new Date();
    date.setMonth(date.getMonth() - i);
    const monthKey = months[date.getMonth()];
    collectesByMonth[monthKey] = { mois: monthKey, collectes: 0, kg: 0 };
  }

  // Agréger les données des collectes
  collectes.forEach(collecte => {
    const date = collecte.date.toDate();
    const monthKey = months[date.getMonth()];
    if (collectesByMonth[monthKey]) {
      collectesByMonth[monthKey].collectes++;
      collectesByMonth[monthKey].kg += collecte.quantite;
    }
  });

  return Object.values(collectesByMonth);
};

export const processAgentPerformance = (collectes: Collecte[]): AgentPerformance[] => {
  const agentPerformance: { [key: string]: AgentPerformance } = {};

  // Calculer les scores de chaque agent
  collectes.forEach(collecte => {
    if (!agentPerformance[collecte.userId]) {
      agentPerformance[collecte.userId] = {
        agent: collecte.agentName || 'Agent inconnu',
        collectes: 0,
        points: 0
      };
    }
    agentPerformance[collecte.userId].collectes++;
    agentPerformance[collecte.userId].points += collecte.quantite * 10; // 10 points pour chaque kg collecté
  });

  // Garder uniquement les 5 agents avec le plus de collectes
  return Object.values(agentPerformance)
    .sort((a, b) => b.collectes - a.collectes)
    .slice(0, 5);
};

export const processTypesDistribution = (collectes: Collecte[]): TypeDistribution[] => {
  const typesCount: { [key: string]: number } = {
    'Plastique': 0,
    'Papier': 0,
    'Verre': 0,
    'Métal': 0,
    'Carton': 0
  };

  let total = 0;

  // Additionner les quantités de chaque type de déchet
  collectes.forEach(collecte => {
    const type = collecte.type.charAt(0).toUpperCase() + collecte.type.slice(1);
    if (typesCount[type] !== undefined) {
      typesCount[type] += collecte.quantite;
      total += collecte.quantite;
    }
  });

  // Transformer les quantités en pourcentages du total
  return Object.entries(typesCount).map(([type, valeur]) => ({
    type,
    valeur: Math.round((valeur / total) * 100) || 0
  }));
};

export const processPerformanceByZone = (collectes: Collecte[], agents: any[]): ZonePerformance[] => {
  const zonePerformance: { [key: string]: { kg: number; agents: number } } = {};

  // Calculer les résultats de chaque zone
  collectes.forEach(collecte => {
    const agent = agents.find(a => a.id === collecte.userId);
    const zone = agent?.zone || "Non assignée";
    
    if (!zonePerformance[zone]) {
      zonePerformance[zone] = { kg: 0, agents: 0 };
    }
    zonePerformance[zone].kg += collecte.quantite;
  });

  // Compter combien d'agents travaillent dans chaque zone
  agents.forEach(agent => {
    const zone = agent.zone || "Non assignée";
    if (!zonePerformance[zone]) {
      zonePerformance[zone] = { kg: 0, agents: 0 };
    }
    zonePerformance[zone].agents += 1;
  });

  // Convertir en tableau et trier par performance
  return Object.entries(zonePerformance)
    .map(([zone, data]) => ({
      zone,
      kg: data.kg,
      agents: data.agents
    }))
    .sort((a, b) => b.kg - a.kg);
};
