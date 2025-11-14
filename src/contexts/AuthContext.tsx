import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { 
  User,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from 'firebase/auth';
import { auth, db } from '@/lib/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';

interface AuthContextType {
  currentUser: User | null;
  user: User | null;  // Ajout de l'alias user pour la compatibilité
  login: (email: string, password: string) => Promise<User>;
  signup: (email: string, password: string, name: string, role?: string, zone?: string, phone?: string) => Promise<void>;
  logout: () => Promise<void>;
  loading: boolean;
  userRole: string | null;
}

interface AuthProviderProps {
  children: ReactNode;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    // Ce hook doit être utilisé DANS un composant qui est enveloppé par AuthProvider
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState<string | null>(null);

  useEffect(() => {
    let unsubscribe: () => void;
    
    const setupAuthListener = async () => {
      // Écouter les changements de l'utilisateur connecté
      unsubscribe = onAuthStateChanged(auth, async (user) => {
        console.log("L'utilisateur a changé:", user?.email);
        setCurrentUser(user);
        
        if (user) {
          try {
            // Vérifier si c'est un email admin (@ecocycle.ci)
            const isAdminEmail = user.email?.endsWith('@ecocycle.ci') || false;
            
            // Chercher si l'utilisateur existe déjà dans Firestore
            const userDoc = await getDoc(doc(db, 'users', user.uid));
            if (userDoc.exists()) {
              const userData = userDoc.data();
              console.log("Données trouvées dans la base:", userData);
              
              // Si c'est un email admin, forcer le rôle admin
              if (isAdminEmail) {
                await setDoc(doc(db, 'users', user.uid), {
                  ...userData,
                  role: 'admin',
                  lastLogin: new Date().toISOString()
                }, { merge: true });
                setUserRole('admin');
                console.log("Admin reconnu:", user.email);
              } else {
                // Sinon, utiliser le rôle sauvegardé
                setUserRole(userData.role);
              }
              console.log("Rôle défini:", isAdminEmail ? 'admin' : userData.role);
            } else {
              // NOUVEL utilisateur: créer un document dans Firestore
              const defaultRole = isAdminEmail ? 'admin' : 'agent';
              
              console.log("Nouvel utilisateur, création du profil avec rôle:", defaultRole);
              try {
                await setDoc(doc(db, 'users', user.uid), {
                  email: user.email,
                  role: defaultRole,
                  createdAt: new Date().toISOString(),
                  lastLogin: new Date().toISOString(),
                  status: 'active'
                });
                setUserRole(defaultRole);
              } catch (createError) {
                console.warn("Erreur lors de la création du profil:", createError);
                // Continuer avec le rôle par défaut
                setUserRole('agent');
              }
            }
          } catch (error: any) {
            console.warn("Erreur Firestore, utilisation du rôle par défaut:", error);
            if (error.code === 'unavailable' || error.code === 'failed-precondition') {
              console.log("Erreur de connexion, on utilise un rôle temporaire");
            }
          }
        } else {
          console.log("Utilisateur déconnecté");
          setUserRole(null);
        }
        
        setLoading(false);
      });
    };

    setupAuthListener().catch(error => {
      console.error("Erreur lors du démarrage de l'authentification:", error);
      setLoading(false);
    });

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, []);

  const signup = async (email: string, password: string, name: string, role: string = 'agent', zone: string = '', phone: string = ''): Promise<void> => {
    try {
      // Vérifier que Firebase est prêt
      if (!auth || !db) {
        throw new Error("Firebase n'est pas correctement initialisé");
      }

      // Vérifier que l'utilisateur crée un compte agent
      if (role !== "agent") {
        throw new Error("Seuls les admins peuvent créer des comptes admin (via la console Firebase)");
      }

      // ÉTAPE 1: Créer le compte dans Firebase Authentication
      console.log("Création du compte utilisateur...");
      const userCredential = await createUserWithEmailAndPassword(auth, email, password)
        .catch((error) => {
          console.error("Erreur lors de la création du compte:", error);
          throw error;
        });

      console.log("Compte créé avec succès");
      const user = userCredential.user;
      
      // ÉTAPE 2: Créer le profil utilisateur dans Firestore
      try {
        console.log("Création du profil dans la base de données...");
        const userDoc = doc(db, 'users', user.uid);
        const userData = {
          email,
          role: "agent",
          createdAt: new Date().toISOString(),
          lastLogin: new Date().toISOString(),
          status: 'active',
          displayName: name,
          phone: phone,
          zone: zone
        };

        // Sauvegarder le profil
        await setDoc(userDoc, userData);
        console.log("Document utilisateur créé avec succès:", userData);

        // Initialiser les données de l'agent
        const { initAgentData } = await import('@/utils/initAgentData');
        await initAgentData({
          uid: user.uid,
          nom: name,
          email: email,
          phone: phone,
          zone: zone
        });
        console.log("Données agent initialisées avec succès");
      } catch (firestoreError: any) {
        console.error("Erreur lors de la création du document Firestore:", firestoreError);
        
        // Tenter de supprimer le compte Firebase si la création Firestore échoue
        try {
          await user.delete();
          console.log("Compte d'authentification supprimé suite à l'erreur Firestore");
        } catch (deleteError) {
          console.error("Impossible de supprimer le compte d'authentification:", deleteError);
        }
        
        throw new Error("Erreur lors de la création du profil utilisateur. Détails: " + firestoreError.message);
      }

      setUserRole("agent");
      console.log("Rôle mis à jour localement: agent");
    } catch (error: any) {
      console.error("Erreur détaillée lors de l'inscription:", {
        code: error.code,
        message: error.message
      });
      
      if (error.code === 'auth/email-already-in-use') {
        throw new Error("Cette adresse email est déjà utilisée");
      } else if (error.code === 'auth/invalid-email') {
        throw new Error("L'adresse email n'est pas valide");
      } else if (error.code === 'auth/operation-not-allowed') {
        throw new Error("L'inscription est temporairement désactivée");
      } else if (error.code === 'auth/weak-password') {
        throw new Error("Le mot de passe est trop faible");
      } else if (error.message.includes("profil utilisateur")) {
        throw new Error("Erreur lors de la création du profil. Veuillez réessayer.");
      } else {
        throw new Error("Une erreur est survenue lors de l'inscription");
      }
    }
  };

  const login = async (email: string, password: string): Promise<User> => {
    if (!auth) {
      throw new Error("Firebase n'est pas correctement initialisé");
    }

    try {
      console.log("Tentative de connexion avec:", email);
      
      const result = await signInWithEmailAndPassword(auth, email, password);
      console.log("Authentification réussie pour:", result.user.email);
      
      try {
        const userRef = doc(db, 'users', result.user.uid);
        const userDoc = await getDoc(userRef);
        
        const isAdminEmail = email.endsWith('@ecocycle.ci');
        const defaultRole = isAdminEmail ? 'admin' : 'agent';
        
        if (userDoc.exists()) {
          const userData = userDoc.data();
          console.log("Données utilisateur récupérées:", userData);
          
          // Pour les emails @ecocycle.ci, toujours mettre à jour vers admin
          if (isAdminEmail) {
            const updateData = {
              ...userData,
              role: 'admin',
              lastLogin: new Date().toISOString()
            };
            
            console.log("Mise à jour du rôle admin pour:", email);
            await setDoc(userRef, updateData);
            setUserRole('admin');
          } else {
            setUserRole(userData.role || defaultRole);
          } // Ne pas définir de rôle par défaut
          
          try {
            await setDoc(doc(db, 'users', result.user.uid), {
              ...userData,
              lastLogin: new Date().toISOString()
            }, { merge: true });
          } catch (updateError) {
            console.warn("Impossible de mettre à jour la dernière connexion:", updateError);
          }
        } else {
          console.log("Création d'un nouveau document utilisateur");
          try {
            await setDoc(doc(db, 'users', result.user.uid), {
              email: result.user.email,
              role: 'agent',
              createdAt: new Date().toISOString(),
              lastLogin: new Date().toISOString()
            });
          } catch (createError) {
            console.warn("Impossible de créer le document utilisateur:", createError);
          }
        }
      } catch (firestoreError) {
        console.warn("Erreur Firestore, utilisation du rôle par défaut:", firestoreError);
      }
      
      return result.user;
      } catch (error: any) {
      console.error("Erreur lors de la connexion:", error);
      
      switch (error.code) {
        case 'auth/network-request-failed':
          throw new Error('Problème de connexion réseau. Veuillez vérifier votre connexion Internet.');
        case 'auth/user-not-found':
          throw new Error('Aucun utilisateur trouvé avec cet email.');
        case 'auth/wrong-password':
          throw new Error('Mot de passe incorrect.');
        case 'auth/too-many-requests':
          throw new Error('Trop de tentatives. Veuillez réessayer plus tard.');
        case 'auth/invalid-email':
          throw new Error('Format d\'email invalide.');
        default:
          throw new Error('Une erreur est survenue lors de la connexion.');
      }
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Erreur lors de la déconnexion:", error);
      throw error;
    }
  };

  const value = {
    currentUser,
    user: currentUser, // Ajout de l'alias user
    login,
    signup,
    logout,
    loading,
    userRole
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export { AuthContext };