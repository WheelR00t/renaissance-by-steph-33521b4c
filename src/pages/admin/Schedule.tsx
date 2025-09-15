import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { 
  Clock,
  Save,
  Plus,
  X,
  Calendar,
  AlertCircle,
  CheckCircle
} from "lucide-react";
import { toast } from "sonner";

interface TimeSlot {
  start: string;
  end: string;
}

interface DaySchedule {
  day: string;
  dayFr: string;
  isOpen: boolean;
  slots: TimeSlot[];
}

interface ExceptionalClosure {
  id: string;
  date: string;
  reason: string;
  isRecurring?: boolean;
}

const Schedule = () => {
  const [schedule, setSchedule] = useState<DaySchedule[]>([
    {
      day: "monday",
      dayFr: "Lundi",
      isOpen: true,
      slots: [
        { start: "09:00", end: "12:00" },
        { start: "14:00", end: "19:00" }
      ]
    },
    {
      day: "tuesday", 
      dayFr: "Mardi",
      isOpen: true,
      slots: [
        { start: "09:00", end: "12:00" },
        { start: "14:00", end: "19:00" }
      ]
    },
    {
      day: "wednesday",
      dayFr: "Mercredi",
      isOpen: true,
      slots: [
        { start: "09:00", end: "12:00" },
        { start: "14:00", end: "19:00" }
      ]
    },
    {
      day: "thursday",
      dayFr: "Jeudi",
      isOpen: true,
      slots: [
        { start: "09:00", end: "12:00" },
        { start: "14:00", end: "19:00" }
      ]
    },
    {
      day: "friday",
      dayFr: "Vendredi",
      isOpen: true,
      slots: [
        { start: "09:00", end: "12:00" },
        { start: "14:00", end: "19:00" }
      ]
    },
    {
      day: "saturday",
      dayFr: "Samedi", 
      isOpen: true,
      slots: [
        { start: "09:00", end: "17:00" }
      ]
    },
    {
      day: "sunday",
      dayFr: "Dimanche",
      isOpen: false,
      slots: []
    }
  ]);

  const [exceptions, setExceptions] = useState<ExceptionalClosure[]>([
    {
      id: "1",
      date: "2024-12-25",
      reason: "Noël",
      isRecurring: true
    },
    {
      id: "2", 
      date: "2024-04-15",
      reason: "Congés personnels"
    }
  ]);

  const [newException, setNewException] = useState({
    date: "",
    reason: "",
    isRecurring: false
  });

  const toggleDayOpen = (dayIndex: number) => {
    const newSchedule = [...schedule];
    newSchedule[dayIndex].isOpen = !newSchedule[dayIndex].isOpen;
    
    if (!newSchedule[dayIndex].isOpen) {
      newSchedule[dayIndex].slots = [];
    } else if (newSchedule[dayIndex].slots.length === 0) {
      newSchedule[dayIndex].slots = [{ start: "09:00", end: "17:00" }];
    }
    
    setSchedule(newSchedule);
  };

  const addTimeSlot = (dayIndex: number) => {
    const newSchedule = [...schedule];
    newSchedule[dayIndex].slots.push({ start: "09:00", end: "17:00" });
    setSchedule(newSchedule);
  };

  const removeTimeSlot = (dayIndex: number, slotIndex: number) => {
    const newSchedule = [...schedule];
    newSchedule[dayIndex].slots.splice(slotIndex, 1);
    setSchedule(newSchedule);
  };

  const updateTimeSlot = (dayIndex: number, slotIndex: number, field: "start" | "end", value: string) => {
    const newSchedule = [...schedule];
    newSchedule[dayIndex].slots[slotIndex][field] = value;
    setSchedule(newSchedule);
  };

  const saveSchedule = () => {
    // Ici vous enverriez les données à votre backend
    toast.success("Horaires mis à jour avec succès !");
  };

  const addException = () => {
    if (!newException.date || !newException.reason) {
      toast.error("Veuillez remplir tous les champs");
      return;
    }

    const exception: ExceptionalClosure = {
      id: Date.now().toString(),
      ...newException
    };

    setExceptions([...exceptions, exception]);
    setNewException({ date: "", reason: "", isRecurring: false });
    toast.success("Fermeture exceptionnelle ajoutée");
  };

  const removeException = (id: string) => {
    setExceptions(exceptions.filter(e => e.id !== id));
    toast.success("Fermeture exceptionnelle supprimée");
  };

  const generateTimeSlots = () => {
    // Fonction pour générer automatiquement les créneaux de 30 minutes
    const newSchedule = schedule.map(day => {
      if (!day.isOpen) return day;
      
      const slots: TimeSlot[] = [];
      day.slots.forEach(slot => {
        const start = new Date(`1970-01-01T${slot.start}:00`);
        const end = new Date(`1970-01-01T${slot.end}:00`);
        
        while (start < end) {
          const slotEnd = new Date(start.getTime() + 30 * 60000); // 30 minutes
          if (slotEnd <= end) {
            slots.push({
              start: start.toTimeString().slice(0, 5),
              end: slotEnd.toTimeString().slice(0, 5)
            });
          }
          start.setTime(start.getTime() + 30 * 60000);
        }
      });
      
      return { ...day, generatedSlots: slots };
    });
    
    toast.success("Créneaux générés automatiquement");
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Gestion des Horaires</h1>
          <p className="text-muted-foreground">
            Configurez vos heures d'ouverture et fermetures exceptionnelles
          </p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={generateTimeSlots}>
            <Clock className="h-4 w-4 mr-2" />
            Générer les créneaux
          </Button>
          <Button onClick={saveSchedule} className="bg-gradient-mystique">
            <Save className="h-4 w-4 mr-2" />
            Sauvegarder
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Horaires hebdomadaires */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-xl font-semibold">Horaires hebdomadaires</h2>
          
          {schedule.map((daySchedule, dayIndex) => (
            <Card key={daySchedule.day}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    {daySchedule.dayFr}
                    {daySchedule.isOpen ? (
                      <Badge variant="outline" className="bg-green-50 text-green-700">
                        Ouvert
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="bg-red-50 text-red-700">
                        Fermé
                      </Badge>
                    )}
                  </CardTitle>
                  <Switch
                    checked={daySchedule.isOpen}
                    onCheckedChange={() => toggleDayOpen(dayIndex)}
                  />
                </div>
              </CardHeader>
              
              {daySchedule.isOpen && (
                <CardContent className="space-y-3">
                  {daySchedule.slots.map((slot, slotIndex) => (
                    <div key={slotIndex} className="flex items-center space-x-2">
                      <Label className="w-16">Créneau {slotIndex + 1}</Label>
                      <Input
                        type="time"
                        value={slot.start}
                        onChange={(e) => updateTimeSlot(dayIndex, slotIndex, "start", e.target.value)}
                        className="w-32"
                      />
                      <span className="text-muted-foreground">à</span>
                      <Input
                        type="time"
                        value={slot.end}
                        onChange={(e) => updateTimeSlot(dayIndex, slotIndex, "end", e.target.value)}
                        className="w-32"
                      />
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => removeTimeSlot(dayIndex, slotIndex)}
                        disabled={daySchedule.slots.length <= 1}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                  
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => addTimeSlot(dayIndex)}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Ajouter un créneau
                  </Button>
                </CardContent>
              )}
            </Card>
          ))}
        </div>

        {/* Fermetures exceptionnelles */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Fermetures exceptionnelles</h2>
          
          <Card>
            <CardHeader>
              <CardTitle>Ajouter une fermeture</CardTitle>
              <CardDescription>
                Jours fériés, congés, etc.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="exceptionDate">Date</Label>
                <Input
                  id="exceptionDate"
                  type="date"
                  value={newException.date}
                  onChange={(e) => setNewException({...newException, date: e.target.value})}
                />
              </div>
              
              <div>
                <Label htmlFor="exceptionReason">Raison</Label>
                <Input
                  id="exceptionReason"
                  value={newException.reason}
                  onChange={(e) => setNewException({...newException, reason: e.target.value})}
                  placeholder="Ex: Congés, Jour férié"
                />
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch
                  id="recurring"
                  checked={newException.isRecurring}
                  onCheckedChange={(checked) => setNewException({...newException, isRecurring: checked})}
                />
                <Label htmlFor="recurring">Répéter chaque année</Label>
              </div>
              
              <Button onClick={addException} className="w-full">
                <Plus className="h-4 w-4 mr-2" />
                Ajouter
              </Button>
            </CardContent>
          </Card>

          {/* Liste des fermetures */}
          <div className="space-y-2">
            {exceptions.map((exception) => (
              <Card key={exception.id}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{exception.reason}</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(exception.date).toLocaleDateString('fr-FR')}
                        {exception.isRecurring && " (récurrent)"}
                      </p>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => removeException(exception.id)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Résumé */}
          <Card className="bg-muted/30">
            <CardHeader>
              <CardTitle className="text-sm">Résumé</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>{schedule.filter(d => d.isOpen).length} jours ouverts</span>
                </div>
                <div className="flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-red-500" />
                  <span>{exceptions.length} fermetures exceptionnelles</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Schedule;