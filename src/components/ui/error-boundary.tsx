import { AlertCircle, RefreshCw } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

interface ErrorBoundaryProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  showRetry?: boolean;
}

export const ErrorDisplay = ({ 
  title = "Erreur de connexion", 
  message = "Impossible de se connecter au serveur. Vérifiez que le backend est démarré.",
  onRetry,
  showRetry = true 
}: ErrorBoundaryProps) => {
  return (
    <div className="flex items-center justify-center min-h-[400px] p-8">
      <div className="max-w-md w-full">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>{title}</AlertTitle>
          <AlertDescription className="mt-2">
            {message}
          </AlertDescription>
        </Alert>
        
        {showRetry && onRetry && (
          <div className="mt-4 text-center">
            <Button 
              onClick={onRetry} 
              variant="outline" 
              className="gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              Réessayer
            </Button>
          </div>
        )}
        
        <div className="mt-4 text-sm text-muted-foreground">
          <p className="font-medium">Pour résoudre ce problème :</p>
          <ul className="mt-2 space-y-1 list-disc list-inside">
            <li>Vérifiez que le serveur backend est démarré</li>
            <li>Contrôlez la configuration réseau</li>
            <li>Consultez les logs du serveur</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export const ServiceErrorDisplay = ({ onRetry }: { onRetry?: () => void }) => {
  return (
    <ErrorDisplay 
      title="Services indisponibles"
      message="Impossible de charger la liste des services. Le serveur backend semble hors ligne."
      onRetry={onRetry}
    />
  );
};

export const DashboardErrorDisplay = ({ onRetry }: { onRetry?: () => void }) => {
  return (
    <ErrorDisplay 
      title="Dashboard indisponible"
      message="Impossible de charger les données du dashboard. Vérifiez la connexion à la base de données."
      onRetry={onRetry}
    />
  );
};

export const BlogErrorDisplay = ({ onRetry }: { onRetry?: () => void }) => {
  return (
    <ErrorDisplay 
      title="Articles indisponibles"
      message="Impossible de charger les articles de blog. Le serveur semble rencontrer des difficultés."
      onRetry={onRetry}
    />
  );
};