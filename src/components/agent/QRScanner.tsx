import { motion } from 'framer-motion';
import { QrCode as QrCodeIcon } from 'lucide-react';

interface QRScannerProps {
  isScanning: boolean;
  onScan: () => void;
}

export const QRScanner = ({ isScanning, onScan }: QRScannerProps) => {
  return (
    <motion.div 
      className="qr-scanner-container"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="relative bg-black/5 backdrop-blur-lg rounded-xl p-8">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-secondary/10 rounded-xl" />
        
        <div className="relative z-10">
          <div className="flex items-center justify-center mb-6">
            <div className="bg-primary/20 p-3 rounded-full">
              <QrCodeIcon className="w-8 h-8 text-primary" />
            </div>
          </div>

          <div className="text-center mb-6">
            <h3 className="text-lg font-semibold mb-2">Scanner QR Code</h3>
            <p className="text-sm text-muted-foreground">
              Placez le QR code dans la zone de scan
            </p>
          </div>

          <div className="scan-frame relative w-64 h-64 mx-auto mb-6 rounded-lg overflow-hidden">
            <div className="absolute inset-0 border-2 border-dashed border-primary/50 rounded-lg" />
            
            {isScanning && (
              <motion.div
                className="absolute top-0 left-0 w-full h-1 bg-primary"
                animate={{
                  y: ['0%', '100%', '0%'],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: 'linear',
                }}
              />
            )}

            <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-primary" />
            <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-primary" />
            <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-primary" />
            <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-primary" />
          </div>

          <button
            onClick={onScan}
            className="w-full py-3 px-4 bg-primary text-white rounded-lg font-medium hover:bg-primary/90 transition-colors"
          >
            {isScanning ? 'Scanning...' : 'Start Scan'}
          </button>
        </div>
      </div>
    </motion.div>
  );
};
