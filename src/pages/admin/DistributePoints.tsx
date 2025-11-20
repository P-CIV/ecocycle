import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { 
  Coins,
  Send,
  Users,
  TrendingUp,
  AlertCircle,
  CheckCircle
} from 'lucide-react';
import { collection, getDocs, query, where, updateDoc, doc, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useToast } from '@/components/ui/use-toast';
import { motion } from 'framer-motion';

interface Agent {
  id: string;
  displayName: string;
  email: string;
  points: number;
  zone?: string;
  status?: string;
}

export default function DistributePerformancePoints() {
  const { toast } = useToast();
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const [distributing, setDistributing] = useState(false);
  const [selectedAgents, setSelectedAgents] = useState<Set<string>>(new Set());
  const [pointsPerAgent, setPointsPerAgent] = useState<string>('100');
  const [raison, setRaison] = useState<string>('Bonus de performance mensuel');
  const [totalPoints, setTotalPoints] = useState(0);

  // Charger la liste des agents
  useEffect(() => {
    const loadAgents = async () => {
      try {
        const q = query(collection(db, 'users'), where('role', '==', 'agent'));
        const snapshot = await getDocs(q);
        const agentsList = snapshot.docs.map(doc => ({
          id: doc.id,
          displayName: doc.data().displayName || 'Agent sans nom',
          email: doc.data().email || '',
          points: doc.data().points || 0,
          zone: doc.data().zone || '',
          status: doc.data().status || 'active'
        }));
        setAgents(agentsList.sort((a, b) => (a.displayName).localeCompare(b.displayName)));
      } catch (error) {
        console.error('Erreur lors du chargement des agents:', error);
        toast({
          title: "Erreur",
          description: "Impossible de charger la liste des agents",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    loadAgents();
  }, []);

  // Calculer le total de points
  useEffect(() => {
    const points = parseInt(pointsPerAgent) || 0;
    setTotalPoints(points * selectedAgents.size);
  }, [selectedAgents, pointsPerAgent]);

  const toggleAgent = (agentId: string) => {
    const newSelected = new Set(selectedAgents);
    if (newSelected.has(agentId)) {
      newSelected.delete(agentId);
    } else {
      newSelected.add(agentId);
    }
    setSelectedAgents(newSelected);
  };

  const selectAll = () => {
    if (selectedAgents.size === agents.length) {
      setSelectedAgents(new Set());
    } else {
      setSelectedAgents(new Set(agents.map(a => a.id)));
    }
  };

  const handleDistribute = async () => {
    if (selectedAgents.size === 0) {
      toast({
        title: "Aucun agent sélectionné",
        description: "Veuillez sélectionner au moins un agent",
        variant: "destructive"
      });
      return;
    }

    const points = parseInt(pointsPerAgent);
    if (isNaN(points) || points <= 0) {
      toast({
        title: "Montant invalide",
        description: "Veuillez entrer un nombre de points valide",
        variant: "destructive"
      });
      return;
    }

    setDistributing(true);
    try {
      const updates = Array.from(selectedAgents).map(agentId => {
        const agent = agents.find(a => a.id === agentId);
        const newPoints = (agent?.points || 0) + points;
        
        return Promise.all([
          // Mettre à jour les points de l'agent
          updateDoc(doc(db, 'users', agentId), {
            points: newPoints,
            dernierBonus: serverTimestamp()
          }),
          // Créer un enregistrement de distribution
          addDoc(collection(db, 'distributions'), {
            agentId,
            agentName: agent?.displayName || 'Agent',
            points,
            raison,
            distributedAt: serverTimestamp(),
            distributedBy: 'admin'
          })
        ]);
      });

      await Promise.all(updates);

      toast({
        title: "Distribution effectuée ! ✅",
        description: `${totalPoints} points distribués à ${selectedAgents.size} agent(s)`,
      });

      // Rafraîchir la liste
      setAgents(agents.map(a => 
        selectedAgents.has(a.id) 
          ? { ...a, points: a.points + points }
          : a
      ));

      // Réinitialiser
      setSelectedAgents(new Set());
      setPointsPerAgent('100');
      setRaison('Bonus de performance mensuel');

    } catch (error) {
      console.error('Erreur lors de la distribution:', error);
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de la distribution",
        variant: "destructive"
      });
    } finally {
      setDistributing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="bg-gradient-to-r from-orange-500 via-amber-500 to-yellow-500 rounded-xl p-8 text-white shadow-lg">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-4xl font-bold flex items-center gap-3">
              <Coins className="h-10 w-10" />
              Distribution de Points de Performance
            </h2>
            <p className="text-orange-100 mt-2 text-lg">
              Récompensez vos agents pour leurs performances
            </p>
          </div>
          <div className="text-right">
            <div className="text-4xl font-bold">{agents.length}</div>
            <p className="text-orange-100">agents actifs</p>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Statistiques */}
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-blue-900 flex items-center gap-2">
              <Users className="w-4 h-4" />
              Agents sélectionnés
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600">{selectedAgents.size}</div>
            <p className="text-xs text-blue-700 mt-1">sur {agents.length} agents</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-orange-900 flex items-center gap-2">
              <Coins className="w-4 h-4" />
              Points par agent
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-orange-600">{pointsPerAgent || '0'}</div>
            <p className="text-xs text-orange-700 mt-1">à distribuer</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-green-900 flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              Total points
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">{totalPoints}</div>
            <p className="text-xs text-green-700 mt-1">points à distribuer</p>
          </CardContent>
        </Card>
      </div>

      {/* Formulaire de distribution */}
      <Card className="border-border/50 shadow-lg bg-gradient-to-br from-amber-50 to-orange-50 border-amber-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-amber-900">
            <Send className="w-5 h-5 text-amber-600" />
            Paramètres de distribution
          </CardTitle>
          <CardDescription className="text-amber-700">
            Configurez les points à distribuer et la raison
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="points" className="text-amber-900 font-medium">
                Points par agent
              </Label>
              <Input
                id="points"
                type="number"
                min="1"
                value={pointsPerAgent}
                onChange={(e) => setPointsPerAgent(e.target.value)}
                className="bg-white border-amber-200"
                placeholder="100"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="raison" className="text-amber-900 font-medium">
                Raison de la distribution
              </Label>
              <Input
                id="raison"
                value={raison}
                onChange={(e) => setRaison(e.target.value)}
                className="bg-white border-amber-200"
                placeholder="Bonus de performance mensuel"
              />
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex gap-3">
              <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-blue-900">Info</p>
                <p className="text-sm text-blue-700 mt-1">
                  Vous êtes sur le point de distribuer <strong>{totalPoints} points</strong> à <strong>{selectedAgents.size} agent(s)</strong>
                </p>
              </div>
            </div>
          </div>

          <Button
            onClick={handleDistribute}
            disabled={selectedAgents.size === 0 || distributing}
            className="w-full gap-2 mt-6 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-semibold py-6 text-lg"
            size="lg"
          >
            <Send className="w-5 h-5" />
            {distributing ? 'Distribution en cours...' : 'Distribuer les points'}
          </Button>
        </CardContent>
      </Card>

      {/* Liste des agents */}
      <Card className="border-border/50 shadow-lg">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5 text-primary" />
                Liste des agents
              </CardTitle>
              <CardDescription>
                Sélectionnez les agents pour la distribution
              </CardDescription>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={selectAll}
              className="gap-2"
            >
              {selectedAgents.size === agents.length ? 'Déselectionner tout' : 'Sélectionner tout'}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-border/50 bg-muted/30">
                <tr className="text-left text-muted-foreground font-medium">
                  <th className="pb-3 px-4 w-10">
                    <input
                      type="checkbox"
                      checked={selectedAgents.size === agents.length && agents.length > 0}
                      onChange={selectAll}
                      className="w-4 h-4 rounded border-gray-300"
                    />
                  </th>
                  <th className="pb-3 px-4">Agent</th>
                  <th className="pb-3 px-4">Email</th>
                  <th className="pb-3 px-4">Zone</th>
                  <th className="pb-3 px-4">Points actuels</th>
                  <th className="pb-3 px-4">Statut</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/30">
                {agents.map((agent) => (
                  <motion.tr
                    key={agent.id}
                    className={`hover:bg-muted/50 transition-colors ${
                      selectedAgents.has(agent.id) ? 'bg-orange-50' : ''
                    }`}
                  >
                    <td className="py-3 px-4">
                      <input
                        type="checkbox"
                        checked={selectedAgents.has(agent.id)}
                        onChange={() => toggleAgent(agent.id)}
                        className="w-4 h-4 rounded border-gray-300 cursor-pointer"
                      />
                    </td>
                    <td className="py-3 px-4 font-medium">{agent.displayName}</td>
                    <td className="py-3 px-4 text-muted-foreground">{agent.email}</td>
                    <td className="py-3 px-4">{agent.zone || '-'}</td>
                    <td className="py-3 px-4">
                      <Badge variant="secondary" className="bg-blue-100 text-blue-900">
                        {agent.points.toLocaleString('fr-FR')}
                      </Badge>
                    </td>
                    <td className="py-3 px-4">
                      <Badge variant={agent.status === 'active' ? 'default' : 'secondary'}>
                        {agent.status === 'active' ? 'Actif' : 'Inactif'}
                      </Badge>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>

            {agents.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                Aucun agent trouvé
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Guide d'utilisation */}
      <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
        <CardHeader>
          <CardTitle className="text-green-900 text-base flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-green-600" />
            Guide d'utilisation
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-green-800">
          <p>
            1️⃣ <strong>Sélectionnez</strong> les agents qui doivent recevoir les points bonus
          </p>
          <p>
            2️⃣ <strong>Entrez</strong> le nombre de points à distribuer par agent
          </p>
          <p>
            3️⃣ <strong>Spécifiez</strong> la raison de la distribution (pour les archives)
          </p>
          <p>
            4️⃣ <strong>Vérifiez</strong> le total de points avant de confirmer
          </p>
          <p>
            5️⃣ <strong>Cliquez</strong> sur "Distribuer les points" pour finaliser
          </p>
          <p className="mt-4 font-medium">
            💡 Les points distribués seront immédiatement ajoutés aux comptes des agents sélectionnés
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
