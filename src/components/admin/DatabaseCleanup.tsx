import { useState } from 'react';
import { Button } from '../ui/button';
import { Alert } from '../ui/alert';
import { cleanDatabase } from '../../utils/cleanDatabase';
import { useToast } from '../../hooks/use-toast';

export const DatabaseCleanup = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);
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

    return (
        <div className="p-4 space-y-4">
            <h2 className="text-2xl font-bold">Nettoyage de la base de données</h2>
            
            <div className="space-y-2">
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
        </div>
    );
};