import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Button } from "./button";
import { ArrowRight } from "lucide-react";

interface CallToActionProps {
  title: string;
  description: string;
  buttonText: string;
  onClick?: () => void;
  className?: string;
}

export function CallToAction({ title, description, buttonText, onClick, className }: CallToActionProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className={cn(
        "p-8 rounded-3xl",
        "bg-gradient-to-br from-primary to-primary-glow",
        "relative overflow-hidden",
        className
      )}
    >
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS1vcGFjaXR5PSIwLjEiIHN0cm9rZS13aWR0aD0iMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIvPjwvc3ZnPg==')] opacity-20" />
      <div className="relative z-10 text-center space-y-4">
        <h2 className="text-3xl font-bold text-white">{title}</h2>
        <p className="text-white/90">{description}</p>
        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          <Button
            onClick={onClick}
            size="lg"
            variant="secondary"
            className="bg-white text-primary hover:bg-white/90"
          >
            {buttonText}
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </motion.div>
      </div>
    </motion.div>
  );
}
