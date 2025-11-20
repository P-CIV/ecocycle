import { db } from '../lib/firebase';
import { collection, getDocs, query, where, deleteDoc, doc, updateDoc } from 'firebase/firestore';

export const cleanDatabase = async () => {
    try {
        // Collections à nettoyer
        const collections = [
            'collectes',
            'points',
            'statistiques',
            'dashboard',
            'rapports'
        ];

        for (const collectionName of collections) {
            const collectionRef = collection(db, collectionName);
            
            // Recherche des documents de test
            const testDocsQuery = query(
                collectionRef,
                where('isTest', '==', true)
            );

            const mockDocsQuery = query(
                collectionRef,
                where('testData', '==', true)
            );

            const demoDocsQuery = query(
                collectionRef,
                where('demoData', '==', true)
            );

            // Suppression des documents de test
            const queries = [testDocsQuery, mockDocsQuery, demoDocsQuery];
            
            for (const q of queries) {
                const snapshot = await getDocs(q);
                for (const document of snapshot.docs) {
                    await deleteDoc(doc(db, collectionName, document.id));
                }
            }

            // Nettoyage des statistiques incohérentes
            if (collectionName === 'statistiques') {
                const statsRef = collection(db, 'statistiques');
                const statsSnapshot = await getDocs(statsRef);
                
                for (const statDoc of statsSnapshot.docs) {
                    const data = statDoc.data();
                    if (data.valeur < 0 || data.valeur > 1000000) {
                        await deleteDoc(statDoc.ref);
                    }
                }
            }

            // Mise à jour du dashboard
            if (collectionName === 'dashboard') {
                const dashboardRef = collection(db, 'dashboard');
                const dashSnapshot = await getDocs(dashboardRef);
                
                for (const dashDoc of dashSnapshot.docs) {
                    await updateDoc(dashDoc.ref, {
                        lastUpdate: new Date(),
                        isClean: true
                    });
                }
            }
        }
        return true;
    } catch (error) {
        console.error('Erreur lors du nettoyage de la base de données:', error);
        throw error;
    }
};
