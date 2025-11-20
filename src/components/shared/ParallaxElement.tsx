import { motion, useScroll, useTransform } from "framer-motion";
import { ReactNode } from "react";

interface ParallaxElementProps {
  children: ReactNode;
  offset?: number;
  className?: string;
}

export const ParallaxElement = ({ children, offset = 50, className = "" }: ParallaxElementProps) => {
  const { scrollYProgress } = useScroll();
  const y = useTransform(scrollYProgress, [0, 1], [0, offset]);

  return (
    <motion.div style={{ y }} className={className}>
      {children}
    </motion.div>
  );
};
