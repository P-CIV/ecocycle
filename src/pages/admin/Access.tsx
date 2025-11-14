import { useState } from 'react';
import { useAccessControl, updateUserRole, updateUserStatus, UserPermission } from '@/hooks/useAccessControl';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, AlertCircle, Shield, Users, CheckCircle2, XCircle } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const Access = () => {
  const { totalUsers, admins, agents, activeUsers, inactiveUsers, users, loading, error } = useAccessControl();
  const [filterRole, setFilterRole] = useState<'all' | 'admin' | 'agent'>('all');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive' | 'suspended'>('all');
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center space-y-4">
          <Loader2 className="w-8 h-8 animate-spin mx-auto" />
          <p className="text-muted-foreground">Chargement des permissions...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="shadow-card w-full max-w-md border-red-200 bg-red-50">
          <CardHeader>
            <div className="flex items-center space-x-2">
              <AlertCircle className="h-5 w-5 text-red-600" />
              <CardTitle>Erreur</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-red-700">{error.message}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Filtrer les utilisateurs
  const filteredUsers = users.filter((user) => {
    const roleMatch = filterRole === 'all' || user.role === filterRole;
    const statusMatch = filterStatus === 'all' || user.status === filterStatus;
    return roleMatch && statusMatch;
  });

  // Gérer le changement de rôle
  const handleRoleChange = async (userId: string, newRole: 'admin' | 'agent') => {
    setUpdatingId(userId);
    try {
      await updateUserRole(userId, newRole);
      setSuccessMessage(`Rôle mis à jour avec succès`);
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : 'Erreur lors de la mise à jour');
      setTimeout(() => setErrorMessage(null), 3000);
    } finally {
      setUpdatingId(null);
    }
  };

  // Gérer le changement de statut
  const handleStatusChange = async (userId: string, newStatus: 'active' | 'inactive' | 'suspended') => {
    setUpdatingId(userId);
    try {
      await updateUserStatus(userId, newStatus);
      setSuccessMessage(`Statut mis à jour avec succès`);
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : 'Erreur lors de la mise à jour');
      setTimeout(() => setErrorMessage(null), 3000);
    } finally {
      setUpdatingId(null);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'inactive':
        return 'bg-yellow-100 text-yellow-800';
      case 'suspended':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'active':
        return 'Actif';
      case 'inactive':
        return 'Inactif';
      case 'suspended':
        return 'Suspendu';
      default:
        return status;
    }
  };

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="bg-gradient-to-r from-slate-700 via-slate-600 to-slate-800 rounded-xl p-8 text-white shadow-lg">
        <h2 className="text-3xl font-bold">🔐 Contrôle d'Accès</h2>
        <p className="text-slate-200 mt-1">Gestion des permissions et des rôles utilisateurs</p>
      </div>

      {/* Messages de succès/erreur */}
      {successMessage && (
        <Card className="shadow-card border-green-200 bg-green-50">
          <CardContent className="pt-6">
            <p className="text-green-700">{successMessage}</p>
          </CardContent>
        </Card>
      )}
      {errorMessage && (
        <Card className="shadow-card border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <p className="text-red-700">{errorMessage}</p>
          </CardContent>
        </Card>
      )}

      {/* KPIs */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <Card className="bg-gradient-to-br from-slate-400 to-gray-500 border-0 shadow-lg text-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-white/90 flex items-center gap-2">
              <Users className="w-4 h-4" /> Total
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{totalUsers}</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-400 to-indigo-500 border-0 shadow-lg text-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-white/90 flex items-center gap-2">
              <Shield className="w-4 h-4" /> Admins
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{admins}</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-400 to-cyan-500 border-0 shadow-lg text-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-white/90">Agents</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{agents}</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-emerald-400 to-teal-500 border-0 shadow-lg text-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-white/90">Actifs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{activeUsers}</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-amber-400 to-orange-500 border-0 shadow-lg text-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-white/90">Inactifs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{inactiveUsers}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filtres et tableau */}
      <Card className="shadow-card bg-gradient-to-br from-slate-50 to-slate-100 border-slate-200">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 gap-4 flex-wrap">
          <CardTitle>👥 Gestion des Utilisateurs</CardTitle>
          <div className="flex gap-3">
            <Select value={filterRole} onValueChange={(value: any) => setFilterRole(value)}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Filtrer par rôle" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les rôles</SelectItem>
                <SelectItem value="admin">Admins</SelectItem>
                <SelectItem value="agent">Agents</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filterStatus} onValueChange={(value: any) => setFilterStatus(value)}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Filtrer par statut" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les statuts</SelectItem>
                <SelectItem value="active">Actifs</SelectItem>
                <SelectItem value="inactive">Inactifs</SelectItem>
                <SelectItem value="suspended">Suspendus</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {filteredUsers.length === 0 ? (
            <div className="flex items-center justify-center py-12 text-muted-foreground">
              <div className="text-center">
                <Users className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p>Aucun utilisateur trouvé</p>
              </div>
            </div>
          ) : (
            <div className="rounded-lg border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted hover:bg-muted">
                    <TableHead className="font-semibold">Email</TableHead>
                    <TableHead className="font-semibold">Nom</TableHead>
                    <TableHead className="font-semibold">Rôle</TableHead>
                    <TableHead className="font-semibold">Statut</TableHead>
                    <TableHead className="font-semibold">Créé</TableHead>
                    <TableHead className="font-semibold">Dernière connexion</TableHead>
                    <TableHead className="font-semibold text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.map((user: UserPermission) => (
                    <TableRow key={user.id} className="hover:bg-muted/50 transition-colors">
                      <TableCell className="font-medium text-sm">{user.email}</TableCell>
                      <TableCell className="text-sm">{user.displayName || '-'}</TableCell>
                      <TableCell>
                        <Select
                          value={user.role}
                          onValueChange={(newRole: any) => handleRoleChange(user.id, newRole)}
                          disabled={updatingId === user.id}
                        >
                          <SelectTrigger className="w-24">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="admin">Admin</SelectItem>
                            <SelectItem value="agent">Agent</SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell>
                        <Select
                          value={user.status}
                          onValueChange={(newStatus: any) => handleStatusChange(user.id, newStatus)}
                          disabled={updatingId === user.id}
                        >
                          <SelectTrigger className="w-28">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="active">Actif</SelectItem>
                            <SelectItem value="inactive">Inactif</SelectItem>
                            <SelectItem value="suspended">Suspendu</SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell className="text-sm">
                        {format(user.createdAt, 'dd MMM yyyy', { locale: fr })}
                      </TableCell>
                      <TableCell className="text-sm">
                        {user.lastLogin
                          ? format(user.lastLogin, 'dd MMM yyyy HH:mm', { locale: fr })
                          : 'Jamais'}
                      </TableCell>
                      <TableCell className="text-right">
                        {updatingId === user.id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Badge className={cn('text-xs', getStatusColor(user.status))}>
                            {getStatusLabel(user.status)}
                          </Badge>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Résumé des permissions */}
      <Card className="shadow-card bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200">
        <CardHeader>
          <CardTitle className="text-purple-900">🔒 Matrice des Permissions par Rôle</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-2 font-semibold">Permission</th>
                    <th className="text-center p-2 font-semibold">Admin</th>
                    <th className="text-center p-2 font-semibold">Agent</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b hover:bg-muted/50">
                    <td className="p-2">Voir le tableau de bord</td>
                    <td className="text-center">
                      <CheckCircle2 className="w-4 h-4 text-green-600 mx-auto" />
                    </td>
                    <td className="text-center">
                      <CheckCircle2 className="w-4 h-4 text-green-600 mx-auto" />
                    </td>
                  </tr>
                  <tr className="border-b hover:bg-muted/50">
                    <td className="p-2">Valider les collectes</td>
                    <td className="text-center">
                      <CheckCircle2 className="w-4 h-4 text-green-600 mx-auto" />
                    </td>
                    <td className="text-center">
                      <XCircle className="w-4 h-4 text-red-600 mx-auto" />
                    </td>
                  </tr>
                  <tr className="border-b hover:bg-muted/50">
                    <td className="p-2">Gérer l'équipe</td>
                    <td className="text-center">
                      <CheckCircle2 className="w-4 h-4 text-green-600 mx-auto" />
                    </td>
                    <td className="text-center">
                      <XCircle className="w-4 h-4 text-red-600 mx-auto" />
                    </td>
                  </tr>
                  <tr className="border-b hover:bg-muted/50">
                    <td className="p-2">Gérer les paramètres</td>
                    <td className="text-center">
                      <CheckCircle2 className="w-4 h-4 text-green-600 mx-auto" />
                    </td>
                    <td className="text-center">
                      <XCircle className="w-4 h-4 text-red-600 mx-auto" />
                    </td>
                  </tr>
                  <tr className="border-b hover:bg-muted/50">
                    <td className="p-2">Exporter les données</td>
                    <td className="text-center">
                      <CheckCircle2 className="w-4 h-4 text-green-600 mx-auto" />
                    </td>
                    <td className="text-center">
                      <XCircle className="w-4 h-4 text-red-600 mx-auto" />
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Access;
