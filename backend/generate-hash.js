const bcrypt = require('bcryptjs');

// Générer le hash pour "admin123"
const password = 'admin123';
const saltRounds = 10;

bcrypt.hash(password, saltRounds, (err, hash) => {
  if (err) {
    console.error('Erreur:', err);
  } else {
    console.log('Mot de passe:', password);
    console.log('Hash bcrypt:', hash);
    console.log('\nCopiez ce hash dans le schema.sql:');
    console.log(`'${hash}'`);
  }
});