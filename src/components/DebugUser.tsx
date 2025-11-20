import { useEffect } from 'react';
import { db, auth } from '../config/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';

export const DebugUser = () => {
  useEffect(() => {
    const checkUser = async () => {
      try {
        const currentUser = auth.currentUser;
        if (!currentUser || !currentUser.email?.endsWith('@ecocycle.ci')) {
          return;
        }

        const email = "admin01@ecocycle.ci";
        const usersRef = collection(db, "users");
        const q = query(usersRef, where("email", "==", email));
        const querySnapshot = await getDocs(q);
        
        if (!querySnapshot.empty) {
          console.log("User found");
        }
      } catch (error) {
        console.error("Erreur lors de la recherche:", error);
      }
    };

    checkUser();
  }, []);

  return null;
};
