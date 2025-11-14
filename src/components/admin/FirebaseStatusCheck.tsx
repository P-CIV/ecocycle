import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, CheckCircle } from 'lucide-react';
import { testFirebaseConnection, testFirebaseSecurityRules } from '@/utils/firebaseTest';

export function FirebaseStatusCheck() {
  const [connectionStatus, setConnectionStatus] = useState<'checking' | 'success' | 'error'>('checking');
  const [securityStatus, setSecurityStatus] = useState<'checking' | 'success' | 'error'>('checking');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const runTests = async () => {
    setConnectionStatus('checking');
    setSecurityStatus('checking');
    setErrorMessage(null);

    try {
      // Test de connexion
      const connectionResult = await testFirebaseConnection();
      setConnectionStatus(connectionResult ? 'success' : 'error');

      // Test des règles de sécurité
      const securityResult = await testFirebaseSecurityRules();
      setSecurityStatus(securityResult ? 'success' : 'error');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Une erreur inconnue est survenue';
      setErrorMessage(errorMessage);
      setConnectionStatus('error');
      setSecurityStatus('error');
    }
  };

  useEffect(() => {
    runTests();
  }, []);

  return (
    <div className="space-y-4 max-w-md mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4">État de Firebase</h2>

      <Alert variant={connectionStatus === 'success' ? 'default' : 'destructive'}>
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Configuration Firebase</AlertTitle>
        <AlertDescription>
          {connectionStatus === 'checking' && 'Vérification de la connexion...'}
          {connectionStatus === 'success' && (
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span>Firebase est correctement configuré</span>
            </div>
          )}
          {connectionStatus === 'error' && 'Erreur de connexion à Firebase'}
        </AlertDescription>
      </Alert>

      <Alert variant={securityStatus === 'success' ? 'default' : 'destructive'}>
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Règles de sécurité</AlertTitle>
        <AlertDescription>
          {securityStatus === 'checking' && 'Vérification des règles...'}
          {securityStatus === 'success' && (
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span>Les règles de sécurité sont actives</span>
            </div>
          )}
          {securityStatus === 'error' && 'Erreur avec les règles de sécurité'}
        </AlertDescription>
      </Alert>

      {errorMessage && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Erreur</AlertTitle>
          <AlertDescription>{errorMessage}</AlertDescription>
        </Alert>
      )}

      <Button 
        onClick={runTests}
        className="w-full"
        variant={connectionStatus === 'error' ? "destructive" : "default"}
      >
        Tester à nouveau
      </Button>

      <div className="text-sm text-muted-foreground">
        <h3 className="font-semibold mb-2">Configuration actuelle :</h3>
        <ul className="list-disc list-inside space-y-1">
          <li>Project ID: {import.meta.env.VITE_FIREBASE_PROJECT_ID}</li>
          <li>Auth Domain: {import.meta.env.VITE_FIREBASE_AUTH_DOMAIN}</li>
        </ul>
      </div>
    </div>
  );
}