import { motion } from "framer-motion";

const logos = [
  // Remplacez par vos propres logos
  "/logos/logo1.png",
  "/logos/logo2.png",
  "/logos/logo3.png",
  "/logos/logo4.png",
  "/logos/logo5.png",
  "/logos/logo6.png",
];

export function InfiniteMarquee() {
  return (
    <div className="relative flex overflow-hidden bg-muted/30 py-12">
      <div className="flex animate-marquee whitespace-nowrap">
        {logos.concat(logos).map((logo, index) => (
          <div
            key={index}
            className="mx-16 flex items-center justify-center"
          >
            <motion.div
              whileHover={{ scale: 1.1 }}
              transition={{ duration: 0.2 }}
            >
              <img
                src={logo}
                alt={`Logo partenaire ${index + 1}`}
                className="h-12 w-auto opacity-50 grayscale transition-all duration-300 hover:opacity-100 hover:grayscale-0"
              />
            </motion.div>
          </div>
        ))}
      </div>

      <div className="absolute top-0 flex animate-marquee2 whitespace-nowrap">
        {logos.concat(logos).map((logo, index) => (
          <div
            key={index}
            className="mx-16 flex items-center justify-center"
          >
            <motion.div
              whileHover={{ scale: 1.1 }}
              transition={{ duration: 0.2 }}
            >
              <img
                src={logo}
                alt={`Logo partenaire ${index + 1}`}
                className="h-12 w-auto opacity-50 grayscale transition-all duration-300 hover:opacity-100 hover:grayscale-0"
              />
            </motion.div>
          </div>
        ))}
      </div>
    </div>
  );
}
