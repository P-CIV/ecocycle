import { db } from '@/lib/firebase';
import { 
    collection, 
    addDoc,
    doc,
    updateDoc,
    deleteDoc,
    query,
    where,
    getDocs,
    serverTimestamp
} from 'firebase/firestore';
import { generateQRCodeData } from '../utils/qrUtils';
import { updateAgentStats } from './updateAgentStats';

interface QRCodeData {
    code: string;
    type: string;
    poids: number;
    points: number;
    createdBy: string;
    status: 'active' | 'used' | 'expired';
}

export const createQRCode = async (data: Omit<QRCodeData, 'code' | 'status'>) => {
    try {
        // Générer un code unique
        const uniqueCode = generateQRCodeData(data.type, data.poids);
        
        // Créer le document QR code
        const qrCodesRef = collection(db, 'qrcodes');
        const docRef = await addDoc(qrCodesRef, {
            ...data,
            code: uniqueCode,
            status: 'active',
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp()
        });

        // Créer une collecte associée au QR code
        const collectesRef = collection(db, 'collectes');
        await addDoc(collectesRef, {
            poids: data.poids,
            timestamp: serverTimestamp(),
            points: 5, // Toujours 5 points par transaction
            status: 'success',
            agentId: data.createdBy,
            type: data.type,
            qrCodeId: docRef.id
        });

        // Mettre à jour les stats de l'agent
        await updateAgentStats({
            agentId: data.createdBy,
            poids: data.poids,
            points: 5, // Toujours 5 points par transaction
            status: 'validee',
            type: data.type
        });

        return {
            id: docRef.id,
            code: uniqueCode,
            success: true
        };
    } catch (error) {
        console.error('Erreur lors de la création du QR code:', error);
        throw error;
    }
};

export const updateQRCodeStatus = async (codeId: string, status: 'active' | 'used' | 'expired') => {
    try {
        const docRef = doc(db, 'qrcodes', codeId);
        await updateDoc(docRef, {
            status,
            updatedAt: serverTimestamp()
        });
        return true;
    } catch (error) {
        console.error('Erreur lors de la mise à jour du statut du QR code:', error);
        throw error;
    }
};

export const deleteQRCode = async (codeId: string, userId: string) => {
    try {
        // Vérifier que l'utilisateur est le propriétaire
        const qrCodesRef = collection(db, 'qrcodes');
        const q = query(qrCodesRef, where('createdBy', '==', userId));
        const snapshot = await getDocs(q);
        
        const doc = snapshot.docs.find(d => d.id === codeId);
        if (!doc) {
            throw new Error('QR code non trouvé ou non autorisé');
        }

        await deleteDoc(doc.ref);
        return true;
    } catch (error) {
        console.error('Erreur lors de la suppression du QR code:', error);
        throw error;
    }
};
