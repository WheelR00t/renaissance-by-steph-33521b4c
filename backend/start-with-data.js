#!/usr/bin/env node

/**
 * Script de démarrage du backend avec initialisation des données
 * Usage: node start-with-data.js
 */

const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

console.log('🚀 Démarrage du backend Renaissance by Steph...');

// Vérifier si la base de données existe
const dbPath = path.join(__dirname, 'data/voyance.db');
const dbExists = fs.existsSync(dbPath);

if (!dbExists) {
  console.log('📋 Base de données non trouvée, création en cours...');
}

// Démarrer le serveur
const server = spawn('node', ['src/app.js'], {
  stdio: 'inherit',
  cwd: __dirname
});

// Attendre un peu que le serveur démarre
setTimeout(() => {
  if (!dbExists) {
    console.log('🌱 Initialisation des données de démonstration...');
    
    // Exécuter le seeding
    const seedProcess = spawn('node', ['seed-demo-data.js'], {
      stdio: 'inherit',
      cwd: __dirname
    });

    seedProcess.on('close', (code) => {
      if (code === 0) {
        console.log('✅ Données de démonstration initialisées !');
      } else {
        console.log('⚠️  Erreur lors de l\'initialisation des données');
      }
    });
  }
}, 2000);

// Gestion propre de l'arrêt
process.on('SIGINT', () => {
  console.log('\n🛑 Arrêt du serveur...');
  server.kill('SIGINT');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n🛑 Arrêt du serveur...');
  server.kill('SIGTERM');
  process.exit(0);
});

server.on('close', (code) => {
  console.log(`Serveur arrêté avec le code ${code}`);
  process.exit(code);
});