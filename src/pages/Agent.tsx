import { useState } from "react";
import QRCode from "qrcode.react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CollecteForm } from "@/components/agent/CollecteForm";
import { ScrollArea } from "@/components/ui/scroll-area";
import { QrCode, Trash2, History } from "lucide-react";

interface Collecte {
  kg: number;
  type: string;
  points: number;
  timestamp: Date;
}

export default function Agent() {
  const [collectes, setCollectes] = useState<Collecte[]>([]);
  const [selectedCollecte, setSelectedCollecte] = useState<Collecte | null>(null);

  const handleNewCollecte = (data: { kg: number; type: string; points: number }) => {
    const newCollecte = {
      ...data,
      timestamp: new Date(),
    };
    setCollectes(prev => [newCollecte, ...prev]);
    setSelectedCollecte(newCollecte);
  };

  const totalPoints = collectes.reduce((sum, c) => sum + c.points, 0);

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="grid gap-6 md:grid-cols-2">
        {/* Formulaire de collecte */}
        <div>
          <CollecteForm onSubmit={handleNewCollecte} />
        </div>

        {/* QR Code */}
        <div>
          {selectedCollecte && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <QrCode className="w-5 h-5" />
                  QR Code de la collecte
                </CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col items-center space-y-4">
                <QRCode
                  value={JSON.stringify({
                    type: selectedCollecte.type,
                    kg: selectedCollecte.kg,
                    points: selectedCollecte.points,
                    timestamp: selectedCollecte.timestamp.toISOString(),
                  })}
                  size={200}
                  level="H"
                />
                <p className="text-sm text-center text-muted-foreground">
                  Ce QR code contient les détails de la dernière collecte
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Historique des collectes */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <History className="w-5 h-5" />
            Historique des collectes
            <span className="ml-auto text-sm font-normal">
              Total : {totalPoints} points
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[300px]">
            <div className="space-y-4">
              {collectes.map((collecte, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-4 rounded-lg border"
                >
                  <div>
                    <p className="font-medium capitalize">
                      {collecte.type} - {collecte.kg} kg
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {collecte.timestamp.toLocaleString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="font-medium text-primary">
                      {collecte.points} pts
                    </span>
                    <button
                      onClick={() => setSelectedCollecte(collecte)}
                      className="p-2 hover:bg-primary/10 rounded-lg"
                    >
                      <QrCode className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() =>
                        setCollectes(prev => prev.filter((_, i) => i !== index))
                      }
                      className="p-2 hover:bg-destructive/10 rounded-lg text-destructive"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}
