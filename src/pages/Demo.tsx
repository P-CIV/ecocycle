import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ArrowLeft, Play, Recycle, BarChart3, Award } from "lucide-react";
import { motion } from "framer-motion";
import { BackgroundGradient } from "@/components/ui/background-gradient";

const Demo = () => {
  return (
    <div className="min-h-screen bg-background relative">
      <BackgroundGradient />

      {/* Header */}
      <motion.header 
        className="border-b border-border/40 backdrop-blur-sm bg-background/80 sticky top-0 z-50"
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="container mx-auto px-4 py-4 flex justify-center items-center relative">
          <Link to="/" className="absolute left-4 flex items-center gap-2 text-foreground hover:text-primary transition-colors">
            <ArrowLeft className="h-5 w-5" />
            <span className="font-semibold">Retour</span>
          </Link>
          <h1 className="text-2xl font-display font-bold">Démo Écocycle</h1>
        </div>
      </motion.header>

      {/* Hero Demo Section */}
      <section className="py-12 md:py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent" />
        <div className="container mx-auto px-4 relative">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-5xl mx-auto"
          >
            <div className="text-center mb-12">
              <h2 className="text-4xl md:text-5xl font-display font-bold mb-4">
                Voir Écocycle en Action
              </h2>
              <p className="text-xl text-muted-foreground mb-8">
                Découvrez comment optimiser votre activité de recyclage avec notre plateforme complète
              </p>
            </div>

            {/* Video Container - Full Width */}
            <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-border/50 bg-card/80 backdrop-blur-sm mb-16">
              <div className="aspect-video w-full bg-black rounded-xl overflow-hidden">
                <iframe
                  width="100%"
                  height="100%"
                  src="https://www.youtube.com/embed/-I7NbDMXgg4?rel=0&modestbranding=1&autoplay=0"
                  title="Démo Écocycle - Plateforme de Recyclage Intelligente"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="w-full h-full"
                />
              </div>

              {/* Gradient overlay */}
              <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-black/50 to-transparent pointer-events-none rounded-b-2xl" />
            </div>

            {/* Features Grid Below Video */}
            <div className="grid md:grid-cols-3 gap-6 mb-16">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                viewport={{ once: true }}
                className="p-6 bg-card rounded-2xl border border-border/50 hover:border-primary/50 transition-all"
              >
                <div className="h-12 w-12 rounded-xl bg-[linear-gradient(135deg,#48972A,#17310E)] shadow-lg flex items-center justify-center mb-4">
                  <Recycle className="h-7 w-7 text-white" />
                </div>
                <h3 className="text-xl font-display font-semibold mb-2">Collectes Simplifiées</h3>
                <p className="text-muted-foreground">
                  Enregistrez vos collectes en quelques clics avec codes QR dynamiques et suivi automatique
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                viewport={{ once: true }}
                className="p-6 bg-card rounded-2xl border border-border/50 hover:border-primary/50 transition-all"
              >
                <div className="h-12 w-12 rounded-xl bg-[linear-gradient(135deg,#48972A,#17310E)] shadow-lg flex items-center justify-center mb-4">
                  <BarChart3 className="h-7 w-7 text-white" />
                </div>
                <h3 className="text-xl font-display font-semibold mb-2">Suivi en Temps Réel</h3>
                <p className="text-muted-foreground">
                  Visualisez vos performances avec un dashboard intuitif et des graphiques détaillés
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                viewport={{ once: true }}
                className="p-6 bg-card rounded-2xl border border-border/50 hover:border-primary/50 transition-all"
              >
                <div className="h-12 w-12 rounded-xl bg-[linear-gradient(135deg,#48972A,#17310E)] shadow-lg flex items-center justify-center mb-4">
                  <Award className="h-7 w-7 text-white" />
                </div>
                <h3 className="text-xl font-display font-semibold mb-2">Gagnez des Points</h3>
                <p className="text-muted-foreground">
                  Débloquez des récompenses exclusives à chaque collecte et augmentez votre revenu
                </p>
              </motion.div>
            </div>

            {/* CTA Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              viewport={{ once: true }}
              className="bg-[linear-gradient(135deg,#48972A,#17310E)] rounded-2xl p-8 md:p-12 text-center text-white relative overflow-hidden"
            >
              <div className="absolute inset-0 opacity-10">
                <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS1vcGFjaXR5PSIwLjEiIHN0cm9rZS13aWR0aD0iMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIvPjwvc3ZnPg==')] opacity-20" />
              </div>
              <div className="relative z-10 space-y-4">
                <h3 className="text-3xl md:text-4xl font-display font-bold">
                  Prêt à commencer ?
                </h3>
                <p className="text-lg text-white/90 max-w-2xl mx-auto">
                  Rejoignez des centaines d'agents qui optimisent déjà leurs collectes avec Écocycle
                </p>
                <Link to="/signup">
                  <Button size="lg" variant="secondary" className="bg-white text-primary hover:bg-white/90 text-lg px-8 h-14 mt-6">
                    Créer mon compte gratuit
                    <Play className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-border/40 mt-24">
        <div className="container mx-auto px-4">
          <div className="flex flex-col items-center justify-center gap-4 text-center">
            <p className="text-muted-foreground">© 2025 Écocycle • Tous droits réservés</p>
            <div className="flex gap-6">
              <Link to="/" className="text-muted-foreground hover:text-primary transition-colors">Accueil</Link>
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors">Conditions</a>
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors">Confidentialité</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Demo;
