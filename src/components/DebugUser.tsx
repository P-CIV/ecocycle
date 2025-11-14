import { useEffect } from 'react';
import { db, auth } from '../config/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';

export const DebugUser = () => {
  useEffect(() => {
    const checkUser = async () => {
      try {
        // Vérifier si l'utilisateur est connecté
        const currentUser = auth.currentUser;
        if (!currentUser) {
          console.log("Utilisateur non authentifié");
          return;
        }

        // Vérifier si l'email correspond au domaine ecocycle.ci
        if (!currentUser.email?.endsWith('@ecocycle.ci')) {
          console.log("L'utilisateur n'a pas les permissions admin nécessaires");
          return;
        }

        const email = "admin01@ecocycle.ci";
        const usersRef = collection(db, "users");
        const q = query(usersRef, where("email", "==", email));
        
        console.log("Recherche de l'utilisateur avec l'email:", email);
        
        const querySnapshot = await getDocs(q);
        querySnapshot.forEach((doc) => {
          console.log("Document trouvé - ID:", doc.id);
          console.log("Données:", doc.data());
        });

        if (querySnapshot.empty) {
          console.log("Aucun utilisateur trouvé avec cet email");
        }
      } catch (error) {
        console.error("Erreur lors de la recherche:", error);
      }
    };

    checkUser();
  }, []);

  return null; // Ce composant ne rend rien visuellement
};