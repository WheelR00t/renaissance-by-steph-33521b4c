const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');
const bcrypt = require('bcryptjs');

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
        if (err) {
          console.error('❌ Schema error:', err);
          // Même si le schema.sql a des erreurs (ex: nouvelles colonnes), continuer avec les migrations
          this.runMigrations();
        } else {
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
    // 1) USERS: colonnes optionnelles
    this.db.all('PRAGMA table_info(users);', [], (err, rows) => {
      if (err) {
        console.error('Migration check error (users):', err);
        // Continuer malgré tout
      }
      const userCols = (rows || []).map((r) => r.name);
      const userStatements = [];
      if (!userCols.includes('phone')) userStatements.push('ALTER TABLE users ADD COLUMN phone TEXT;');
      if (!userCols.includes('is_active')) userStatements.push('ALTER TABLE users ADD COLUMN is_active BOOLEAN DEFAULT 1;');

      const applyUser = (done) => {
        if (userStatements.length) {
          this.db.exec(userStatements.join('\n'), (applyErr) => {
            if (applyErr) console.error('Migration apply error (users):', applyErr);
            else console.log('✅ Migrations applied for users:', userStatements);
            done();
          });
        } else done();
      };

      // 2) SERVICES: ajouter colonne features si manquante
      const ensureServices = (done) => {
        this.db.all('PRAGMA table_info(services);', [], (svcErr, svcRows) => {
          if (svcErr) {
            console.error('Migration check error (services):', svcErr);
            return done();
          }
          const svcCols = (svcRows || []).map((r) => r.name);
          if (!svcCols.includes('features')) {
            this.db.exec('ALTER TABLE services ADD COLUMN features TEXT;', (alterErr) => {
              if (alterErr) console.error('Migration apply error (services.features):', alterErr);
              else console.log('✅ Column services.features added');
              done();
            });
          } else done();
        });
      };

      // 3) BOOKINGS: ajouter colonne visio_link si manquante
      const ensureBookings = (done) => {
        this.db.all('PRAGMA table_info(bookings);', [], (bkErr, bkRows) => {
          if (bkErr) {
            console.error('Migration check error (bookings):', bkErr);
            return done();
          }
          const bkCols = (bkRows || []).map((r) => r.name);
          if (!bkCols.includes('visio_link')) {
            this.db.exec('ALTER TABLE bookings ADD COLUMN visio_link TEXT;', (alterErr) => {
              if (alterErr) console.error('Migration apply error (bookings.visio_link):', alterErr);
              else console.log('✅ Column bookings.visio_link added');
              done();
            });
          } else done();
        });
      };

      // 4) BLOG_POSTS: créer la table si elle n'existe pas
      const ensureBlogPosts = (done) => {
        this.db.get("SELECT name FROM sqlite_master WHERE type='table' AND name='blog_posts';", [], (tblErr, table) => {
          if (tblErr) {
            console.error('Migration check error (blog_posts table):', tblErr);
            return done();
          }
          
          if (!table) {
            console.log('📝 Creating blog_posts table...');
            const createBlogTable = `
              CREATE TABLE blog_posts (
                id TEXT PRIMARY KEY,
                title TEXT NOT NULL,
                slug TEXT UNIQUE NOT NULL,
                content TEXT NOT NULL,
                excerpt TEXT,
                image_url TEXT,
                author_id TEXT NOT NULL,
                status TEXT CHECK(status IN ('draft', 'published')) DEFAULT 'draft',
                published_at DATETIME,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (author_id) REFERENCES users (id)
              );
              CREATE INDEX IF NOT EXISTS idx_blog_slug ON blog_posts(slug);
              CREATE INDEX IF NOT EXISTS idx_blog_status ON blog_posts(status);
            `;
            
            this.db.exec(createBlogTable, (createErr) => {
              if (createErr) {
                console.error('❌ Error creating blog_posts table:', createErr);
              } else {
                console.log('✅ Blog posts table created successfully');
              }
              done();
            });
          } else {
            // Vérifier si la colonne image_url existe
            this.db.all('PRAGMA table_info(blog_posts);', [], (pragmaErr, columns) => {
              if (pragmaErr) {
                console.error('Migration check error (blog_posts columns):', pragmaErr);
                return done();
              }
              
              const hasImageUrl = columns.some(col => col.name === 'image_url');
              if (!hasImageUrl) {
                console.log('📝 Adding image_url column to blog_posts...');
                this.db.exec('ALTER TABLE blog_posts ADD COLUMN image_url TEXT;', (alterErr) => {
                  if (alterErr) {
                    console.error('❌ Error adding image_url column:', alterErr);
                  } else {
                    console.log('✅ image_url column added to blog_posts');
                  }
                  done();
                });
              } else {
                console.log('✅ Blog posts table already exists with image_url');
                done();
              }
            });
          }
        });
      };

      // Chaînage
      applyUser(() => ensureServices(() => ensureBookings(() => ensureBlogPosts(() => {
        this.seedAdmin();
        this.seedServices();
      }))));
    });
  }

  // Seed de l'admin (idempotent et sans conflit)
  seedAdmin() {
    const desiredId = 'admin-1';
    const email = 'admin@renaissancebysteph.fr';
    const hashedPassword = bcrypt.hashSync('admin123', 10);

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

  // Seed des services par défaut avec features (idempotent)
  seedServices() {
    const defaults = [
      {
        id: 'tarot',
        name: 'Tirage de Cartes',
        description: "Révélez votre avenir grâce aux messages des cartes",
        price: 45.0,
        duration: '30-60 min',
        features: [
          'Lecture personnalisée',
          "Guidance sur l'avenir",
          'Conseils pratiques',
          'Support émotionnel',
        ],
      },
      {
        id: 'reiki',
        name: 'Séance Reiki',
        description: "Harmonisez vos énergies et retrouvez l'équilibre",
        price: 60.0,
        duration: '45-90 min',
        features: [
          'Rééquilibrage énergétique',
          'Détente profonde',
          'Libération des blocages',
          'Bien-être global',
        ],
      },
      {
        id: 'pendule',
        name: 'Divination au Pendule',
        description: 'Obtenez des réponses précises à vos questions',
        price: 35.0,
        duration: '30-45 min',
        features: [
          'Réponses précises',
          'Art de la radiesthésie',
          'Guidance spirituelle',
          'Clarification des doutes',
        ],
      },
      {
        id: 'guerison',
        name: 'Guérison Énergétique',
        description: 'Soins énergétiques pour libérer les blocages',
        price: 70.0,
        duration: '60-90 min',
        features: [
          'Libération des blocages',
          "Activation de l'auto-guérison",
          'Harmonisation énergétique',
          'Transformation profonde',
        ],
      },
    ];

    defaults.forEach((svc) => {
      this.db.get('SELECT id, features FROM services WHERE id = ?', [svc.id], (err, row) => {
        if (err) {
          console.error('Seed services check error:', err);
          return;
        }
        if (!row) {
          const sql = `INSERT INTO services (id, name, description, price, duration, features, is_active)
                       VALUES (?, ?, ?, ?, ?, ?, 1)`;
          this.db.run(
            sql,
            [
              svc.id,
              svc.name,
              svc.description,
              svc.price,
              svc.duration,
              JSON.stringify(svc.features),
            ],
            (insErr) => {
              if (insErr) console.error('Seed services insert error:', insErr);
              else console.log(`✅ Service seeded: ${svc.id}`);
            }
          );
        } else {
          // Mettre les features si manquants
          const hasFeatures = row.features && String(row.features).trim().length > 0;
          if (!hasFeatures) {
            this.db.run(
              'UPDATE services SET features = ? WHERE id = ?',
              [JSON.stringify(svc.features), svc.id],
              (updErr) => {
                if (updErr) console.error('Seed services update features error:', updErr);
                else console.log(`✅ Service features set: ${svc.id}`);
              }
            );
          }
        }
      });
    });
  }
  all(sql, params = []) {
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