import { initializeFirestore } from './initFirestore';

// Initialise la base de données
// Cette fonction s'exécute seulement si l'utilisateur connecté est admin
export const setupDatabase = async () => {
  try {
    
    
    // Vérifier que l'utilisateur connecté est admin
    const { auth } = await import('@/lib/firebase');
    const user = auth.currentUser;
    
    if (!user) {
      throw new Error('Aucun utilisateur connecté');
    }
    
    // Seuls les admins peuvent initialiser la base
    if (!user.email?.endsWith('@ecocycle.ci')) {
      throw new Error('Permission refusée: seuls les admins peuvent initialiser la base de données');
    }

    // Lancer l'initialisation
    await initializeFirestore();
    
    return true;
  } catch (error) {
    console.error('Erreur lors de l\'initialisation:', error);
    // Propager l'erreur pour que le code appelant la gère
    throw error;
  }
};
