const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

class Database {
  constructor() {
    const dbPath = path.join(__dirname, '../../data/voyance.db');
    
    // Créer le dossier data
    const dataDir = path.dirname(dbPath);
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }

    this.db = new sqlite3.Database(dbPath, (err) => {
      if (err) {
        console.error('❌ Erreur SQLite:', err);
      } else {
        console.log('✅ Connecté à SQLite:', dbPath);
        this.initializeSchema();
      }
    });

    // Activer les clés étrangères
    this.db.run('PRAGMA foreign_keys = ON');
  }

  initializeSchema() {
    const schemaPath = path.join(__dirname, '../../database/schema.sql');
    if (fs.existsSync(schemaPath)) {
      const schema = fs.readFileSync(schemaPath, 'utf8');
      this.db.exec(schema, (err) => {
        if (err) console.error('❌ Schema error:', err);
        else {
          console.log('✅ Schema SQLite OK');
          this.runMigrations();
        }
      });
    } else {
      this.runMigrations();
    }
  }

  // Migrations légères pour mettre à niveau les bases existantes
  runMigrations() {
    // Assurer les colonnes requises sur la table users
    this.db.all('PRAGMA table_info(users);', [], (err, rows) => {
      if (err) {
        console.error('Migration check error (users):', err);
        return;
      }
      const columns = (rows || []).map((r) => r.name);
      const statements = [];

      if (!columns.includes('phone')) {
        statements.push('ALTER TABLE users ADD COLUMN phone TEXT;');
      }
      if (!columns.includes('is_active')) {
        statements.push('ALTER TABLE users ADD COLUMN is_active BOOLEAN DEFAULT 1;');
      }

      if (statements.length) {
        this.db.exec(statements.join('\n'), (applyErr) => {
          if (applyErr) console.error('Migration apply error (users):', applyErr);
          else console.log('✅ Migrations applied for users:', statements);
        });
      }
    });
  }

  query(sql, params = []) {
    return new Promise((resolve, reject) => {
      this.db.all(sql, params, (err, rows) => {
        if (err) {
          console.error('Query error:', err);
          reject(err);
        } else {
          resolve(rows);
        }
      });
    });
  }

  run(sql, params = []) {
    return new Promise((resolve, reject) => {
      this.db.run(sql, params, function(err) {
        if (err) {
          console.error('Run error:', err);
          reject(err);
        } else {
          resolve({ id: this.lastID, changes: this.changes });
        }
      });
    });
  }

  get(sql, params = []) {
    return new Promise((resolve, reject) => {
      this.db.get(sql, params, (err, row) => {
        if (err) {
          console.error('Get error:', err);
          reject(err);
        } else {
          resolve(row);
        }
      });
    });
  }

  close() {
    return new Promise((resolve) => {
      this.db.close((err) => {
        if (err) console.error('Close error:', err);
        else console.log('Database connection closed');
        resolve();
      });
    });
  }
}

module.exports = new Database();