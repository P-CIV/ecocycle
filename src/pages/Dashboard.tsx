import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

const Dashboard = () => {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleLogout = async () => {
    try {
      await logout();
      toast({
        title: "Déconnexion réussie",
        description: "À bientôt !",
      });
      navigate("/");
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de la déconnexion",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Tableau de bord</h1>
        <Button variant="outline" onClick={handleLogout}>
          Se déconnecter
        </Button>
      </div>
      
      <div className="bg-card p-6 rounded-lg shadow-lg">
        <h2 className="text-xl font-semibold mb-4">Bienvenue !</h2>
        <p className="text-muted-foreground">
          Vous êtes connecté avec : {currentUser?.email}
        </p>
      </div>
    </div>
  );
};

export default Dashboard;
