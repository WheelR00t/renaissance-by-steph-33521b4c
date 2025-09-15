import { useState } from "react";
import { useStripe, useElements, PaymentElement } from "@stripe/react-stripe-js";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, AlertCircle, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { apiService, BookingData } from "@/lib/api";

interface StripePaymentFormProps {
  booking: BookingData;
  clientSecret: string;
  onPaymentSuccess: (booking: BookingData) => void;
  onPaymentError: (error: string) => void;
}

const StripePaymentForm = ({ 
  booking, 
  clientSecret, 
  onPaymentSuccess, 
  onPaymentError 
}: StripePaymentFormProps) => {
  const stripe = useStripe();
  const elements = useElements();
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isComplete, setIsComplete] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      // Confirmer le paiement avec Stripe
      const { error: stripeError, paymentIntent } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/booking-success`,
        },
        redirect: 'if_required',
      });

      if (stripeError) {
        setError(stripeError.message || 'Erreur lors du paiement');
        onPaymentError(stripeError.message || 'Erreur lors du paiement');
        return;
      }

      if (paymentIntent && paymentIntent.status === 'succeeded') {
        // Confirmer côté serveur
        const result = await apiService.confirmPayment(
          clientSecret,
          booking.id!
        );

        if (result.success) {
          setIsComplete(true);
          toast.success('Paiement confirmé ! Vous allez recevoir un email de confirmation.');
          
          // Envoyer l'email de confirmation
          await apiService.sendConfirmationEmail(booking.id!);
          
          onPaymentSuccess(result.booking);
        } else {
          throw new Error('Échec de la confirmation côté serveur');
        }
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors du paiement';
      setError(errorMessage);
      onPaymentError(errorMessage);
    } finally {
      setIsProcessing(false);
    }
  };

  if (isComplete) {
    return (
      <Alert className="border-green-200 bg-green-50">
        <CheckCircle2 className="h-4 w-4 text-green-600" />
        <AlertDescription className="text-green-800">
          Paiement confirmé avec succès ! Votre réservation est confirmée.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <PaymentElement 
        options={{
          layout: "tabs"
        }}
      />
      
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Button 
        type="submit" 
        disabled={!stripe || !elements || isProcessing}
        className="w-full"
      >
        {isProcessing ? (
          <>
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            Traitement en cours...
          </>
        ) : (
          `Payer ${new Intl.NumberFormat('fr-FR', {
            style: 'currency',
            currency: 'EUR'
          }).format(booking.price)}`
        )}
      </Button>
    </form>
  );
};

export default StripePaymentForm;