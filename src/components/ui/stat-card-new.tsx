import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface StatCardNewProps {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string | number;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  className?: string;
}

export function StatCardNew({ icon: Icon, label, value, trend, className }: StatCardNewProps) {
  return (
    <motion.div
      whileHover={{ y: -5 }}
      className={cn(
        "p-6 rounded-2xl",
        "bg-gradient-to-br from-white/50 to-white/30 backdrop-blur-sm",
        "border border-white/20 shadow-lg",
        "transition-colors duration-300",
        className
      )}
    >
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <p className="text-sm font-medium text-muted-foreground">{label}</p>
          <p className="text-2xl font-bold">{value}</p>
        </div>
        <div className="relative">
          <motion.div
            whileHover={{ scale: 1.1 }}
            className="h-12 w-12 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center"
          >
            <Icon className="h-6 w-6 text-primary" />
          </motion.div>
          {trend && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={cn(
                "absolute -bottom-4 right-0 px-2 py-1 rounded-full text-xs font-medium",
                trend.isPositive ? "bg-green-500/10 text-green-500" : "bg-red-500/10 text-red-500"
              )}
            >
              {trend.isPositive ? "+" : "-"}
              {Math.abs(trend.value)}%
            </motion.div>
          )}
        </div>
      </div>
    </motion.div>
  );
}