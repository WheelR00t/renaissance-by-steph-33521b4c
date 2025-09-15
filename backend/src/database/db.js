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
        // Même en cas d'erreur, tenter de seed l'admin si possible
        this.seedAdmin();
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

      const afterMigrations = () => {
        this.seedAdmin();
      };

      if (statements.length) {
        this.db.exec(statements.join('\n'), (applyErr) => {
          if (applyErr) console.error('Migration apply error (users):', applyErr);
          else console.log('✅ Migrations applied for users:', statements);
          afterMigrations();
        });
      } else {
        afterMigrations();
      }
    });
  }

  // Seed de l'admin (idempotent et sans conflit)
  seedAdmin() {
    const desiredId = 'admin-1';
    const email = 'admin@renaissancebysteph.fr';
    const hashedPassword = '$2a$10$CwTycUXWue0Thq9StjUM0uJ8R8.lR1BQrQ9/WuCJWs3f5j6s9Y5OG'; // admin123

    // Si un enregistrement existe déjà avec le même id OU le même email, on met à jour, sinon on insère
    this.db.get('SELECT id, email FROM users WHERE id = ? OR email = ?', [desiredId, email], (err, row) => {
      if (err) {
        console.error('Admin seed check error:', err);
        return;
      }

      if (row) {
        const idToUpdate = row.id || desiredId;
        const updateSql = `
          UPDATE users
          SET email = ?, password_hash = ?, first_name = 'Stéphanie', last_name = 'Admin', role = 'admin', is_active = 1
          WHERE id = ?
        `;
        this.db.run(updateSql, [email, hashedPassword, idToUpdate], (updErr) => {
          if (updErr) {
            console.error('Admin seed update error:', updErr);
          } else {
            console.log('✅ Admin record updated/normalized');
          }
        });
      } else {
        const insertSql = `
          INSERT INTO users (id, email, password_hash, first_name, last_name, role, is_active)
          VALUES (?, ?, ?, 'Stéphanie', 'Admin', 'admin', 1)
        `;
        this.db.run(insertSql, [desiredId, email, hashedPassword], (insErr) => {
          if (insErr) {
            console.error('Admin seed insert error:', insErr);
          } else {
            console.log('✅ Admin seeded successfully');
          }
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