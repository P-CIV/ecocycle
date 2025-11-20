import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Card, CardContent } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { formatDate, formatKg, formatNumber } from "@/lib/utils"
import { useEffect, useState } from "react"
import { collection, query, where, orderBy, limit, onSnapshot, Timestamp } from "firebase/firestore";
import { db } from "@/lib/firebase"
import { User, MapPin, Package, Award } from "lucide-react"

interface AgentDetailsModalProps {
  agentId: string | null
  onClose: () => void
}

interface AgentCollecte {
  id: string
  date: Timestamp
  kg: number
  type: string
  points: number
  status: string
}

export function AgentDetailsModal({ agentId, onClose }: AgentDetailsModalProps) {
  const [agent, setAgent] = useState<any>(null)
  const [collectes, setCollectes] = useState<AgentCollecte[]>([])
  const [stats, setStats] = useState({
    totalKg: 0,
    totalPoints: 0,
    collectesCount: 0
  })

  useEffect(() => {
    if (!agentId) return

    // Écouter les détails de l'agent
    const agentsRef = collection(db, "agents");
    const agentQuery = query(agentsRef, where("id", "==", agentId));
    const unsubAgent = onSnapshot(agentQuery, (snapshot) => {
      if (!snapshot.empty) {
        setAgent({ id: snapshot.docs[0].id, ...snapshot.docs[0].data() })
      }
    })

    // Écouter les 10 dernières collectes de l'agent
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    const collectesQuery = query(
      collection(db, "collectes"),
      where("agentId", "==", agentId),
      where("date", ">=", Timestamp.fromDate(thirtyDaysAgo)),
      orderBy("date", "desc"),
      limit(10)
    )

    const unsubCollectes = onSnapshot(collectesQuery, (snapshot) => {
      const collectesList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as AgentCollecte[]

      setCollectes(collectesList)

      // Calculer les statistiques
      const stats = collectesList.reduce(
        (acc, c) => ({
          totalKg: acc.totalKg + (c.kg || 0),
          totalPoints: acc.totalPoints + (c.points || 0),
          collectesCount: acc.collectesCount + 1
        }),
        { totalKg: 0, totalPoints: 0, collectesCount: 0 }
      )
      setStats(stats)
    })

    return () => {
      unsubAgent()
      unsubCollectes()
    }
  }, [agentId])

  if (!agent) return null

  return (
    <Dialog open={Boolean(agentId)} onOpenChange={() => onClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold flex items-center gap-2">
            <User className="w-5 h-5" />
            {agent.nom || agent.name}
          </DialogTitle>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          {/* Informations de base */}
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-muted-foreground">
                <MapPin className="w-4 h-4" />
                <span>Zone: {agent.zone || "Non assignée"}</span>
              </div>
              <div className="text-muted-foreground">
                Tel: {agent.telephone || "—"}
              </div>
              <div className="text-muted-foreground">
                Email: {agent.email || "—"}
              </div>
              <div className="text-muted-foreground">
                Inscrit le: {agent.dateInscription ? formatDate(new Date(agent.dateInscription.seconds * 1000)) : "—"}
              </div>
            </div>

            {/* Statistiques du mois */}
            <div className="grid grid-cols-2 gap-4">
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-2">
                    <Package className="w-4 h-4 text-muted-foreground" />
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">Total collecté</p>
                      <p className="text-xl font-bold">{formatKg(stats.totalKg)}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-2">
                    <Award className="w-4 h-4 text-muted-foreground" />
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">Points</p>
                      <p className="text-xl font-bold">{formatNumber(stats.totalPoints)}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Dernières collectes */}
          <div className="space-y-4">
            <h3 className="font-semibold">
              Dernières collectes ({formatNumber(stats.collectesCount)})
            </h3>
            <ScrollArea className="h-[300px] rounded-md border">
              <div className="p-4 space-y-4">
                {collectes.map((collecte) => (
                  <div
                    key={collecte.id}
                    className="flex items-center justify-between p-4 rounded-lg bg-muted/30"
                  >
                    <div>
                      <p className="font-medium">{formatKg(collecte.kg)} de {collecte.type}</p>
                      <p className="text-sm text-muted-foreground">
                        {formatDate(new Date(collecte.date.seconds * 1000))}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">{formatNumber(collecte.points)} points</p>
                      <p className="text-sm text-muted-foreground">{collecte.status}</p>
                    </div>
                  </div>
                ))}
                {collectes.length === 0 && (
                  <div className="text-center text-muted-foreground py-8">
                    Aucune collecte sur les 30 derniers jours
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
