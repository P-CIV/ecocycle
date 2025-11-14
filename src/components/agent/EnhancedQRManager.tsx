import { QrCode, Scan, History, Trash2 } from "lucide-react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { cleanOldQRCodes } from "@/services/qrService";
import { useToast } from "@/components/ui/use-toast";

interface EnhancedQRManagerProps {
  recentScans?: {
    id: string;
    timestamp: Date;
    points: number;
    type: string;
  }[];
}

export const EnhancedQRManager = ({ recentScans = [] }: EnhancedQRManagerProps) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();

  const handleScanClick = () => {
    navigate('/agent/qr-code');
  };

  const handleCleanQRCodes = async () => {
    if (!user?.uid) return;
    
    try {
      await cleanOldQRCodes(user.uid);
      toast({
        title: "Nettoyage réussi",
        description: "Tous les QR codes ont été supprimés",
        variant: "default",
      });
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de nettoyer les QR codes",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="qr-manager-container">
      {/* Section principale du scanner */}
      <motion.div 
        className="grid md:grid-cols-2 gap-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Zone de scan */}
        <motion.div 
          className="scan-zone-card overflow-hidden relative p-8 rounded-xl bg-gradient-to-br from-primary to-primary/80 text-white shadow-2xl"
          whileHover={{ scale: 1.01 }}
          transition={{ duration: 0.2 }}
        >
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl transform translate-x-20 -translate-y-20"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-black/10 rounded-full blur-3xl transform -translate-x-20 translate-y-20"></div>
          
          <div className="relative space-y-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-white/10 rounded-xl backdrop-blur-sm">
                <QrCode className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="text-2xl font-bold">Scanner un QR Code</h3>
                <p className="text-white/80">Accédez rapidement au scanner</p>
              </div>
            </div>

            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-t from-primary via-transparent to-transparent opacity-20"></div>
              <motion.button 
                onClick={handleScanClick}
                className="w-full p-4 bg-white/10 hover:bg-white/20 rounded-xl backdrop-blur-sm flex items-center justify-between group"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white/10 rounded-lg">
                    <Scan className="h-5 w-5 text-white transition-transform group-hover:scale-110" />
                  </div>
                  <span className="font-medium text-lg">Aller au scanner</span>
                </div>
                <div className="flex items-center gap-2 text-sm bg-white/10 px-3 py-1.5 rounded-full">
                  <span>Accéder maintenant</span>
                  <motion.span
                    className="text-lg"
                    animate={{ x: [0, 4, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  >
                    →
                  </motion.span>
                </div>
              </motion.button>
            </div>

            <div className="grid grid-cols-3 gap-4">
              {[
                { icon: "🎯", text: "Précision" },
                { icon: "⚡", text: "Rapide" },
                { icon: "✨", text: "Simple" }
              ].map((item, index) => (
                <div key={index} className="bg-white/10 p-2 rounded-lg text-center backdrop-blur-sm">
                  <div className="text-xl mb-1">{item.icon}</div>
                  <div className="text-xs font-medium">{item.text}</div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Historique récent */}
        <div className="recent-scans-card p-6 rounded-xl bg-gradient-to-br from-purple-600 to-pink-600 text-white">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold">Scans Récents</h3>
            <div className="flex items-center gap-2">
              <button
                onClick={handleCleanQRCodes}
                className="p-2 hover:bg-white/10 rounded-full transition-colors"
                title="Nettoyer l'historique"
              >
                <Trash2 className="h-5 w-5 text-purple-200" />
              </button>
              <History className="h-6 w-6 text-purple-200" />
            </div>
          </div>

          <div className="space-y-3 max-h-[400px] overflow-y-auto custom-scrollbar">
            {recentScans.map((scan) => (
              <div 
                key={scan.id}
                className="bg-white/10 p-3 rounded-lg hover:bg-white/20 transition-all duration-300"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">{scan.type}</div>
                    <div className="text-sm text-purple-200">
                      {new Date(scan.timestamp).toLocaleString()}
                    </div>
                  </div>
                  <div className="text-lg font-bold text-yellow-300">
                    +{scan.points} pts
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  );
};