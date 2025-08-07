// scripts/update-readme.js
const fs = require('fs');
const path = require('path');

// Fonction pour obtenir la date d'aujourd'hui
function getTodayDate() {
    return new Date().toLocaleDateString('fr-FR', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}

// Fonction pour calculer les jours restants avant la nouvelle année
function getDaysBeforeNewYear() {
    const today = new Date();
    const newYear = new Date(today.getFullYear() + 1, 0, 1);
    const diff = newYear - today;
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

// Lire le README
const readmePath = path.join(__dirname, '..', 'README.md');
let readmeContent = fs.readFileSync(readmePath, 'utf8');

// Remplacer les placeholders
readmeContent = readmeContent
    .replace('<#today_date>', getTodayDate())
    .replace('<#day_before_new_years>', getDaysBeforeNewYear())
    .replace('<#gabot_signing>', '🤖 Gabot (v1.0)');

// Réécrire le README
fs.writeFileSync(readmePath, readmeContent);

console.log('README mis à jour avec succès !');