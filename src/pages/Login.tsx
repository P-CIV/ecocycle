import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Link, useNavigate } from "react-router-dom";
import { Mail, Lock, ArrowRight } from "lucide-react";
import { LogoWithText } from "@/components/shared/Logo";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { DebugUser } from "@/components/DebugUser";
import "@/styles/auth.css";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [hasError, setHasError] = useState(false);
  const { toast } = useToast();
  const { login, userRole } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    // Validation rapide côté client
    if (!email || !password) {
      toast({
        title: "Erreur",
        description: "Veuillez remplir tous les champs",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    setHasError(false);

    try {
      const user = await login(email, password);
      if (user) {
        // Redirection immédiate vers le bon dashboard selon le rôle
        const redirectPath = userRole === "admin" ? "/admin" : "/agent";
        navigate(redirectPath);
      }
    } catch (error: any) {
      console.error("Erreur de connexion:", error);
      let errorMessage = "";
      
      if (error.message.includes('network')) {
        errorMessage = "Vérifiez votre connexion Internet";
      } else if (error.code === 'auth/wrong-password' || error.code === 'auth/user-not-found') {
        errorMessage = "Email ou mot de passe incorrect";
      } else if (error.code === 'auth/too-many-requests') {
        errorMessage = "Trop de tentatives. Réessayez plus tard";
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = "Email invalide";
      } else {
        errorMessage = "Erreur de connexion";
      }
      
      if (errorMessage) {
        toast({
          description: errorMessage,
          variant: "destructive",
        });
      }
      
      // Garder le bouton désactivé après une erreur jusqu'à modification des données
      setHasError(true);
      setLoading(false);
    }
  };

  // Réinitialiser l'état d'erreur quand l'utilisateur modifie les champs
  const handleEmailChange = (value: string) => {
    setEmail(value);
    setHasError(false);
  };

  const handlePasswordChange = (value: string) => {
    setPassword(value);
    setHasError(false);
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
        <DebugUser />
        <div className="w-full max-w-md auth-animation">
          <div className="text-center mb-8">
            <Link to="/" className="inline-block mb-4">
              <LogoWithText size="lg" className="text-white" />
            </Link>
            <h1 className="text-3xl font-display font-bold mt-2 text-white">
              Bon retour !
            </h1>
            <p className="text-white/80">Connectez-vous à votre compte</p>
          </div>

          <Card className="auth-card">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl">Connexion</CardTitle>
            <CardDescription>
              Entrez vos identifiants pour accéder à votre espace
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="votre@email.com"
                    value={email}
                    onChange={(e) => handleEmailChange(e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Mot de passe</Label>
                  <Link
                    to="/reset-password"
                    className="text-sm text-primary hover:underline"
                  >
                    Mot de passe oublié ?
                  </Link>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => handlePasswordChange(e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              <Button
                type="submit"
                className={`w-full bg-gradient-to-r from-primary to-primary-glow hover:opacity-90 transition-all duration-300 ${
                  loading ? "animate-pulse" : ""
                }`}
                size="lg"
                disabled={loading || hasError || !email || !password}
              >
                <div className="flex items-center justify-center">
                  {loading ? (
                    <>
                      <svg
                        className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      Connexion en cours...
                    </>
                  ) : (
                    <>
                      Se connecter
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </>
                  )}
                </div>
              </Button>
            </form>

              <div className="mt-6 text-center text-sm space-y-2">
                <p className="mb-2">
                  <span className="text-muted-foreground">Pas encore de compte ?</span>
                </p>
                <Link 
                  to="/signup" 
                  className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-primary hover:bg-primary/90 rounded-md transition-colors"
                >
                  Créer un compte
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </div>
          </CardContent>
          </Card>

          <p className="text-center text-sm text-white/70 mt-6">
            En vous connectant, vous acceptez nos{" "}
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
}
