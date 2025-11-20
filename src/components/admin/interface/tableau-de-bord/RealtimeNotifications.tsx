import { useEffect } from "react";
import { collection, onSnapshot, query, orderBy, limit, Timestamp, doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useToast } from "@/components/ui/use-toast";
import { formatKg } from "@/lib/utils";

interface RealtimeNotificationsProps {
  enabled?: boolean;
}

export function RealtimeNotifications({ enabled = true }: RealtimeNotificationsProps) {
  const { toast } = useToast();

  useEffect(() => {
    if (!enabled) return;

    // Écouter les nouveaux agents
    const agentsQuery = query(
      collection(db, "agents"),
      orderBy("dateInscription", "desc"),
      limit(1)
    );

    const unsubAgents = onSnapshot(agentsQuery, (snapshot) => {
      snapshot.docChanges().forEach((change) => {
        if (change.type === "added") {
          const agent = change.doc.data();
          const inscriptionDate = agent.dateInscription as Timestamp;
          
          // Ne notifier que si l'inscription date de moins de 5 minutes
          const fiveMinutesAgo = new Date();
          fiveMinutesAgo.setMinutes(fiveMinutesAgo.getMinutes() - 5);
          
          if (inscriptionDate.toDate() > fiveMinutesAgo) {
            toast({
              title: "Nouvel agent inscrit",
              description: `${agent.nom || agent.name} a rejoint l'équipe.`,
            });
          }
        }
      });
    });

    // Écouter les nouvelles collectes
    const collectesQuery = query(
      collection(db, "collectes"),
      orderBy("date", "desc"),
      limit(1)
    );

    const unsubCollectes = onSnapshot(collectesQuery, (snapshot) => {
      snapshot.docChanges().forEach(async (change) => {
        if (change.type === "added") {
          const collecte = change.doc.data();
          const collecteDate = collecte.date as Timestamp;
          
          // Ne notifier que si la collecte date de moins de 5 minutes
          const fiveMinutesAgo = new Date();
          fiveMinutesAgo.setMinutes(fiveMinutesAgo.getMinutes() - 5);
          
          if (collecteDate.toDate() > fiveMinutesAgo) {
            // Récupérer le nom de l'agent
            const agentRef = doc(collection(db, "agents"), collecte.agentId);
            const agentSnap = await getDoc(agentRef);
            const agent = agentSnap.data();
            
            toast({
              title: "Nouvelle collecte enregistrée",
              description: `${agent?.nom || agent?.name || "Un agent"} a collecté ${formatKg(collecte.kg)} de ${collecte.type}.`,
            });
          }
        }
      });
    });

    return () => {
      unsubAgents();
      unsubCollectes();
    };
  }, [enabled, toast]);

  return null;
}
