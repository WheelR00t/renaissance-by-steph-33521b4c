# 🚨 FIX BACKEND - Commandes à Exécuter Ligne par Ligne

## Étape 1: Arrêter tout processus sur le port 3001
```bash
sudo fuser -k 3001/tcp
```

## Étape 2: Aller dans le dossier backend
```bash
cd ~/voyance-steph/renaissance-by-steph-33521b4c/backend
```

## Étape 3: Définir les variables d'environnement
```bash
export HOST=127.0.0.1
```
```bash
export PORT=3001
```
```bash
export NODE_ENV=production
```

## Étape 4: Lancer le serveur backend en arrière-plan
```bash
nohup node src/app.js > ~/voyance-backend.log 2>&1 &
```

## Étape 5: Attendre 2 secondes puis vérifier
```bash
sleep 2
```

## Étape 6: Vérifier que le port 3001 écoute
```bash
ss -ltnp | grep 3001
```

## Étape 7: Vérifier les logs du serveur (50 dernières lignes)
```bash
tail -n 50 ~/voyance-backend.log
```

## Étape 8: Tester la santé de l'API
```bash
curl -si http://127.0.0.1:3001/api/health
```

## ✅ Si tout fonctionne:
- Tu devrais voir "OK" dans la réponse curl
- Recharge /admin/messages dans ton navigateur
- Clique sur "Rafraîchir" 
- Envoie un message via /contact
- Clique encore sur "Rafraîchir" dans /admin/messages

## ❌ Si ça ne marche pas:
- Copie-moi le résultat de `tail -n 50 ~/voyance-backend.log`
- Copie-moi la réponse de `curl -si http://127.0.0.1:3001/api/health`