import { useState, useEffect } from "react";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Clock, CalendarDays, AlertCircle, CheckCircle2 } from "lucide-react";
import { format, isSameDay } from "date-fns";
import { fr } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { apiService, TimeSlot } from "@/lib/api";
import { toast } from "sonner";

interface BookingCalendarProps {
  selectedDate: Date | undefined;
  onDateSelect: (date: Date | undefined) => void;
  selectedTime: string;
  onTimeSelect: (time: string) => void;
}

const BookingCalendar = ({
  selectedDate,
  onDateSelect,
  selectedTime,
  onTimeSelect
}: BookingCalendarProps) => {
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Charger les créneaux disponibles quand une date est sélectionnée
  useEffect(() => {
    if (selectedDate) {
      loadTimeSlots(selectedDate);
    }
  }, [selectedDate]);

  const loadTimeSlots = async (date: Date) => {
    setLoading(true);
    setError(null);
    try {
      const dateString = format(date, 'yyyy-MM-dd');
      const slots = await apiService.getAvailableSlots(dateString);
      setTimeSlots(slots);
    } catch (err) {
      setError('Erreur lors du chargement des créneaux');
      toast.error('Impossible de charger les créneaux disponibles');
    } finally {
      setLoading(false);
    }
  };

  const handleTimeSelect = (time: string) => {
    const slot = timeSlots.find(s => s.time === time);
    if (slot?.available) {
      onTimeSelect(time);
    } else {
      toast.error('Ce créneau n\'est pas disponible');
    }
  };

  const getSlotStatus = (slot: TimeSlot) => {
    if (!slot.available) return 'unavailable';
    if (slot.booked) return 'booked';
    return 'available';
  };

  const getSlotVariant = (slot: TimeSlot, isSelected: boolean) => {
    if (isSelected) return 'default';
    
    const status = getSlotStatus(slot);
    switch (status) {
      case 'available':
        return 'outline';
      case 'booked':
        return 'secondary';
      case 'unavailable':
        return 'ghost';
      default:
        return 'outline';
    }
  };

  const getSlotIcon = (slot: TimeSlot) => {
    const status = getSlotStatus(slot);
    switch (status) {
      case 'available':
        return <CheckCircle2 className="h-3 w-3 text-green-500" />;
      case 'booked':
        return <AlertCircle className="h-3 w-3 text-orange-500" />;
      case 'unavailable':
        return <AlertCircle className="h-3 w-3 text-red-500" />;
      default:
        return null;
    }
  };

  // Fonction pour désactiver certains jours (weekend, jours passés)
  const isDayDisabled = (date: Date) => {
    // Désactiver les jours passés
    if (date < new Date()) return true;
    
    // Désactiver les dimanches (jour 0) et éventuellement samedi (jour 6)
    const dayOfWeek = date.getDay();
    return dayOfWeek === 0; // Dimanche fermé
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CalendarDays className="h-5 w-5" />
            Sélectionnez une date
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={onDateSelect}
            disabled={isDayDisabled}
            locale={fr}
            className="rounded-md border pointer-events-auto"
          />
          
          {selectedDate && (
            <div className="mt-4 p-3 bg-muted/50 rounded-lg">
              <p className="text-sm font-medium">
                Date sélectionnée : {format(selectedDate, "EEEE d MMMM yyyy", { locale: fr })}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {selectedDate && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Créneaux disponibles
            </CardTitle>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <CheckCircle2 className="h-3 w-3 text-green-500" />
                Disponible
              </div>
              <div className="flex items-center gap-1">
                <AlertCircle className="h-3 w-3 text-orange-500" />
                Réservé
              </div>
              <div className="flex items-center gap-1">
                <AlertCircle className="h-3 w-3 text-red-500" />
                Indisponible
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                <span className="ml-2">Chargement des créneaux...</span>
              </div>
            ) : error ? (
              <div className="text-center py-8">
                <AlertCircle className="h-8 w-8 text-red-500 mx-auto mb-2" />
                <p className="text-red-600">{error}</p>
                <Button 
                  variant="outline" 
                  onClick={() => loadTimeSlots(selectedDate)}
                  className="mt-2"
                >
                  Réessayer
                </Button>
              </div>
            ) : timeSlots.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                {timeSlots.map((slot) => {
                  const isSelected = selectedTime === slot.time;
                  const status = getSlotStatus(slot);
                  const isDisabled = status !== 'available';
                  
                  return (
                    <Button
                      key={slot.time}
                      variant={getSlotVariant(slot, isSelected)}
                      size="sm"
                      onClick={() => handleTimeSelect(slot.time)}
                      disabled={isDisabled}
                      className={cn(
                        "relative flex items-center justify-between p-2 h-auto",
                        isSelected && "ring-2 ring-primary ring-offset-2",
                        isDisabled && "opacity-50 cursor-not-allowed"
                      )}
                    >
                      <span className="text-xs font-medium">{slot.time}</span>
                      {getSlotIcon(slot)}
                    </Button>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Clock className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>Aucun créneau disponible pour cette date</p>
                <p className="text-sm mt-1">Veuillez choisir une autre date</p>
              </div>
            )}

            {selectedTime && (
              <div className="mt-4 p-3 bg-primary/5 border border-primary/20 rounded-lg">
                <p className="text-sm font-medium text-primary">
                  ✓ Créneau sélectionné : {selectedTime}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Légende et informations */}
      <Card className="bg-muted/30">
        <CardContent className="pt-6">
          <div className="space-y-2 text-sm text-muted-foreground">
            <h4 className="font-medium text-foreground">Informations importantes :</h4>
            <ul className="space-y-1 ml-4">
              <li>• Les consultations ont lieu du lundi au samedi</li>
              <li>• Fermeture le dimanche</li>
              <li>• Pause déjeuner de 12h à 14h</li>
              <li>• Les créneaux se libèrent en temps réel</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default BookingCalendar;