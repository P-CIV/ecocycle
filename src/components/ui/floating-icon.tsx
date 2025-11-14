import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface FloatingIconProps {
  icon: React.ComponentType<{ className?: string }>;
  className?: string;
  delay?: number;
}

export function FloatingIcon({ icon: Icon, className, delay = 0 }: FloatingIconProps) {
  return (
    <motion.div
      initial={{ y: 0 }}
      animate={{ y: [-10, 10, -10] }}
      transition={{
        duration: 4,
        repeat: Infinity,
        delay: delay,
        ease: "easeInOut"
      }}
      className={cn("fixed max-w-screen z-0 pointer-events-none", className)}
    >
      <Icon className="w-8 h-8 text-primary/40 animate-pulse" />
    </motion.div>
  );
}