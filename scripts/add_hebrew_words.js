const fs = require('fs');
const path = require('path');

const WORDS_FILE = path.join(__dirname, '../public/words_he.json');
const NEW_CONTENT_FILE = path.join(__dirname, '../new_hebrew_content.json');

// Categories based on the known order of insertion in new_hebrew_content.json
const CATEGORIES = {
    'אריה': 'חיות',
    'לחם': 'אוכל',
    'חולצה': 'בגדים',
    'ראש': 'גוף האדם',
    'בית ספר': 'מקומות'
};
let currentCategory = 'כללי';

function getNextId(existingWords) {
    return existingWords.length > 0 ? Math.max(...existingWords.map(w => w.id)) + 1 : 1;
}

function formatSentenceFilename(sentence) {
    // Replace spaces with underscores
    // Remove quotes/special chars if any (basic cleanup)
    // If ends with dot, handle it:
    // The previous analysis suggested "האריה הוא מלך החיות." -> "האריה_הוא_מלך_החיות__he.mp3"
    // So replace space with _, and if dot is at end, replace it with _ too? Or just remove dot and append _?
    // Let's assume standard behavior: replace all non-alphanumeric (hebrew/english) with _?
    // Based on user files, it seems literal replacement of separators.

    let clean = sentence.trim();
    // Replace spaces with _
    clean = clean.replace(/ /g, '_');
    // Replace final dot with _ if it exists, or just append _? 
    // "האריה_הוא_מלך_החיות." -> "האריה_הוא_מלך_החיות_"
    clean = clean.replace(/\./g, '_');

    return `hebSentences/${clean}_he.mp3`;
}

function main() {
    try {
        const existingWords = JSON.parse(fs.readFileSync(WORDS_FILE, 'utf8'));
        const newContent = JSON.parse(fs.readFileSync(NEW_CONTENT_FILE, 'utf8'));
        let nextId = getNextId(existingWords);

        let newEntries = [];

        // Iterate by pairs: Word, then Sentence
        for (let i = 0; i < newContent.length; i += 2) {
            const wordObj = newContent[i];
            const sentObj = newContent[i + 1];

            if (!wordObj || !sentObj) break;

            const wordText = wordObj.text;
            const sentenceText = sentObj.text;

            // Check for category switch
            if (CATEGORIES[wordText]) {
                currentCategory = CATEGORIES[wordText];
            }

            // Generate options (3 random dists)
            // Pool is all existing words + new words added so far
            const allWords = [...existingWords.map(w => w.text), ...newEntries.map(w => w.text)];
            const dists = [];
            while (dists.length < 3) {
                const rand = allWords[Math.floor(Math.random() * allWords.length)];
                if (rand !== wordText && !dists.includes(rand)) {
                    dists.push(rand);
                }
            }

            // Insert correct answer at random position
            const options = [...dists];
            const correctIdx = Math.floor(Math.random() * 4);
            options.splice(correctIdx, 0, wordText);

            const entry = {
                id: nextId++,
                text: wordText,
                category: currentCategory,
                difficulty: 'easy', // Defaulting to easy as per user request for grade 3
                audio_url: `hebWords/${wordText}_he.mp3`,
                sentence_audio_url: formatSentenceFilename(sentenceText),
                options: options,
                correct_option: correctIdx
            };

            newEntries.push(entry);
        }

        const combined = [...existingWords, ...newEntries];
        fs.writeFileSync(WORDS_FILE, JSON.stringify(combined, null, 2), 'utf8');

        console.log(`Added ${newEntries.length} new words to words_he.json`);

    } catch (e) {
        console.error("Error:", e);
    }
}

main();
