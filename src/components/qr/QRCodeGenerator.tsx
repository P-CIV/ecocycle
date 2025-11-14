import { useEffect, useState } from 'react';
import QRCode from 'react-qr-code';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { getRedeemToken } from '@/services/redeemService';
import { cn } from "@/lib/utils";
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RefreshCcw, ShieldAlert } from 'lucide-react';

export function QRCodeGenerator() {
  const [token, setToken] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [expiresAt, setExpiresAt] = useState<Date | null>(null);
  const { user } = useAuth();

  const fetchToken = async () => {
    if (!user?.uid) return;
    
    try {
      setLoading(true);
      setError(null);
      const tokenData = await getRedeemToken(user.uid);
      setToken(tokenData.token);
      setExpiresAt(tokenData.expiresAt);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue');
      setToken(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchToken();
  }, [user]);

  const timeUntilExpiry = expiresAt ? new Date(expiresAt).getTime() - Date.now() : 0;
  const isExpiringSoon = timeUntilExpiry > 0 && timeUntilExpiry < 300000; // 5 minutes

  return (
    <div className="w-full max-w-md mx-auto space-y-8">
      <div className="text-center space-y-4">
        <h2 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-emerald-600 via-green-500 to-teal-500 bg-clip-text text-transparent">
          Générateur de QR Code
        </h2>
        <p className="text-muted-foreground text-lg">
          Générez votre QR code unique pour les collectes
        </p>
      </div>

      <Card className="p-8 bg-gradient-to-b from-card/80 to-card/50 backdrop-blur-md border-border/50 shadow-xl hover:shadow-2xl transition-shadow duration-300">
        <div className="space-y-6">
          <div className="flex justify-between items-center border-b border-border/50 pb-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                <div className="h-6 w-6 text-emerald-500" />
              </div>
              <h3 className="text-xl font-semibold bg-gradient-to-r from-emerald-500 to-teal-500 bg-clip-text text-transparent">
                QR Code de collecte
              </h3>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={fetchToken}
              disabled={loading}
              className="h-10 w-10 rounded-xl hover:bg-emerald-500/10 hover:text-emerald-500 transition-colors"
            >
              <RefreshCcw className={cn(
                "h-5 w-5",
                loading && "animate-spin"
              )} />
            </Button>
          </div>

          <AnimatePresence mode="wait">
            {error ? (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="p-4 bg-destructive/10 text-destructive rounded-lg flex items-center gap-2"
              >
                <ShieldAlert className="h-4 w-4" />
                <p className="text-sm">{error}</p>
              </motion.div>
            ) : token ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="flex flex-col items-center space-y-4"
              >
                <div className="relative group">
                  <div className="absolute -inset-4 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-2xl opacity-20 group-hover:opacity-30 blur transition-opacity duration-300" />
                  <div className="relative p-6 bg-white rounded-xl shadow-lg transform transition-transform duration-300 hover:scale-105">
                    <QRCode
                      value={token}
                      size={200}
                      style={{ height: "auto", maxWidth: "100%", width: "100%" }}
                      viewBox={`0 0 256 256`}
                    />
                  </div>
                  <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-1/2 h-4 bg-gradient-to-r from-emerald-500/20 to-teal-500/20 blur-xl" />
                </div>
                
                {expiresAt && (
                  <div className={cn(
                    "text-sm font-medium text-center p-3 rounded-xl w-full backdrop-blur-sm shadow-lg",
                    isExpiringSoon 
                      ? "bg-warning/10 text-warning border border-warning/20" 
                      : "bg-emerald-500/5 text-emerald-600 border border-emerald-500/20"
                  )}>
                    <div className="flex items-center justify-center gap-2">
                      <div className={cn(
                        "w-2 h-2 rounded-full animate-pulse",
                        isExpiringSoon ? "bg-warning" : "bg-emerald-500"
                      )} />
                      <span>
                        Expire le : {new Date(expiresAt).toLocaleString('fr-FR', {
                          hour: '2-digit',
                          minute: '2-digit',
                          day: '2-digit',
                          month: 'long'
                        })}
                      </span>
                    </div>
                  </div>
                )}
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex justify-center py-12"
              >
                <div className="animate-pulse flex space-x-4">
                  <div className="h-12 w-12 bg-primary/20 rounded-full" />
                  <div className="space-y-3">
                    <div className="h-4 w-24 bg-primary/20 rounded" />
                    <div className="h-4 w-32 bg-primary/10 rounded" />
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {token && (
            <div className="mt-6 p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900">
              <p className="text-sm text-emerald-700 dark:text-emerald-300 text-center font-medium">
                Présentez ce QR code au point de collecte pour valider votre dépôt
              </p>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}