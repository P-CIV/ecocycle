import { db, auth } from '@/lib/firebase';
import { doc, setDoc, getDoc, serverTimestamp, collection, getDocs } from 'firebase/firestore';

// Fonction pour vérifier si une collection est vide
async function isCollectionEmpty(collectionName: string): Promise<boolean> {
  const snapshot = await getDoc(doc(db, collectionName, '--dummy--'));
  return !snapshot.exists();
}

// Initialisation des paramètres système
async function initSystemParams() {
  const paramsRef = doc(db, 'parametres', 'points_config');
  const paramsDoc = await getDoc(paramsRef);

  if (!paramsDoc.exists()) {
    await setDoc(paramsRef, {
      points_par_kg: 10,
      bonus_mensuel: 100,
      seuil_minimum_retrait: 1000,
      types_dechets: ['plastique', 'papier', 'verre', 'polystyrène', 'carton'],
      derniere_mise_a_jour: serverTimestamp()
    });
  }
}

// Initialisation des zones géographiques
async function initZones() {
  const zones = [
    {
      id: 'zone_nord',
      nom: 'Nord',
      statut: 'active',
      agents_max: 10,
      created_at: serverTimestamp()
    },
    {
      id: 'zone_sud',
      nom: 'Sud',
      statut: 'active',
      agents_max: 10,
      created_at: serverTimestamp()
    },
    {
      id: 'zone_est',
      nom: 'Est',
      statut: 'active',
      agents_max: 10,
      created_at: serverTimestamp()
    },
    {
      id: 'zone_ouest',
      nom: 'Ouest',
      statut: 'active',
      agents_max: 10,
      created_at: serverTimestamp()
    }
  ];

  for (const zone of zones) {
    const zoneRef = doc(db, 'zones', zone.id);
    const zoneDoc = await getDoc(zoneRef);

    if (!zoneDoc.exists()) {
      await setDoc(zoneRef, zone);
    }
  }
}

// Initialisation des statistiques globales
async function initStats() {
  const statsRef = doc(db, 'statistiques', 'global');
  const statsDoc = await getDoc(statsRef);

  if (!statsDoc.exists()) {
    await setDoc(statsRef, {
      total_collecte: 0,
      total_points: 0,
      agents_actifs: 0,
      derniere_mise_a_jour: serverTimestamp()
    });
  }
}

// Initialiser la collection agents avec des données par défaut
async function initAgentsCollection() {
  const agentsRef = collection(db, 'agents');
  const snapshot = await getDocs(agentsRef);
  
  if (snapshot.empty) {
    console.log('Initialisation de la collection agents...');
    const defaultAgent = {
      name: 'Agent Test',
      email: 'test@ecocycle.ci',
      points: 0,
      status: 'active',
      createdAt: serverTimestamp(),
      lastActive: serverTimestamp(),
      monthlyStats: {
        collectes: 0,
        points: 0,
        tauxReussite: 0
      }
    };
    
    await setDoc(doc(agentsRef, 'test-agent'), defaultAgent);
  }
}

// Initialiser la collection objectifs
async function initObjectifs() {
  const objectifsRef = doc(db, 'objectifs', 'default');
  const objectifsDoc = await getDoc(objectifsRef);

  if (!objectifsDoc.exists()) {
    await setDoc(objectifsRef, {
      collectesMensuellesKg: 300,
      pointsMensuels: 3000,
      tauxReussiteMin: 95,
      updatedAt: serverTimestamp()
    });
  }
}

// Fonction principale d'initialisation
export async function initializeFirestore() {
  try {
    // Vérifier si l'utilisateur est admin
    const currentUser = auth.currentUser;
    if (!currentUser?.email?.endsWith('@ecocycle.ci')) {
      throw new Error('Seuls les administrateurs peuvent initialiser la base de données');
    }

    // Vérification si c'est la première initialisation
    const isEmpty = await isCollectionEmpty('parametres');
    
    if (isEmpty) {
      console.log('Première initialisation de Firestore...');
      
      // Exécution séquentielle des initialisations
      await initSystemParams();
      console.log('Paramètres système initialisés');
      
      await initZones();
      console.log('Zones géographiques initialisées');
      
      await initStats();
      console.log('Statistiques globales initialisées');

      await initAgentsCollection();
      console.log('Collection agents initialisée');

      await initObjectifs();
      console.log('Collection objectifs initialisée');
      
      console.log('Initialisation de Firestore terminée avec succès');
    } else {
      console.log('Vérification des collections manquantes...');
      // Vérifier et initialiser les collections même si la base n'est pas vide
      const collections = ['agents', 'objectifs', 'parametres', 'zones', 'statistiques'];
      for (const col of collections) {
        const snapshot = await getDocs(collection(db, col));
        if (snapshot.empty) {
          console.log(`Collection ${col} manquante, initialisation...`);
          switch(col) {
            case 'agents':
              await initAgentsCollection();
              break;
            case 'objectifs':
              await initObjectifs();
              break;
            case 'parametres':
              await initSystemParams();
              break;
            case 'zones':
              await initZones();
              break;
            case 'statistiques':
              await initStats();
              break;
          }
        }
      }
    }
  } catch (error) {
    console.error('Erreur lors de l\'initialisation de Firestore:', error);
    throw error;
  }
}