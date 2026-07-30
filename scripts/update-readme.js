const fs = require("fs");
const path = require("path");

const TIME_ZONE = "Africa/Kinshasa";
const START_MARKER = "<!--START_QUOTE-->";
const END_MARKER = "<!--END_QUOTE-->";
const RUNS_MARKER_PATTERN =
    /<!--DAILY_COMMIT_RUNS:(\d{4}-\d{2}-\d{2})\|([a-zA-Z0-9_*,.-]*)-->/;

const emojis = [
    "🚀", "🔥", "🌞", "🎉", "✨", "🌈", "💡",
    "🧠", "🌍", "💻", "☕", "📚", "🌱"
];

const quotes = [
    "Un petit progrès chaque jour construit de grands résultats.",
    "La régularité transforme les idées en réalisations.",
    "Chaque ligne écrite est un pas de plus vers la solution.",
    "Apprendre, essayer, ajuster, puis recommencer.",
    "La constance donne de la force aux bonnes habitudes.",
    "Les grands projets avancent grâce aux petits pas répétés.",
    "Aujourd'hui est une nouvelle occasion de progresser."
];

function getDateParts(date) {
    const parts = new Intl.DateTimeFormat("en-CA", {
        timeZone: TIME_ZONE,
        year: "numeric",
        month: "2-digit",
        day: "2-digit"
    }).formatToParts(date);

    return Object.fromEntries(
        parts
            .filter(({ type }) => type !== "literal")
            .map(({ type, value }) => [type, value])
    );
}

function getIsoDate(date) {
    const { year, month, day } = getDateParts(date);
    return `${year}-${month}-${day}`;
}

function getDisplayDate(date) {
    return new Intl.DateTimeFormat("fr-FR", {
        timeZone: TIME_ZONE,
        year: "numeric",
        month: "long",
        day: "numeric"
    }).format(date);
}

function getDailyIndex(isoDate, collectionLength) {
    const hash = [...isoDate].reduce(
        (total, character) => total + character.charCodeAt(0),
        0
    );

    return hash % collectionLength;
}

function normalizeSlot(slot) {
    return (slot || "manual")
        .trim()
        .replace(/\s+/g, "_")
        .replace(/[^a-zA-Z0-9_*.-]/g, "");
}

function updateReadme(readmeContent, date = new Date(), slot = "manual") {
    const isoDate = getIsoDate(date);
    const normalizedSlot = normalizeSlot(slot);
    const runKey = `${isoDate}|${normalizedSlot}`;
    const previousRuns = readmeContent.match(RUNS_MARKER_PATTERN);
    const completedSlots = previousRuns?.[1] === isoDate
        ? previousRuns[2].split(",").filter(Boolean)
        : [];

    // Une relance du même créneau ne doit pas créer un commit en double.
    if (completedSlots.includes(normalizedSlot)) {
        return { changed: false, content: readmeContent, isoDate, slot: normalizedSlot };
    }

    const updatedSlots = [...completedSlots, normalizedSlot];
    const previousCount = Number(readmeContent.match(/Jour (\d+)/)?.[1] || 0);
    const count = previousCount + 1;
    const dailyIndex = getDailyIndex(runKey, quotes.length);
    const emojiIndex = getDailyIndex(runKey, emojis.length);
    const newQuoteBlock = `${START_MARKER}
<!--DAILY_COMMIT_RUNS:${isoDate}|${updatedSlots.join(",")}-->
Jour ${count} ${emojis[emojiIndex]} - ${getDisplayDate(date)}

💬 "${quotes[dailyIndex]}"
${END_MARKER}`;

    const content = readmeContent.includes(START_MARKER)
        ? readmeContent.replace(
            /<!--START_QUOTE-->[\s\S]*?<!--END_QUOTE-->/,
            newQuoteBlock
        )
        : `${readmeContent.trimEnd()}\n\n${newQuoteBlock}\n`;

    return { changed: content !== readmeContent, content, isoDate, count };
}

function main() {
    const readmePath = path.join(__dirname, "..", "README.md");
    const readmeContent = fs.readFileSync(readmePath, "utf8");
    const slot = process.env.DAILY_COMMIT_SLOT || "manual";
    const result = updateReadme(readmeContent, new Date(), slot);

    if (!result.changed) {
        console.log(
            `README déjà à jour pour le ${result.isoDate}, créneau ${result.slot}.`
        );
        return;
    }

    fs.writeFileSync(readmePath, result.content, "utf8");
    console.log(`README mis à jour pour le ${result.isoDate} (jour ${result.count}).`);
}

if (require.main === module) {
    main();
}

module.exports = { getIsoDate, updateReadme };
