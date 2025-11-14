import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Link, useNavigate } from "react-router-dom";
import { Mail, Lock, User, Phone, ArrowRight, MapPin } from "lucide-react";
import { LogoWithText } from "@/components/shared/Logo";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ZONES } from "@/config/zones";

const Signup = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    zone: "",
    role: "agent" // Par défaut, le rôle est "agent"
  });
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const { signup } = useAuth();
  const navigate = useNavigate();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation instantanée côté client
    const validations = {
      password: formData.password === formData.confirmPassword,
      fields: Boolean(formData.email && formData.password && formData.name && formData.phone && formData.zone),
      email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email),
      phone: /^\+225[0-9]{10}$/.test(formData.phone),
      password_strength: formData.password.length >= 6,
      zone: formData.zone !== ""
    };

    if (!validations.password) {
      toast({ title: "Erreur", description: "Les mots de passe ne correspondent pas", variant: "destructive" });
      return;
    }
    if (!validations.fields) {
      toast({ title: "Erreur", description: "Veuillez remplir tous les champs", variant: "destructive" });
      return;
    }
    if (!validations.email) {
      toast({ title: "Erreur", description: "Format d'email invalide", variant: "destructive" });
      return;
    }
    if (!validations.phone) {
      toast({ title: "Erreur", description: "Le numéro doit commencer par +225 suivi de 10 chiffres", variant: "destructive" });
      return;
    }
    if (!validations.password_strength) {
      toast({ title: "Erreur", description: "Le mot de passe doit contenir au moins 6 caractères", variant: "destructive" });
      return;
    }

    setLoading(true);
    toast({ title: "Création du compte...", description: "Veuillez patienter" });

    try {
      // Désactiver le bouton et afficher le chargement
      setLoading(true);
      
            // Tentative d'inscription avec le nom complet
            await signup(formData.email, formData.password, formData.name, "agent", formData.zone, formData.phone);      // Si l'inscription réussit, afficher un message de succès et rediriger
      toast({
        description: "Compte créé avec succès !",
      });
      
      // Attendre un court instant pour que l'utilisateur voie le message
      setTimeout(() => {
        navigate("/agent");
      }, 500);
      
    } catch (error: any) {
      console.error("Erreur détaillée:", error);
      
      // Afficher le message d'erreur
      toast({
        description: error.message || "Erreur lors de la création du compte",
        variant: "destructive",
      });
      
      const message = error instanceof Error ? error.message : "Une erreur est survenue lors de la création du compte";
      toast({
        description: message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div 
      className="auth-background"
      style={{
        backgroundImage: `linear-gradient(135deg, rgba(26, 26, 26, 0.5) 0%, rgba(13, 13, 13, 0.5) 100%), url('/assets/images/auth-bg.jpg')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed',
        backgroundRepeat: 'no-repeat',
      }}
    >
      <div className="auth-container">
        <div className="w-full max-w-md auth-animation">
          <div className="text-center mb-8">
            <Link to="/" className="inline-block mb-4">
              <LogoWithText size="lg" className="text-white" />
            </Link>
            <h1 className="text-3xl font-display font-bold mt-2 text-white">Créez votre compte</h1>
            <p className="text-white/80">Rejoignez la communauté Écocycle</p>
          </div>

        <Card className="border-border/50 shadow-xl">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl">Inscription</CardTitle>
            <CardDescription>
              Remplissez le formulaire pour créer votre compte agent
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSignup} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nom complet</Label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                  <Input
                    id="name"
                    name="name"
                    type="text"
                    placeholder="nom prenom"
                    value={formData.name}
                    onChange={handleChange}
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="votre@email.com"
                    value={formData.email}
                    onChange={handleChange}
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Téléphone</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                  <Input
                    id="phone"
                    name="phone"
                    type="tel"
                    placeholder="+225 XX XX XX XX XX"
                    value={formData.phone}
                    onChange={handleChange}
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Mot de passe</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={handleChange}
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirmer le mot de passe</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    placeholder="••••••••"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="zone">Zone de collecte</Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                  <Select
                    value={formData.zone}
                    onValueChange={(value) => setFormData({ ...formData, zone: value })}
                    required
                  >
                    <SelectTrigger className="w-full pl-10">
                      <SelectValue placeholder="Sélectionnez votre zone de collecte" />
                    </SelectTrigger>
                    <SelectContent>
                      {ZONES.map((zone) => (
                        <SelectItem key={zone} value={zone}>
                          {zone}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-primary to-primary-glow hover:opacity-90 transition-opacity"
                size="lg"
                disabled={loading}
              >
                {loading ? "Création du compte..." : "Créer mon compte"}
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </form>

            <div className="mt-6 text-center text-sm">
              <span className="text-white/70">Vous avez déjà un compte ? </span>
              <Link to="/login" className="text-white hover:underline font-medium">
                Se connecter
              </Link>
            </div>
          </CardContent>
        </Card>

        <p className="text-center text-sm text-white/70 mt-6">
          En créant un compte, vous acceptez nos{" "}
          <a href="#" className="text-white hover:underline">
            Conditions d'utilisation
          </a>{" "}
          et notre{" "}
          <a href="#" className="text-white hover:underline">
            Politique de confidentialité
          </a>
        </p>
        </div>
      </div>
    </div>
  );
};

export default Signup;