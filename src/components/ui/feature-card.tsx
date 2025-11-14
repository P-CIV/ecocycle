import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface FeatureCardProps {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  className?: string;
}

export function FeatureCard({ icon: Icon, title, description, className }: FeatureCardProps) {
  return (
    <motion.div
      whileHover={{ y: -5 }}
      transition={{ duration: 0.2 }}
      className={cn(
        "p-6 rounded-2xl bg-card/50 backdrop-blur-sm",
        "border border-border/50 hover:border-primary/50",
        "transition-colors duration-300 shadow-sm hover:shadow-lg",
        className
      )}
    >
      <motion.div
        whileHover={{ scale: 1.1 }}
        className="h-12 w-12 rounded-xl bg-gradient-to-br from-primary to-primary-glow flex items-center justify-center mb-4"
      >
        <Icon className="h-6 w-6 text-white" />
      </motion.div>
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p className="text-muted-foreground">{description}</p>
    </motion.div>
  );
}