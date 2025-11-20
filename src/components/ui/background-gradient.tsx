import { motion } from "framer-motion";

export function BackgroundGradient() {
  return (
    <div className="fixed inset-0 -z-10 h-screen w-full bg-white dark:bg-gray-900 overflow-hidden">
      <div className="absolute inset-0">
        {/* Cercle principal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 0.15, scale: 1 }}
          transition={{ duration: 2, repeat: Infinity, repeatType: "reverse" }}
          className="absolute -top-1/4 left-0 h-full w-1/2 rounded-full bg-gradient-to-br from-primary to-primary-glow blur-3xl"
        />
        {/* Cercle secondaire */}
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 0.15, scale: 1 }}
          transition={{ duration: 2.5, repeat: Infinity, repeatType: "reverse", delay: 0.5 }}
          className="absolute -bottom-1/4 right-0 h-full w-1/2 rounded-full bg-gradient-to-br from-accent to-accent/50 blur-3xl"
        />
      </div>
      {/* Pattern de points */}
      <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]" />
    </div>
  );
}
