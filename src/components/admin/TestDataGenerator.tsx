import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { db } from "@/lib/firebase";
import { collection, addDoc, Timestamp } from "firebase/firestore";
import { Loader2, Database } from "lucide-react";

// Noms réalistes pour les agents
const AGENTS = [
  "Sophie Martin",
  "Thomas Bernard",
  "Emma Dubois",
  "Lucas Petit",
  "Léa Robert",
  "Nathan Durand",
  "Chloé Moreau",
  "Hugo Richard",
  "Camille Laurent",
  "Jules Simon",
  "Manon Thomas",
  "Louis Michel",
  "Inès Lefebvre",
  "Gabriel Leroy",
  "Alice Roux"
];

// Types de déchets avec points associés
const TYPES_DECHETS = [
  { type: "Plastique", points: 12, probabilite: 0.35 },
  { type: "Papier/Carton", points: 8, probabilite: 0.25 },
  { type: "Verre", points: 10, probabilite: 0.2 },
  { type: "Métal", points: 15, probabilite: 0.1 },
  { type: "Électronique", points: 20, probabilite: 0.05 },
  { type: "Textile", points: 10, probabilite: 0.05 }
];

// Fonction pour générer une date aléatoire dans une plage
const randomDate = (start: Date, end: Date) => {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
};

// Fonction pour générer un type de déchet selon les probabilités
const getRandomType = () => {
  const rand = Math.random();
  let sum = 0;
  for (const type of TYPES_DECHETS) {
    sum += type.probabilite;
    if (rand <= sum) return type;
  }
  return TYPES_DECHETS[0];
};

// Fonction pour générer une collecte
const generateCollecte = (date: Date, agentId: string) => {
  const type = getRandomType();
  const kg = Math.round((Math.random() * 15 + 5) * 10) / 10; // Entre 5 et 20 kg
  return {
    date: Timestamp.fromDate(date),
    agentId,
    type: type.type,
    kg,
    points: Math.round(kg * type.points),
    latitude: 5.316667 + (Math.random() - 0.5) * 0.1, // Abidjan ±5km
    longitude: -4.033333 + (Math.random() - 0.5) * 0.1,
    status: "validé",
    commentaire: "Collecte test"
  };
};

export function TestDataGenerator() {
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState({ current: 0, total: 0 });

  const generateData = async () => {
    try {
      setLoading(true);
      
      // Créer les agents s'ils n'existent pas déjà
      const agentsCollection = collection(db, "agents");
      const agentDocs = await Promise.all(
        AGENTS.map(nom => 
          addDoc(agentsCollection, {
            nom,
            email: nom.toLowerCase().replace(" ", ".") + "@ecocycle.ci",
            role: "agent",
            actif: true,
            dateInscription: Timestamp.fromDate(randomDate(
              new Date(2025, 5, 1), // 1er juin 2025
              new Date(2025, 7, 1)  // 1er août 2025
            )),
            telephone: "+225" + Math.floor(Math.random() * 90000000 + 10000000).toString(),
            zone: ["Cocody", "Yopougon", "Plateau", "Adjamé"][Math.floor(Math.random() * 4)]
          })
        )
      );

      // Générer les collectes
      const collectesCollection = collection(db, "collectes");
      const endDate = new Date();
      const startDate = new Date();
      startDate.setMonth(endDate.getMonth() - 6);

      // Nombre total de collectes à générer
      const collectesParJour = 8; // Moyenne de collectes par jour
      const nombreDeJours = Math.floor((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
      const totalCollectes = nombreDeJours * collectesParJour;
      
      setProgress({ current: 0, total: totalCollectes });

      // Générer les collectes jour par jour
      for (let jour = 0; jour < nombreDeJours; jour++) {
        const date = new Date(startDate);
        date.setDate(date.getDate() + jour);
        
        // Nombre aléatoire de collectes pour ce jour
        const collectesAujourdhui = Math.floor(Math.random() * 5 + collectesParJour - 2);
        
        for (let i = 0; i < collectesAujourdhui; i++) {
          const agentDoc = agentDocs[Math.floor(Math.random() * agentDocs.length)];
          const collecteDate = new Date(date);
          collecteDate.setHours(Math.floor(Math.random() * 10) + 8); // Entre 8h et 18h
          
          await addDoc(collectesCollection, generateCollecte(collecteDate, agentDoc.id));
          setProgress(prev => ({ ...prev, current: prev.current + 1 }));
        }
      }
    } catch (error) {
      console.error("Erreur lors de la génération des données:", error);
    } finally {
      setLoading(false);
      setProgress({ current: 0, total: 0 });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="w-5 h-5" />
          Générateur de Données de Test
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Cet outil va générer des données de test réalistes pour les agents et leurs collectes.
            Les données couvrent les 6 derniers mois avec une moyenne de {8} collectes par jour.
          </p>
          
          <div className="flex items-center gap-4">
            <Button
              onClick={generateData}
              disabled={loading}
            >
              {loading && (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Génération en cours...
                  {progress.total > 0 && ` (${Math.round((progress.current / progress.total) * 100)}%)`}
                </>
              )}
              {!loading && "Générer des données de test"}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}