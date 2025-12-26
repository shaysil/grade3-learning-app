
const fs = require('fs');
const path = require('path');

const HE_PATH = path.join(__dirname, 'public/words_he.json');
const EN_PATH = path.join(__dirname, 'public/words_en.json');

function sanitize() {
    // 1. Hebrew
    try {
        console.log('Reading Hebrew file...');
        const rawHe = fs.readFileSync(HE_PATH, 'utf8');
        let heData = JSON.parse(rawHe);
        console.log(`Original Hebrew count: ${heData.length}`);

        // Dedupe by text
        const seen = new Set();
        const uniqueHe = [];
        for (const item of heData) {
            if (item.text && !seen.has(item.text)) {
                seen.add(item.text);
                uniqueHe.push(item);
            }
        }
        console.log(`Unique Hebrew count: ${uniqueHe.length}`);

        // Write back with clean formatting
        fs.writeFileSync(HE_PATH, JSON.stringify(uniqueHe, null, 2), 'utf8');
        console.log('Hebrew file sanitized and saved.');
    } catch (e) {
        console.error('Error sanitizing Hebrew file:', e);
    }

    // 2. English
    try {
        console.log('Reading English file...');
        const rawEn = fs.readFileSync(EN_PATH, 'utf8');
        let enData = JSON.parse(rawEn);
        console.log(`Original English count: ${enData.length}`);

        // Just write back to ensure clean UTF-8 and formatting
        fs.writeFileSync(EN_PATH, JSON.stringify(enData, null, 2), 'utf8');
        console.log('English file sanitized and saved.');
    } catch (e) {
        console.error('Error sanitizing English file:', e);
    }
}

sanitize();
