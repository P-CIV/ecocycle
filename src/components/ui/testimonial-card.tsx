import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface TestimonialCardProps {
  avatar: string;
  name: string;
  role: string;
  content: string;
  className?: string;
  delay?: number;
}

export function TestimonialCard({ avatar, name, role, content, className, delay = 0 }: TestimonialCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay }}
      viewport={{ once: true }}
      className={cn(
        "group p-6 rounded-2xl bg-white/50 backdrop-blur-sm",
        "border border-border/50 hover:border-primary/50",
        "transition-all duration-300 hover:shadow-lg hover:-translate-y-1",
        className
      )}
    >
      <div className="flex items-center gap-4 mb-4">
        <img
          src={avatar}
          alt={name}
          className="w-12 h-12 rounded-full object-cover border-2 border-primary/20"
        />
        <div>
          <h4 className="font-semibold text-foreground">{name}</h4>
          <p className="text-sm text-muted-foreground">{role}</p>
        </div>
      </div>
      <p className="text-muted-foreground leading-relaxed">{content}</p>
    </motion.div>
  );
}
