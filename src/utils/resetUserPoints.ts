import { db } from '@/lib/firebase';
import { collection, getDocs, doc, updateDoc, setDoc } from 'firebase/firestore';

/**
 * Réinitialise les points de TOUS les utilisateurs à 0
 * À utiliser avec prudence - cela efface l'historique des points
 */
export const resetAllUserPoints = async () => {
    try {
        console.log('🔄 Réinitialisation des points de tous les utilisateurs...');
        
        // Récupérer tous les utilisateurs
        const usersRef = collection(db, 'users');
        const userSnapshot = await getDocs(usersRef);
        
        let resetCount = 0;
        
        for (const userDoc of userSnapshot.docs) {
            const userId = userDoc.id;
            const userRef = doc(db, 'users', userId);
            
            // Réinitialiser les points à 0
            await updateDoc(userRef, {
                points: 0,
                pointsRetires: 0,
                dernierRetrait: null,
                updatedAt: new Date()
            });
            
            resetCount++;
            console.log(`✅ Points réinitialisés pour ${userId}`);
        }
        
        console.log(`✅ ${resetCount} utilisateur(s) ont eu leurs points réinitialisés à 0`);
        return resetCount;
    } catch (error) {
        console.error('❌ Erreur lors de la réinitialisation des points:', error);
        throw error;
    }
};

/**
 * Réinitialise les points d'un utilisateur spécifique
 */
export const resetUserPoints = async (userId: string) => {
    try {
        const userRef = doc(db, 'users', userId);
        
        await setDoc(userRef, {
            points: 0,
            pointsRetires: 0,
            dernierRetrait: null,
            updatedAt: new Date()
        }, { merge: true });
        
        console.log(`✅ Points réinitialisés pour ${userId}`);
        return true;
    } catch (error) {
        console.error('❌ Erreur lors de la réinitialisation des points:', error);
        throw error;
    }
};
