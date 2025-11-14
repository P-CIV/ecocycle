import { initializeApp, getApps } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore, enableMultiTabIndexedDbPersistence } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

// Initialiser Firebase seulement s'il n'est pas déjà initialisé
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

// Obtenir les instances des services
export const auth = getAuth(app);

// Obtenir l'instance Firestore
export const db = getFirestore(app);

// Activer le mode hors connexion
const enablePersistence = async () => {
  try {
    if (window.navigator.onLine) {
      await enableMultiTabIndexedDbPersistence(db).catch((err) => {
        if (err.code === 'failed-precondition') {
          console.warn('La persistence multiples onglets n\'est pas disponible - plusieurs onglets sont déjà ouverts');
        } else if (err.code === 'unimplemented') {
          console.warn('La persistence n\'est pas supportée par ce navigateur');
        }
      });
    }
  } catch (error) {
    console.warn("Erreur lors de l'activation de la persistence:", error);
  }
};

// Initialiser la persistence de manière asynchrone
setTimeout(enablePersistence, 0);