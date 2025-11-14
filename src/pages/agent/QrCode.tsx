import { useState, useRef } from "react";
import { QrCode as QrCodeIcon, Download, Smartphone } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import QRCode from "react-qr-code";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/contexts/AuthContext";
import { updateAgentStats } from "@/utils/statsUtils";
import { useToast } from "@/components/ui/use-toast";

const QrCode = () => {
  const [poids, setPoids] = useState<string>("");
  const [typeDechet, setTypeDechet] = useState<string>("");
  const [qrGenere, setQrGenere] = useState<boolean>(false);
  const [points, setPoints] = useState<number>(0);
  const [currentId, setCurrentId] = useState<string>("");
  const [historique, setHistorique] = useState([
    { id: "COL-2025-156", date: "2025-06-24 14:30", kg: 25, points: 250, type: "Plastique" },
    { id: "COL-2025-155", date: "2025-06-24 11:15", kg: 18, points: 180, type: "Papier" },
    { id: "COL-2025-154", date: "2025-06-23 16:45", kg: 32, points: 320, type: "Verre" },
  ]);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const qrCodeRef = useRef<HTMLDivElement>(null);
  const { currentUser } = useAuth();
  const { toast } = useToast();

  const calculerPoints = (kg: number) => kg * 10;

  const genererIdCollecte = () => {
    const date = new Date();
    const numeroAleatoire = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `COL-${date.getFullYear()}-${numeroAleatoire}`;
  };

  const handleGenerate = async () => {
    if (!currentUser) {
      toast({
        title: "Erreur",
        description: "Vous devez être connecté pour générer un QR code",
        variant: "destructive",
      });
      return;
    }

    if (poids && typeDechet) {
      setIsLoading(true);
      try {
        const poidsNumber = parseFloat(poids);
        const newId = genererIdCollecte();
        
        // Mise à jour des statistiques de l'agent
        const statsResult = await updateAgentStats(currentUser.uid, poidsNumber, typeDechet);
        
        const nouvelleCollecte = {
          id: newId,
          date: new Date().toLocaleString('fr-FR'),
          kg: poidsNumber,
          points: statsResult.points,
          type: typeDechet
        };

        setPoints(statsResult.points);
        setCurrentId(newId);
        setHistorique(prev => [nouvelleCollecte, ...prev.slice(0, 4)]);
        setQrGenere(true);

        toast({
          title: "Succès !",
          description: `Vous avez gagné ${statsResult.points} points pour cette collecte !`,
        });
      } catch (error) { console.error("Erreur lors de la génération du QR code:", error);
        toast({
          title: "Erreur",
          description: "Une erreur est survenue lors de la génération du QR code",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleDownload = () => {
    if (qrCodeRef.current) {
      const svg = qrCodeRef.current.querySelector('svg') as SVGElement;
      if (svg) {
        const svgData = new XMLSerializer().serializeToString(svg);
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        const img = new Image();
        img.onload = () => {
          canvas.width = img.width;
          canvas.height = img.height;
          ctx.fillStyle = 'white';
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          ctx.drawImage(img, 0, 0);
          const pngFile = canvas.toDataURL("image/png");
          const downloadLink = document.createElement("a");
          downloadLink.download = `qr-code-${currentId}.png`;
          downloadLink.href = pngFile;
          downloadLink.click();
        };
        img.src = `data:image/svg+xml;base64,${btoa(svgData)}`;
      }
    }
  };



  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-indigo-600 via-purple-500 to-pink-500 rounded-xl p-8 text-white shadow-lg">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-4xl font-bold">🎯 Générateur de QR Code</h2>
            <p className="text-purple-100 mt-2 text-lg">
              Créez des codes QR dynamiques pour tracer vos collectes
            </p>
          </div>
          <div className="hidden md:flex items-center space-x-2">
            <div className="flex items-center space-x-2 bg-green-500/20 text-green-100 px-3 py-1.5 rounded-lg border border-green-400/30">
              <span className="h-2.5 w-2.5 rounded-full bg-green-400 shadow-lg shadow-green-400/50 animate-pulse"></span>
              <span className="text-sm font-medium">Système opérationnel</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Formulaire de génération */}
        <Card className="shadow-xl bg-gradient-to-br from-blue-50 to-purple-50 border-purple-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-gradient-to-br from-indigo-400 to-purple-500 text-white shadow-lg">
                <QrCodeIcon className="h-5 w-5" />
              </div>
              <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                Nouveau QR Code
              </span>
            </CardTitle>
            <CardDescription className="text-purple-700 mt-2 text-base">
              Remplissez les informations pour générer un code QR unique
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="poids" className="text-sm font-medium text-purple-900">Poids (kg)</Label>
                <div className="relative">
                  <Input
                    id="poids"
                    type="number"
                    placeholder="0"
                    value={poids}
                    onChange={(e) => setPoids(e.target.value)}
                    min="0"
                    step="0.1"
                    className="pl-8"
                  />
                  <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                    <span className="text-lg">⚖️</span>
                  </div>
                </div>
                {poids && (
                  <div className="flex items-center space-x-2 bg-gradient-to-r from-indigo-100 to-purple-100 text-indigo-900 rounded-md p-2 border border-indigo-200">
                    <div className="h-2 w-2 rounded-full bg-indigo-600 animate-pulse"></div>
                    <p className="text-sm font-medium">
                      Points à gagner : {calculerPoints(parseFloat(poids) || 0)} points
                    </p>
                  </div>
                )}
              </div>
            <div className="space-y-2">
              <Label htmlFor="type" className="text-sm font-medium text-purple-900">Type de Déchet</Label>
              <Select value={typeDechet} onValueChange={setTypeDechet}>
                <SelectTrigger className="bg-white border-purple-200">
                  <SelectValue placeholder="Sélectionnez un type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="plastique">🥤 Plastique</SelectItem>
                  <SelectItem value="papier">📄 Papier</SelectItem>
                  <SelectItem value="verre">🫙 Verre</SelectItem>
                  <SelectItem value="polystyrène">🥫 Polystyrène</SelectItem>
                  <SelectItem value="carton">📦 Carton</SelectItem>
                </SelectContent>
              </Select>
              {typeDechet && (
                <p className="text-xs text-purple-700">
                  Type sélectionné : {typeDechet.charAt(0).toUpperCase() + typeDechet.slice(1)}
                </p>
              )}
            </div>

            <Button 
              onClick={handleGenerate} 
              className={`w-full relative overflow-hidden transition-all duration-300 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white ${
                !poids || !typeDechet ? 'opacity-50 cursor-not-allowed' : 'hover:scale-[1.02]'
              }`}
              size="lg" 
              disabled={!poids || !typeDechet || isLoading}
            >
              <div className={`absolute inset-0 bg-gradient-to-r from-white/20 to-transparent transition-transform duration-300 ${
                isLoading ? 'animate-shimmer' : ''
              }`} />
              <div className="relative flex items-center justify-center space-x-2">
                {isLoading ? (
                  <>
                    <div className="animate-spin h-5 w-5 border-3 border-white/30 border-t-white rounded-full"></div>
                    <span className="font-medium">Génération en cours...</span>
                  </>
                ) : (
                  <>
                    <QrCodeIcon className="h-5 w-5 mr-2" />
                    <span className="font-medium">Générer le QR Code</span>
                  </>
                )}
              </div>
            </Button>
            {(!poids || !typeDechet) && (
              <p className="text-sm text-purple-600 mt-2 text-center">
                Veuillez remplir tous les champs pour générer le QR code
              </p>
            )}

            {qrGenere && (
              <div className="p-8 rounded-xl bg-gradient-to-br from-emerald-100 via-teal-50 to-cyan-100 border border-emerald-200 animate-fade-in space-y-6 shadow-xl">
                {/* QR Code réel */}
                <div className="bg-white p-6 rounded-xl shadow-2xl flex items-center justify-center relative overflow-hidden border-2 border-emerald-200">
                  <div className="absolute inset-0 bg-gradient-to-br from-emerald-100/30 to-teal-100/30 animate-gradient-slow"></div>
                  <div className="w-52 h-52 relative" ref={qrCodeRef}>
                    <div className="absolute inset-0 bg-gradient-to-br from-emerald-200/20 to-teal-200/20 rounded-lg opacity-50 animate-pulse-slow"></div>
                    <QRCode
                      value={`{"id":"${currentId}","poids":"${poids}","type":"${typeDechet}","points":${points}}`}
                      size={200}
                      style={{ height: "auto", maxWidth: "100%", width: "100%" }}
                      level="H"
                      className="rounded-lg relative z-10 shadow-sm"
                    />
                  </div>
                </div>

                <div className="space-y-3 text-center">
                  <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-emerald-400 to-teal-400 text-white rounded-full px-4 py-1">
                    <span className="h-2 w-2 rounded-full bg-white animate-pulse"></span>
                    <p className="text-sm font-medium">QR Code généré avec succès !</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-emerald-900">
                      {poids} kg de {typeDechet}
                    </p>
                    <div className="flex items-center justify-center space-x-2">
                      <span className="text-xl">🎉</span>
                      <p className="text-lg font-semibold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                        {points} points gagnés !
                      </p>
                      <span className="text-xl">🎉</span>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button variant="outline" className="flex-1 border-emerald-300 text-emerald-700 hover:bg-emerald-100" onClick={handleDownload}>
                    <Download className="mr-2 h-4 w-4" />
                    Télécharger
                  </Button>
                  <Button variant="outline" className="flex-1 border-teal-300 text-teal-700 hover:bg-teal-100">
                    <Smartphone className="mr-2 h-4 w-4" />
                    Partager
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* QR Codes récents */}
        <div className="space-y-6">
          <Card className="shadow-lg bg-gradient-to-br from-orange-50 to-amber-50 border-orange-200">
            <CardHeader>
              <CardTitle className="text-orange-900">📱 QR Codes Récents</CardTitle>
              <CardDescription className="text-orange-700">Historique de vos codes générés</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[400px] overflow-auto pr-2">
                <div className="space-y-3">
                  {historique.map((qr, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-4 rounded-lg bg-gradient-to-r from-orange-100 to-amber-100 hover:from-orange-200 hover:to-amber-200 transition-all border border-orange-200"
                    >
                      <div className="flex items-center gap-3">
                        <div className="h-12 w-12 bg-gradient-to-br from-orange-400 to-amber-500 rounded-lg flex items-center justify-center text-white shadow-md">
                          <QrCodeIcon className="h-6 w-6" />
                        </div>
                        <div>
                          <p className="font-semibold text-orange-900">{qr.id}</p>
                          <p className="text-xs text-orange-700">{qr.date}</p>
                          <div className="flex items-center gap-2">
                            <p className="text-sm text-orange-800">
                              {qr.kg} kg - {qr.type}
                            </p>
                            <span className="text-xs font-semibold text-white bg-gradient-to-r from-orange-400 to-amber-500 px-2 py-0.5 rounded-full">
                              +{qr.points} pts
                            </span>
                          </div>
                        </div>
                      </div>
                      <Button variant="ghost" size="sm" className="text-orange-700 hover:bg-orange-200">
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-lg bg-gradient-to-br from-cyan-50 to-teal-50 border-cyan-200">
            <CardHeader>
              <CardTitle className="text-cyan-900">ℹ️ À propos des QR Codes</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex gap-3">
                <div className="h-6 w-6 rounded-full bg-gradient-to-br from-cyan-400 to-teal-500 flex items-center justify-center flex-shrink-0 mt-0.5 text-white font-bold shadow-md">
                  ✓
                </div>
                <p className="text-cyan-800">
                  Chaque QR code est unique et traçable en temps réel
                </p>
              </div>
              <div className="flex gap-3">
                <div className="h-6 w-6 rounded-full bg-gradient-to-br from-cyan-400 to-teal-500 flex items-center justify-center flex-shrink-0 mt-0.5 text-white font-bold shadow-md">
                  ✓
                </div>
                <p className="text-cyan-800"> Les codes sont valables pendant 30 minutes après génération
                </p>
              </div>
              <div className="flex gap-3">
                <div className="h-6 w-6 rounded-full bg-gradient-to-br from-cyan-400 to-teal-500 flex items-center justify-center flex-shrink-0 mt-0.5 text-white font-bold shadow-md">
                  ✓
                </div>
                <p className="text-cyan-800">
                  Scannez avec l'application mobile pour valider la collecte
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default QrCode;
