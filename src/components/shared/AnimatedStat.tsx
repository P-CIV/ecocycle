import { motion, useSpring, useTransform, useScroll } from "framer-motion";
import { useEffect, useState } from "react";

interface AnimatedStatProps {
  value: number;
  suffix?: string;
  prefix?: string;
  label: string;
}

export const AnimatedStat = ({ value, suffix = "", prefix = "", label }: AnimatedStatProps) => {
  const [counted, setCounted] = useState(false);
  const { scrollYProgress } = useScroll();

  const springConfig = { stiffness: 100, damping: 30, restDelta: 0.001 };
  const spring = useSpring(0, springConfig);

  useEffect(() => {
    if (counted) return;
    const unsubscribe = scrollYProgress.on("change", (latest) => {
      if (latest > 0.5) {
        spring.set(value);
        setCounted(true);
      }
    });
    return () => unsubscribe();
  }, [spring, value, scrollYProgress, counted]);

  const displayValue = useTransform(spring, (latest) => 
    Math.floor(latest).toLocaleString()
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="text-center"
    >
      <motion.p className="text-4xl font-bold mb-2">
        {prefix}
        <motion.span>{displayValue}</motion.span>
        {suffix}
      </motion.p>
      <p className="text-muted-foreground">{label}</p>
    </motion.div>
  );
};