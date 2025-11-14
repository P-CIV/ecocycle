import { motion } from "framer-motion";

// Trois variantes d'arrière-plan modernes et légères
export function SectionBackgroundWaves() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
      <svg className="absolute left-0 top-0 w-[120%] h-full opacity-30" viewBox="0 0 1200 600" preserveAspectRatio="none">
        <defs>
          <linearGradient id="g1" x1="0" x2="1">
            <stop offset="0%" stopColor="#48972A" stopOpacity="0.12" />
            <stop offset="100%" stopColor="#17310E" stopOpacity="0.06" />
          </linearGradient>
        </defs>
        <motion.path
          d="M0,200 C150,300 350,100 600,160 C850,220 1050,80 1200,140 L1200,600 L0,600 Z"
          fill="url(#g1)"
          initial={{ translateY: 0 }}
          animate={{ translateY: [0, -8, 0] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        />
      </svg>
    </div>
  );
}

export function SectionBackgroundBlobs() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
      <motion.div
        className="absolute -top-20 -left-20 w-72 h-72 rounded-full bg-gradient-to-br from-primary to-accent opacity-20 blur-3xl"
        initial={{ scale: 0.9 }}
        animate={{ scale: [0.9, 1.05, 0.9] }}
        transition={{ duration: 8, repeat: Infinity }}
      />
      <motion.div
        className="absolute -bottom-24 -right-10 w-96 h-96 rounded-full bg-gradient-to-br from-accent/80 to-primary/60 opacity-18 blur-4xl"
        initial={{ scale: 1.05 }}
        animate={{ scale: [1.05, 0.95, 1.05] }}
        transition={{ duration: 10, repeat: Infinity }}
      />
    </div>
  );
}

export function SectionBackgroundDiagonal() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/6 via-accent/4 to-transparent" />
      <svg className="absolute right-0 top-0 w-64 h-64 opacity-10 transform rotate-12" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="100" height="100" fill="url(#dg)" />
        <defs>
          <linearGradient id="dg" x1="0" x2="1">
            <stop offset="0%" stopColor="#48972A" stopOpacity="0.25" />
            <stop offset="100%" stopColor="#17310E" stopOpacity="0.05" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
}
