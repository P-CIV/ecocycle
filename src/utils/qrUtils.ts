
export const generateQRCodeData = (type: string, poids: number): string => {
    // Récupérer le temps actuel en millisecondes
    const timestamp = Date.now();
    
    // Générer une chaîne aléatoire de 6 caractères
    const randomString = Math.random().toString(36).substring(2, 8);
    
    // Combiner tout pour créer le code unique
    return `${type.substring(0, 3).toUpperCase()}-${poids}-${timestamp}-${randomString}`;
};