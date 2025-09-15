import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Save, User, Mail, Phone, Globe, Shield, Bell, Palette } from "lucide-react";
import { toast } from "sonner";

const Settings = () => {
  const [settings, setSettings] = useState({
    // Profil
    name: "Stéphanie",
    email: "contact@renaissancebysteph.fr",
    phone: "06 XX XX XX XX",
    bio: "Voyante et praticienne spirituelle passionnée",
    
    // Site web
    siteTitle: "Renaissance By Steph",
    siteDescription: "Voyance • Bien-être • Spiritualité",
    
    // Notifications
    emailNotifications: true,
    smsNotifications: false,
    bookingReminders: true,
    
    // Sécurité
    twoFactorAuth: false,
    sessionTimeout: 60,
    
    // Disponibilités par défaut
    defaultDuration: 60,
    bufferTime: 15,
    maxAdvanceBooking: 30
  });

  const handleSave = () => {
    // Ici vous sauvegarderiez les paramètres
    toast.success("Paramètres sauvegardés avec succès");
  };

  const handleInputChange = (field: string, value: any) => {
    setSettings(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Paramètres</h1>
        <p className="text-muted-foreground">Configurez votre site et vos préférences</p>
      </div>

      <div className="grid gap-6">
        {/* Profil */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <User className="h-5 w-5" />
              <CardTitle>Profil</CardTitle>
            </div>
            <CardDescription>Informations personnelles et professionnelles</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Nom complet</Label>
                <Input
                  id="name"
                  value={settings.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={settings.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                />
              </div>
            </div>
            <div>
              <Label htmlFor="phone">Téléphone</Label>
              <Input
                id="phone"
                value={settings.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="bio">Biographie</Label>
              <Textarea
                id="bio"
                value={settings.bio}
                onChange={(e) => handleInputChange('bio', e.target.value)}
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        {/* Site web */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Globe className="h-5 w-5" />
              <CardTitle>Site web</CardTitle>
            </div>
            <CardDescription>Configuration générale du site</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="siteTitle">Titre du site</Label>
              <Input
                id="siteTitle"
                value={settings.siteTitle}
                onChange={(e) => handleInputChange('siteTitle', e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="siteDescription">Description</Label>
              <Input
                id="siteDescription"
                value={settings.siteDescription}
                onChange={(e) => handleInputChange('siteDescription', e.target.value)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Réservations */}
        <Card>
          <CardHeader>
            <CardTitle>Réservations</CardTitle>
            <CardDescription>Paramètres par défaut pour les consultations</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="defaultDuration">Durée par défaut (minutes)</Label>
                <Input
                  id="defaultDuration"
                  type="number"
                  value={settings.defaultDuration}
                  onChange={(e) => handleInputChange('defaultDuration', parseInt(e.target.value))}
                />
              </div>
              <div>
                <Label htmlFor="bufferTime">Temps de battement (minutes)</Label>
                <Input
                  id="bufferTime"
                  type="number"
                  value={settings.bufferTime}
                  onChange={(e) => handleInputChange('bufferTime', parseInt(e.target.value))}
                />
              </div>
              <div>
                <Label htmlFor="maxAdvanceBooking">Réservation à l'avance (jours)</Label>
                <Input
                  id="maxAdvanceBooking"
                  type="number"
                  value={settings.maxAdvanceBooking}
                  onChange={(e) => handleInputChange('maxAdvanceBooking', parseInt(e.target.value))}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Notifications */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              <CardTitle>Notifications</CardTitle>
            </div>
            <CardDescription>Gérez vos préférences de notification</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Notifications par email</Label>
                <p className="text-sm text-muted-foreground">
                  Recevez les notifications par email
                </p>
              </div>
              <Switch
                checked={settings.emailNotifications}
                onCheckedChange={(checked) => handleInputChange('emailNotifications', checked)}
              />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Notifications SMS</Label>
                <p className="text-sm text-muted-foreground">
                  Recevez les notifications par SMS
                </p>
              </div>
              <Switch
                checked={settings.smsNotifications}
                onCheckedChange={(checked) => handleInputChange('smsNotifications', checked)}
              />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Rappels de rendez-vous</Label>
                <p className="text-sm text-muted-foreground">
                  Envoyer des rappels automatiques aux clients
                </p>
              </div>
              <Switch
                checked={settings.bookingReminders}
                onCheckedChange={(checked) => handleInputChange('bookingReminders', checked)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Sécurité */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              <CardTitle>Sécurité</CardTitle>
            </div>
            <CardDescription>Paramètres de sécurité de votre compte</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Authentification à deux facteurs</Label>
                <p className="text-sm text-muted-foreground">
                  Sécurisez votre compte avec un code de vérification
                </p>
              </div>
              <Switch
                checked={settings.twoFactorAuth}
                onCheckedChange={(checked) => handleInputChange('twoFactorAuth', checked)}
              />
            </div>
            <Separator />
            <div>
              <Label htmlFor="sessionTimeout">Délai d'expiration de session (minutes)</Label>
              <Input
                id="sessionTimeout"
                type="number"
                value={settings.sessionTimeout}
                onChange={(e) => handleInputChange('sessionTimeout', parseInt(e.target.value))}
                className="w-32"
              />
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex justify-end">
          <Button onClick={handleSave} className="min-w-32">
            <Save className="h-4 w-4 mr-2" />
            Sauvegarder
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Settings;