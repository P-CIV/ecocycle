import { Button } from "@/components/ui/button";
import { Link, Navigate } from "react-router-dom";
import { 
  TrendingUp, Award, Users, ArrowRight, Recycle, BarChart3, QrCode, Menu, X
} from "lucide-react";
import { LogoWithText } from "@/components/shared/Logo";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { motion } from "framer-motion";
import { BackgroundGradient } from "@/components/ui/background-gradient";
import { SectionBackgroundWaves, SectionBackgroundBlobs, SectionBackgroundDiagonal } from "@/components/ui/section-backgrounds";

const Index = () => {
  const [api, setApi] = useState<any>();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { currentUser, userRole, loading } = useAuth();

  // Rediriger les utilisateurs connectés vers leur tableau de bord
  if (!loading && currentUser && userRole) {
    
    return <Navigate to={userRole === "admin" ? "/admin" : "/agent"} replace />;
  }
  
  useEffect(() => {
    if (!api) return;

    const interval = setInterval(() => {
      api.scrollNext();
    }, 4000);

    return () => clearInterval(interval);
  }, [api]);

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
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <LogoWithText size="md" />
          <nav className="hidden md:flex gap-6">
            <a href="#features" className="text-foreground/80 hover:text-primary transition-colors">Fonctionnalités</a>
            <a href="#benefits" className="text-foreground/80 hover:text-primary transition-colors">Avantages</a>
            <a href="#contact" className="text-foreground/80 hover:text-primary transition-colors">Contact</a>
          </nav>
          
          {/* Desktop buttons - hidden on mobile */}
          <div className="hidden md:flex gap-3">
            <Link to="/login">
              <Button variant="outline">Connexion</Button>
            </Link>
            <Link to="/signup">
              <Button className="bg-[linear-gradient(135deg,#48972A,#17310E)] hover:opacity-90 transition-opacity text-white">
                Inscription
              </Button>
            </Link>
          </div>

          {/* Button du menu */}
          <button
            className="md:hidden p-2 rounded-lg hover:bg-accent/10 transition-colors"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? (
              <X className="h-6 w-6 text-foreground" />
            ) : (
              <Menu className="h-6 w-6 text-foreground" />
            )}
          </button>
        </div>

        {/* Mobile menu - shown when hamburger is clicked */}
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="md:hidden border-t border-border/40 bg-background/95 backdrop-blur-sm"
          >
            <div className="container mx-auto px-4 py-4 space-y-3">
              <nav className="flex flex-col gap-3 pb-3 border-b border-border/40">
                <a href="#features" className="text-foreground/80 hover:text-primary transition-colors py-2">Fonctionnalités</a>
                <a href="#benefits" className="text-foreground/80 hover:text-primary transition-colors py-2">Avantages</a>
                <a href="#contact" className="text-foreground/80 hover:text-primary transition-colors py-2">Contact</a>
              </nav>
              <div className="flex flex-col gap-2 pt-2">
                <Link to="/login" onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="outline" className="w-full">Connexion</Button>
                </Link>
                <Link to="/signup" onClick={() => setMobileMenuOpen(false)}>
                  <Button className="w-full bg-[linear-gradient(135deg,#48972A,#17310E)] hover:opacity-90 transition-opacity text-white">
                    Inscription
                  </Button>
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </motion.header>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent" />
        <div className="container mx-auto px-4 py-24 md:py-32 relative">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left side - Hero content */}
            <div className="space-y-8 animate-fade-up">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full">
                <Recycle className="h-5 w-5 text-[#48972A] drop-shadow-md" />
                <span className="text-sm font-medium text-[#48972A]">Plateforme de Recyclage Intelligente</span>
              </div>
              <h1 className="text-5xl md:text-7xl font-display font-bold leading-tight">
                Transformez le recyclage en{" "}
                <span className="bg-[linear-gradient(135deg,#48972A,#17310E)] bg-clip-text text-transparent">
                  opportunité
                </span>
              </h1>
              <p className="text-xl text-muted-foreground">
                Gérez vos collectes, suivez vos performances et gagnez des points avec Écocycle, 
                la plateforme tout-en-un pour les agents de recyclage.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <Link to="/signup">
                  <Button size="lg" className="bg-[linear-gradient(135deg,#48972A,#17310E)] hover:opacity-90 transition-opacity text-lg px-8 h-14 shadow-lg text-white">
                    Commencer gratuitement
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
                <Link to="/demo">
                  <Button size="lg" variant="outline" className="text-lg px-8 h-14">
                    Voir la démo
                  </Button>
                </Link>
              </div>
            </div>

            {/* Right side - Image carousel */}
            <div className="relative rounded-2xl overflow-hidden shadow-2xl">
              <Carousel 
                className="w-full" 
                opts={{ loop: true, align: "start" }}
                setApi={setApi}
              >
                <CarouselContent>
                  {[
                    "/hero-1.jpg",
                    "/hero-2.jpg",
                    "/hero-3.jpg",
                    "/hero-4.jpg",
                    "/hero-5.png"
                  ].map((src, index) => (
                    <CarouselItem key={index}>
                      <div className="relative aspect-[4/3] w-full overflow-hidden rounded-xl">
                        <img
                          src={src}
                          alt={`Image de présentation ${index + 1}`}
                          className="object-cover w-full h-full"
                        />
                        <div className="absolute inset-0 bg-[linear-gradient(135deg,#48972A,#17310E)] opacity-20"></div>
                      </div>
                    </CarouselItem>
                  ))}
                </CarouselContent>
                <CarouselPrevious className="left-5" />
                <CarouselNext className="right-5" />
              </Carousel>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 bg-muted/30 relative overflow-hidden">
        <SectionBackgroundWaves />
        <div className="container mx-auto px-4">
          <div className="text-center mb-16 animate-fade-up">
            <h2 className="text-4xl md:text-5xl font-display font-bold mb-4">
              Tout ce dont vous avez besoin
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Une suite complète d'outils pour optimiser votre activité de recyclage
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: BarChart3,
                title: "Tableau de Bord Intelligent",
                description: "Suivez vos performances en temps réel avec des statistiques détaillées et des graphiques interactifs"
              },
              {
                icon: QrCode,
                title: "Codes QR Dynamiques",
                description: "Générez et gérez vos codes QR pour faciliter le suivi et la traçabilité de vos collectes"
              },
              {
                icon: Award,
                title: "Système de Points",
                description: "Gagnez des points à chaque collecte et débloquez des récompenses exclusives"
              },
              {
                icon: TrendingUp,
                title: "Analyse des Tendances",
                description: "Identifiez les opportunités de croissance grâce à l'analyse de vos données historiques"
              },
              {
                icon: Users,
                title: "Gestion d'Équipe",
                description: "Coordonnez votre équipe et suivez les performances collectives depuis le dashboard admin"
              },
              {
                icon: Recycle,
                title: "Suivi des Collectes",
                description: "Enregistrez et gérez toutes vos collectes avec un historique détaillé et accessible"
              }
            ].map((feature, index) => (
              <div
                key={index}
                className="group p-6 bg-card rounded-2xl border border-border/50 hover:border-primary/50 transition-all duration-150 hover:shadow-lg hover:-translate-y-1"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="h-12 w-12 rounded-xl bg-[linear-gradient(135deg,#48972A,#17310E)] shadow-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-150">
                  <feature.icon className="h-7 w-7 text-white drop-shadow-md" />
                </div>
                <h3 className="text-xl font-display font-semibold mb-2">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section id="benefits" className="py-24 relative overflow-hidden">
        <SectionBackgroundBlobs />
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6 animate-fade-up">
              <h2 className="text-4xl md:text-5xl font-display font-bold">
                Pourquoi choisir Écocycle ?
              </h2>
              <div className="space-y-4">
                {[
                  "Interface intuitive et moderne",
                  "Données en temps réel",
                  "Accessible sur tous les appareils",
                  "Support technique réactif",
                  "Mises à jour régulières"
                ].map((benefit, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <div className="h-6 w-6 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <div className="h-3 w-3 rounded-full bg-primary" />
                    </div>
                    <p className="text-lg text-foreground/80">{benefit}</p>
                  </div>
                ))}
              </div>
              <Link to="/signup">
                <Button size="lg" className="bg-gradient-to-r from-primary to-primary-glow hover:opacity-90 transition-opacity mt-4">
                  Démarrer maintenant
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </div>
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-accent/20 rounded-3xl blur-3xl" />
              <div className="relative bg-card/80 backdrop-blur-sm p-8 rounded-3xl border border-border/50 shadow-2xl">
                <div className="space-y-6">
                  <div className="flex items-center justify-between p-4 bg-muted/50 rounded-xl">
                    <div>
                      <p className="text-sm text-muted-foreground">Collecte du jour</p>
                      <p className="text-2xl font-bold text-primary">156 kg</p>
                    </div>
                    <TrendingUp className="h-8 w-8 text-primary" />
                  </div>
                  <div className="flex items-center justify-between p-4 bg-muted/50 rounded-xl">
                    <div>
                      <p className="text-sm text-muted-foreground">Points générés</p>
                      <p className="text-2xl font-bold text-accent">1,245</p>
                    </div>
                    <Award className="h-8 w-8 text-accent" />
                  </div>
                  <div className="flex items-center justify-between p-4 bg-muted/50 rounded-xl">
                    <div>
                      <p className="text-sm text-muted-foreground">Total recyclé</p>
                      <p className="text-2xl font-bold text-primary">4.8 tonnes</p>
                    </div>
                    <Recycle className="h-8 w-8 text-primary" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-[linear-gradient(135deg,#48972A,#17310E)] relative overflow-hidden">
        <SectionBackgroundDiagonal />
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS1vcGFjaXR5PSIwLjEiIHN0cm9rZS13aWR0aD0iMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIvPjwvc3ZnPg==')] opacity-20" />
        <div className="container mx-auto px-4 relative">
          <div className="max-w-3xl mx-auto text-center text-white space-y-6">
            <h2 className="text-4xl md:text-5xl font-display font-bold">
              Prêt à révolutionner votre recyclage ?
            </h2>
            <p className="text-xl text-white/90">
              Rejoignez des centaines d'agents qui optimisent déjà leurs collectes avec Écocycle
            </p>
            <Link to="/signup">
              <Button size="lg" variant="secondary" className="bg-white text-primary hover:bg-white/90 text-lg px-8 h-14 mt-4">
                Créer mon compte gratuit
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer id="contact" className="py-12 border-t border-border/40">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <LogoWithText size="sm" />
            <p className="text-muted-foreground">© 2025 Écocycle • Tous droits réservés</p>
            <div className="flex gap-6">
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors">Conditions</a>
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors">Confidentialité</a>
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors">Contact</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
