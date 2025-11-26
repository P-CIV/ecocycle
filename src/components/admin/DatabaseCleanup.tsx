import { useState } from 'react';
import { Button } from '../ui/button';
import { Alert } from '../ui/alert';
import { cleanDatabase } from '../../utils/cleanDatabase';
import { resetAllUserPoints } from '../../utils/resetUserPoints';
import { useToast } from '../../hooks/use-toast';

export const DatabaseCleanup = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [isResettingPoints, setIsResettingPoints] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);
    const [successPoints, setSuccessPoints] = useState(false);
    const { toast } = useToast();

    const handleCleanup = async () => {
        if (!confirm('Êtes-vous sûr de vouloir supprimer toutes les données de test ? Cette action est irréversible.')) {
            return;
        }

        setIsLoading(true);
        setError(null);
        setSuccess(false);

        try {
            await cleanDatabase();
            setSuccess(true);
            toast({
                title: "Nettoyage réussi",
                description: "Toutes les données de test ont été supprimées avec succès.",
                duration: 5000,
            });
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Une erreur est survenue');
            toast({
                title: "Erreur",
                description: "Le nettoyage de la base de données a échoué.",
                variant: "destructive",
                duration: 5000,
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleResetPoints = async () => {
        if (!confirm('Êtes-vous sûr de vouloir réinitialiser les points de TOUS les utilisateurs à 0 ? Cette action est irréversible.')) {
            return;
        }

        setIsResettingPoints(true);
        setError(null);
        setSuccessPoints(false);

        try {
            await resetAllUserPoints();
            setSuccessPoints(true);
            toast({
                title: "Points réinitialisés",
                description: "Tous les points des utilisateurs ont été réinitialisés à 0.",
                duration: 5000,
            });
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Une erreur est survenue');
            toast({
                title: "Erreur",
                description: "La réinitialisation des points a échoué.",
                variant: "destructive",
                duration: 5000,
            });
        } finally {
            setIsResettingPoints(false);
        }
    };

    return (
        <div className="p-4 space-y-6">
            <h2 className="text-2xl font-bold">Gestion de la base de données</h2>
            
            {/* Section Nettoyage */}
            <div className="space-y-2 border-b pb-6">
                <h3 className="text-lg font-semibold">Nettoyage des données de test</h3>
                <p className="text-sm text-gray-600">
                    Cette action va supprimer toutes les données de test de la base de données.
                    Seules les données réelles seront conservées.
                </p>

                {error && (
                    <Alert variant="destructive">
                        <p>{error}</p>
                    </Alert>
                )}

                {success && (
                    <Alert>
                        <p>Le nettoyage de la base de données a été effectué avec succès.</p>
                    </Alert>
                )}

                <Button
                    onClick={handleCleanup}
                    disabled={isLoading}
                    variant="destructive"
                >
                    {isLoading ? 'Nettoyage en cours...' : 'Nettoyer la base de données'}
                </Button>
            </div>

            {/* Section Réinitialisation des Points */}
            <div className="space-y-2">
                <h3 className="text-lg font-semibold text-orange-600">Réinitialiser les points</h3>
                <p className="text-sm text-gray-600">
                    Cette action va réinitialiser les points de TOUS les utilisateurs à 0.
                    Utilisez ceci uniquement si vous avez changé le système de points.
                </p>

                {successPoints && (
                    <Alert>
                        <p>Tous les points des utilisateurs ont été réinitialisés à 0.</p>
                    </Alert>
                )}

                <Button
                    onClick={handleResetPoints}
                    disabled={isResettingPoints}
                    variant="outline"
                    className="border-orange-300 text-orange-600 hover:bg-orange-50"
                >
                    {isResettingPoints ? 'Réinitialisation en cours...' : 'Réinitialiser tous les points à 0'}
                </Button>
            </div>
        </div>
    );
};
