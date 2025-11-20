import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

interface ProtectedRouteProps {
  children: React.ReactNode;
  roles?: string[];
}

const ProtectedRoute = ({ children, roles }: ProtectedRouteProps) => {
  const { currentUser, loading, userRole } = useAuth();
  const location = useLocation();

  
  
  
  

  if (loading) {
    return <div>Chargement...</div>;
  }

  if (!currentUser) {
    return <Navigate to="/login" state={{ from: location }} />;
  }

  // Vérification du rôle si des rôles sont spécifiés
  if (roles && !roles.includes(userRole || '')) {
    // Rediriger vers la page appropriée en fonction du rôle
    if (userRole === 'admin') {
      return <Navigate to="/admin" />;
    } else if (userRole === 'agent') {
      return <Navigate to="/agent" />;
    } else {
      return <Navigate to="/" />;
    }
  }

  return <>{children}</>;
};

export default ProtectedRoute;
