const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

// === Fonctions existantes ===
function getTodayDate() {
    return new Date().toLocaleDateString("fr-FR", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric"
    });
}

function getDaysBeforeNewYear() {
    const today = new Date();
    const newYear = new Date(today.getFullYear() + 1, 0, 1);
    const diff = newYear - today;
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

// === Nouvelle partie : Citation + Emoji + Compteur ===
function getEmoji() {
    const emojis = ["🚀", "🔥", "🌞", "🎉", "✨", "🌈", "💡", "🧠", "🌍", "💻", "☕", "📚", "🌱"];
    return emojis[Math.floor(Math.random() * emojis.length)];
}

function getQuote() {
    try {
        const res = execSync("curl -s https://api.quotable.io/random");
        const data = JSON.parse(res.toString());
        return `${data.content} — ${data.author}`;
    } catch {
        return "Reste motivé et continue — Inconnu";
    }
}

// === Mise à jour du README ===
const readmePath = path.join(__dirname, "..", "README.md");
let readmeContent = fs.readFileSync(readmePath, "utf8");

// Remplacer tes placeholders existants
readmeContent = readmeContent
    .replace("<#today_date>", getTodayDate())
    .replace("<#day_before_new_years>", getDaysBeforeNewYear())
    .replace("<#gabot_signing>", "🤖 Gabot (v1.0)");

// Gérer le compteur de jours
let countMatch = readmeContent.match(/Jour (\d+)/);
let count = countMatch ? parseInt(countMatch[1]) + 1 : 1;

// Construire le nouveau bloc citation
const newQuoteBlock =
`<!--START_QUOTE-->
Jour ${count} ${getEmoji()} - ${getTodayDate()}

💬 "${getQuote()}"
<!--END_QUOTE-->`;

// Remplacer ou insérer la citation
if (readmeContent.includes("<!--START_QUOTE-->")) {
    readmeContent = readmeContent.replace(/<!--START_QUOTE-->[\s\S]*<!--END_QUOTE-->/, newQuoteBlock);
} else {
    readmeContent += "\n\n" + newQuoteBlock;
}

// Sauvegarder
fs.writeFileSync(readmePath, readmeContent, "utf8");

console.log("README mis à jour avec succès !");
