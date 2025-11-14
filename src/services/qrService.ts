import { db } from '@/lib/firebase';
import { 
    collection, 
    query, 
    where, 
    getDocs, 
    deleteDoc, 
    doc, 
    addDoc, 
    updateDoc
} from 'firebase/firestore';

interface QRCodeData {
    code: string;
    type: string;
    poids: number;
    points: number;
    createdBy: string;
    createdAt: Date;
    status: 'active' | 'used' | 'expired';
}

export const generateQRCode = async (data: Omit<QRCodeData, 'createdAt' | 'status'>) => {
    if (!data.code || !data.type || !data.createdBy || data.poids <= 0 || data.points <= 0) {
        throw new Error("Données invalides pour la génération du QR code");
    }

    try {
        const qrCodesRef = collection(db, 'qrcodes');
        
        // Vérifier si l'utilisateur a déjà des codes actifs
        const activeCodesQuery = query(
            qrCodesRef,
            where('createdBy', '==', data.createdBy),
            where('status', '==', 'active')
        );

        // Désactiver les anciens codes dans une transaction
        const snapshot = await getDocs(activeCodesQuery);
        if (snapshot.size > 0) {
            try {
                const updatePromises = snapshot.docs.map(doc => 
                    updateDoc(doc.ref, { 
                        status: 'expired',
                        expiredAt: new Date()
                    })
                );
                await Promise.all(updatePromises);
            } catch (updateError) {
                console.error('Erreur lors de la désactivation des anciens codes:', updateError);
                // On continue même si la désactivation échoue
            }
        }

        // Créer le nouveau code QR avec validation
        const newQRCode = {
            ...data,
            createdAt: new Date(),
            status: 'active' as const,
            validatedAt: new Date(),
            expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) // Expire après 24h
        };

        const docRef = await addDoc(qrCodesRef, newQRCode);
        
        if (!docRef.id) {
            throw new Error("Échec de la création du QR code");
        }

        return true;
    } catch (error) {
        console.error('Erreur lors de la génération du QR code:', error);
        throw error;
    }
};

export const cleanOldQRCodes = async (userId: string) => {
    try {
        const qrCodesRef = collection(db, 'qrcodes');
        const q = query(
            qrCodesRef,
            where('createdBy', '==', userId),
            where('status', '!=', 'active')
        );

        const snapshot = await getDocs(q);
        const deletePromises = snapshot.docs.map(doc => deleteDoc(doc.ref));
        await Promise.all(deletePromises);

        console.log('Anciens QR codes nettoyés avec succès');
        return true;
    } catch (error) {
        console.error('Erreur lors du nettoyage des QR codes:', error);
        throw error;
    }
};

export const deleteQRCode = async (codeId: string) => {
    try {
        const docRef = doc(db, 'qrcodes', codeId);
        await deleteDoc(docRef);
        return true;
    } catch (error) {
        console.error('Erreur lors de la suppression du QR code:', error);
        throw error;
    }
};

export const markQRCodeAsUsed = async (codeId: string) => {
    try {
        const docRef = doc(db, 'qrcodes', codeId);
        await updateDoc(docRef, {
            status: 'used',
            usedAt: new Date()
        });
        return true;
    } catch (error) {
        console.error('Erreur lors du marquage du QR code comme utilisé:', error);
        throw error;
    }
};