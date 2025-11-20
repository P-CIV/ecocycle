import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface GradientCardProps {
  className?: string;
  children: React.ReactNode;
}

export function GradientCard({ className, children }: GradientCardProps) {
  return (
    <motion.div
      whileHover={{ scale: 1.02, y: -5 }}
      transition={{ duration: 0.2 }}
      className={cn(
        "relative overflow-hidden rounded-2xl",
        "bg-gradient-to-br from-primary/10 via-background to-transparent",
        "border border-primary/20 backdrop-blur-sm shadow-lg",
        className
      )}
    >
      {children}
    </motion.div>
  );
}
