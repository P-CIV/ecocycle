import { useState, useEffect } from 'react';
import { collection, onSnapshot, query, updateDoc, doc, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export interface UserPermission {
  id: string;
  email: string;
  displayName?: string;
  role: 'admin' | 'agent';
  status: 'active' | 'inactive' | 'suspended';
  zone?: string;
  createdAt: Date;
  lastLogin?: Date;
  permissions: {
    canViewDashboard: boolean;
    canValidateCollections: boolean;
    canManageTeam: boolean;
    canManageSettings: boolean;
    canExportData: boolean;
  };
}

interface AccessStats {
  totalUsers: number;
  admins: number;
  agents: number;
  activeUsers: number;
  inactiveUsers: number;
  users: UserPermission[];
  loading: boolean;
  error: Error | null;
}

export const useAccessControl = (): AccessStats => {
  const [stats, setStats] = useState<AccessStats>({
    totalUsers: 0,
    admins: 0,
    agents: 0,
    activeUsers: 0,
    inactiveUsers: 0,
    users: [],
    loading: true,
    error: null,
  });

  useEffect(() => {
    let isMounted = true;

    try {
      const usersQuery = query(collection(db, 'users'));

      const unsubscribe = onSnapshot(usersQuery, (snapshot) => {
        if (!isMounted) return;

        const users: UserPermission[] = [];
        let totalUsers = 0;
        let admins = 0;
        let agents = 0;
        let activeUsers = 0;
        let inactiveUsers = 0;

        snapshot.forEach((doc) => {
          const data = doc.data();
          totalUsers++;

          const user: UserPermission = {
            id: doc.id,
            email: data.email || 'Email inconnu',
            displayName: data.displayName || data.email?.split('@')[0],
            role: data.role as 'admin' | 'agent' || 'agent',
            status: (data.status as 'active' | 'inactive' | 'suspended') || 'active',
            zone: data.zone,
            createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate() : new Date(data.createdAt),
            lastLogin: data.lastLogin instanceof Timestamp ? data.lastLogin.toDate() : (data.lastLogin ? new Date(data.lastLogin) : undefined),
            permissions: {
              canViewDashboard: data.role === 'admin' || data.permissions?.canViewDashboard !== false,
              canValidateCollections: data.role === 'admin' || data.permissions?.canValidateCollections === true,
              canManageTeam: data.role === 'admin' || data.permissions?.canManageTeam === true,
              canManageSettings: data.role === 'admin' || false,
              canExportData: data.role === 'admin' || data.permissions?.canExportData === true,
            },
          };

          users.push(user);

          // Compter les statistiques
          if (user.role === 'admin') admins++;
          if (user.role === 'agent') agents++;
          if (user.status === 'active') activeUsers++;
          if (user.status === 'inactive') inactiveUsers++;
        });

        users.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

        setStats({
          totalUsers,
          admins,
          agents,
          activeUsers,
          inactiveUsers,
          users,
          loading: false,
          error: null,
        });
      });

      return () => {
        isMounted = false;
        unsubscribe();
      };
    } catch (error) {
      if (isMounted) {
        setStats((prev) => ({
          ...prev,
          loading: false,
          error: error instanceof Error ? error : new Error('Erreur inconnue'),
        }));
      }
    }
  }, []);

  return stats;
};

// Fonction utilitaire pour mettre à jour le rôle d'un utilisateur
export const updateUserRole = async (userId: string, newRole: 'admin' | 'agent'): Promise<void> => {
  try {
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, { role: newRole });
  } catch (error) {
    throw error instanceof Error ? error : new Error('Erreur lors de la mise à jour du rôle');
  }
};

// Fonction utilitaire pour mettre à jour le statut d'un utilisateur
export const updateUserStatus = async (userId: string, newStatus: 'active' | 'inactive' | 'suspended'): Promise<void> => {
  try {
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, { status: newStatus });
  } catch (error) {
    throw error instanceof Error ? error : new Error('Erreur lors de la mise à jour du statut');
  }
};

// Fonction utilitaire pour mettre à jour les permissions d'un utilisateur
export const updateUserPermissions = async (userId: string, permissions: Partial<UserPermission['permissions']>): Promise<void> => {
  try {
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, { permissions });
  } catch (error) {
    throw error instanceof Error ? error : new Error('Erreur lors de la mise à jour des permissions');
  }
};
