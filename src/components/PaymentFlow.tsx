import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  CreditCard, 
  Lock, 
  CheckCircle2, 
  AlertCircle, 
  Loader2, 
  Euro,
  ShieldCheck 
} from "lucide-react";
import { toast } from "sonner";
import { apiService, BookingData, PaymentIntent } from "@/lib/api";
import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import StripePaymentForm from "./StripePaymentForm";

// Charger Stripe avec la clé publique
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || 'pk_test_default');

interface PaymentFlowProps {
  booking: BookingData;
  onPaymentSuccess: (booking: BookingData) => void;
  onPaymentError: (error: string) => void;
  onCancel: () => void;
}

type PaymentStatus = 'idle' | 'processing' | 'succeeded' | 'failed';

const PaymentFlow = ({ 
  booking, 
  onPaymentSuccess, 
  onPaymentError, 
  onCancel 
}: PaymentFlowProps) => {
  const [paymentIntent, setPaymentIntent] = useState<PaymentIntent | null>(null);
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>('idle');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Initialiser le paiement à l'ouverture
  useEffect(() => {
    initializePayment();
  }, [booking.id]);

  const initializePayment = async () => {
    try {
      setLoading(true);
      setError(null);
      
      if (!booking.id) {
        throw new Error('ID de réservation manquant');
      }

      const intent = await apiService.createPaymentIntent(
        booking.id,
        Math.round(booking.price * 100) // Convertir en centimes
      );
      
      setPaymentIntent(intent);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de l\'initialisation du paiement';
      setError(errorMessage);
      onPaymentError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handlePayment = async () => {
    // Cette fonction est maintenant gérée par StripePaymentForm
    console.log('Paiement géré par Stripe Elements');
  };

  // Simulation Stripe (remplacez par la vraie intégration)
  const simulateStripePayment = (clientSecret: string): Promise<void> => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        // Force succès pour les tests
        resolve();
        
        // Version aléatoire (90% de chance de succès pour la démo)
        // if (Math.random() > 0.1) {
        //   resolve();
        // } else {
        //   reject(new Error('Paiement refusé par la banque'));
        // }
      }, 1500); // Délai réduit pour les tests
    });
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR'
    }).format(price);
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="py-8">
          <div className="flex flex-col items-center justify-center space-y-4">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-muted-foreground">Initialisation du paiement...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error && !paymentIntent) {
    return (
      <Card>
        <CardContent className="py-8">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
          <div className="flex gap-3 mt-4">
            <Button variant="outline" onClick={initializePayment}>
              Réessayer
            </Button>
            <Button variant="ghost" onClick={onCancel}>
              Annuler
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Résumé de la commande */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Euro className="h-5 w-5" />
            Résumé de votre commande
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex justify-between items-center">
            <span>Service : {booking.service}</span>
            <Badge variant="secondary">{formatPrice(booking.price)}</Badge>
          </div>
          <div className="flex justify-between items-center text-sm text-muted-foreground">
            <span>Date : {new Date(booking.date).toLocaleDateString('fr-FR')}</span>
            <span>Heure : {booking.time}</span>
          </div>
          <div className="border-t pt-4">
            <div className="flex justify-between items-center font-semibold text-lg">
              <span>Total à payer :</span>
              <span className="text-primary">{formatPrice(booking.price)}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Zone de paiement */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Paiement sécurisé
          </CardTitle>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Lock className="h-4 w-4" />
            <span>Powered by Stripe - Paiement 100% sécurisé</span>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {paymentStatus === 'succeeded' ? (
            <Alert className="border-green-200 bg-green-50">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">
                Paiement confirmé avec succès ! Votre réservation est confirmée.
              </AlertDescription>
            </Alert>
          ) : (
            <>
              {/* Stripe Elements - Interface de paiement réelle */}
              {paymentIntent && (
                <Elements 
                  key={paymentIntent.clientSecret}
                  stripe={stripePromise} 
                  options={{
                    clientSecret: paymentIntent.clientSecret,
                    appearance: {
                      theme: 'stripe',
                      variables: {
                        colorPrimary: '#6366f1'
                      }
                    }
                  }}
                >
                  <StripePaymentForm
                    booking={booking}
                    clientSecret={paymentIntent.clientSecret}
                    onPaymentSuccess={onPaymentSuccess}
                    onPaymentError={onPaymentError}
                  />
                </Elements>
              )}

              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {/* Bouton d'annulation */}
              <div className="flex justify-end">
                <Button 
                  variant="outline" 
                  onClick={onCancel}
                  disabled={paymentStatus === 'processing'}
                >
                  Annuler
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Informations de sécurité */}
      <Card className="bg-muted/30">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <ShieldCheck className="h-5 w-5 text-green-600 mt-0.5" />
            <div className="space-y-1">
              <h4 className="font-medium">Paiement sécurisé</h4>
              <p className="text-sm text-muted-foreground">
                Vos informations bancaires sont protégées par le cryptage SSL et 
                traitées par Stripe, leader mondial du paiement en ligne.
              </p>
              <ul className="text-xs text-muted-foreground mt-2 space-y-1">
                <li>• Aucune donnée bancaire stockée sur nos serveurs</li>
                <li>• Conformité PCI DSS niveau 1</li>
                <li>• Remboursement garanti en cas de problème</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PaymentFlow;

/*
INTÉGRATION STRIPE COMPLÈTE :

1. Installez Stripe :
   npm install @stripe/stripe-js @stripe/react-stripe-js

2. Remplacez la section "Formulaire de carte" par :

import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';

const stripePromise = loadStripe('pk_test_votre_cle_publique_stripe');

// Wrapper avec Elements
<Elements stripe={stripePromise}>
  <PaymentForm />
</Elements>

3. Créez PaymentForm avec CardElement :

const PaymentForm = () => {
  const stripe = useStripe();
  const elements = useElements();
  
  const handleSubmit = async (event) => {
    event.preventDefault();
    
    if (!stripe || !elements) return;
    
    const card = elements.getElement(CardElement);
    
    const {error, paymentMethod} = await stripe.createPaymentMethod({
      type: 'card',
      card: card,
    });
    
    if (error) {
      console.log('[error]', error);
    } else {
      console.log('[PaymentMethod]', paymentMethod);
      // Confirmer le paiement avec votre backend
    }
  };
  
  return (
    <form onSubmit={handleSubmit}>
      <CardElement />
      <button type="submit" disabled={!stripe}>
        Pay
      </button>
    </form>
  );
};

4. Backend SQLite/API pour Stripe :
   - Créer PaymentIntent côté serveur
   - Webhook pour confirmer les paiements
   - Mise à jour du statut en base
*/