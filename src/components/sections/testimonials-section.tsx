import { motion } from "framer-motion";
import { TestimonialCard } from "@/components/ui/testimonial-card";

      {/* Section Témoignages */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent" />
        <div className="container mx-auto px-4 relative">
          <motion.div 
            className="text-center max-w-3xl mx-auto mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-5xl font-display font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-primary via-primary-glow to-primary">
              Ce que disent nos agents
            </h2>
            <p className="text-xl text-muted-foreground">
              Découvrez les expériences de ceux qui utilisent Écocycle au quotidien
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <TestimonialCard
              avatar="/avatars/agent1.jpg"
              name="Sophie Martin"
              role="Agent de recyclage"
              content="Écocycle a complètement transformé ma façon de travailler. Le suivi en temps réel et les statistiques m'aident à être plus efficace."
              delay={0.1}
            />
            <TestimonialCard
              avatar="/avatars/agent2.jpg"
              name="Thomas Dubois"
              role="Chef d'équipe"
              content="La gestion d'équipe est devenue tellement plus simple. Les rapports automatiques et le système de points motivent vraiment l'équipe."
              delay={0.2}
            />
            <TestimonialCard
              avatar="/avatars/agent3.jpg"
              name="Marie Leclerc"
              role="Agent senior"
              content="Je ne pourrais plus me passer d'Écocycle. L'application est intuitive et le support est toujours là quand on en a besoin."
              delay={0.3}
            />
          </div>

          {/* Statistiques flottantes */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              viewport={{ once: true }}
              className="text-center"
            >
              <motion.p 
                className="text-4xl font-bold text-primary mb-2"
                initial={{ scale: 0.5 }}
                whileInView={{ scale: 1 }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                25k+
              </motion.p>
              <p className="text-muted-foreground">Tonnes recyclées</p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: true }}
              className="text-center"
            >
              <motion.p 
                className="text-4xl font-bold text-primary mb-2"
                initial={{ scale: 0.5 }}
                whileInView={{ scale: 1 }}
                transition={{ duration: 0.6, delay: 0.3 }}
              >
                1500+
              </motion.p>
              <p className="text-muted-foreground">Agents actifs</p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              viewport={{ once: true }}
              className="text-center"
            >
              <motion.p 
                className="text-4xl font-bold text-primary mb-2"
                initial={{ scale: 0.5 }}
                whileInView={{ scale: 1 }}
                transition={{ duration: 0.6, delay: 0.4 }}
              >
                98%
              </motion.p>
              <p className="text-muted-foreground">Satisfaction</p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              viewport={{ once: true }}
              className="text-center"
            >
              <motion.p 
                className="text-4xl font-bold text-primary mb-2"
                initial={{ scale: 0.5 }}
                whileInView={{ scale: 1 }}
                transition={{ duration: 0.6, delay: 0.5 }}
              >
                12M€
              </motion.p>
              <p className="text-muted-foreground">Valeur générée</p>
            </motion.div>
          </div>
        </div>
      </section>