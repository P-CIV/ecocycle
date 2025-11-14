import { LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface StatCardProps {
  title: string;
  value: string;
  icon: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  description?: string;
  loading?: boolean;
  className?: string;
}

export function StatCard({ title, value, icon: Icon, trend, description, loading, className }: StatCardProps) {
  // Déterminer si c'est un gradient
  const isGradient = className?.includes("gradient") || className?.includes("from-");
  
  // Déterminer la couleur du texte basée sur le gradient
  const textColor = isGradient ? "text-white" : "text-primary";
  const descriptionColor = isGradient ? "text-white/80" : "text-muted-foreground";
  const titleColor = isGradient ? "text-white/90" : "text-muted-foreground";
  const iconBg = isGradient ? "bg-white/20" : "bg-primary/10";
  const iconColor = isGradient ? "text-white" : "text-primary";

  return (
    <Card className={cn("shadow-card overflow-hidden", className)}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between space-x-4">
          <div className="flex items-center space-x-4">
            <div className={cn("p-2 rounded-full", iconBg)}>
              <Icon className={cn("w-6 h-6", iconColor)} />
            </div>
            <div>
              <p className={cn("text-sm font-medium", titleColor)}>{title}</p>
              {loading ? (
                <div className="h-8 w-24 bg-muted animate-pulse rounded-md" />
              ) : (
                <h3 className={cn("text-2xl font-bold tracking-tight", textColor)}>{value}</h3>
              )}
              {description && (
                <p className={cn("text-xs mt-1", descriptionColor)}>{description}</p>
              )}
            </div>
          </div>
          {trend && !loading && (
            <div className={`flex items-center ${trend.isPositive ? "text-green-300" : "text-red-300"}`}>
              <span className="text-sm font-medium">
                {trend.isPositive ? "+" : "-"}
                {trend.value}%
              </span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}