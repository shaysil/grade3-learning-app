
const fs = require('fs');

function check() {
    // English
    try {
        const en = JSON.parse(fs.readFileSync('public/words_en.json', 'utf8'));
        console.log('English Items:', en.length);
        const badEn = en.filter(x => !x.word || !x.options || !Array.isArray(x.options) || typeof x.correct !== 'number');
        console.log('English Invalid Items:', badEn.length);
        if (badEn.length > 0) console.log('Sample Bad En:', JSON.stringify(badEn[0]));
    } catch (e) {
        console.log('English File Error:', e.message);
    }

    // Hebrew
    try {
        const he = JSON.parse(fs.readFileSync('public/words_he.json', 'utf8'));
        console.log('Hebrew Items:', he.length);
        // HebrewMode expects: text, audio_url (optional?), and ideally options/correct_option if strict
        const badHe = he.filter(x => !x.text);
        console.log('Hebrew Invalid Items (no text):', badHe.length);

        // Dedupe check
        const texts = he.map(x => x.text);
        const unique = new Set(texts);
        console.log('Hebrew Unique Texts:', unique.size);
    } catch (e) {
        console.log('Hebrew File Error:', e.message);
    }
}
check();
