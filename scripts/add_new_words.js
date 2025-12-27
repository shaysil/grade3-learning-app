
const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../public/words_en.json');
const currentData = JSON.parse(fs.readFileSync(filePath, 'utf8'));

// Helper to check case-insensitive duplication
const existingWords = new Set(currentData.map(i => i.word.toLowerCase()));

const newWordsMap = [
    { word: "Mix", trans: "לערבב", sentence: "Mix the colors together." },
    { word: "Cut", trans: "לגזור", sentence: "Cut the paper with scissors." },
    { word: "Color", trans: "לצבוע", sentence: "Color the picture." },
    { word: "On", trans: "על", sentence: "The book is on the table." },
    { word: "Desk", trans: "שולחן כתיבה", sentence: "I sit at my desk." },
    { word: "Chair", trans: "כיסא", sentence: "Sit on the chair." },
    { word: "Open", trans: "לפתוח", sentence: "Open the door please." },
    { word: "Close", trans: "לסגור", sentence: "Close the window." },
    { word: "Door", trans: "דלת", sentence: "Knock on the door." },
    { word: "Board", trans: "לוח", sentence: "Look at the board." },
    { word: "Window", trans: "חלון", sentence: "Look out the window." },
    { word: "Bird", trans: "ציפור", sentence: "The bird can fly." },
    { word: "Under", trans: "מתחת", sentence: "The ball is under the table." },
    { word: "Number", trans: "מספר", sentence: "What is your phone number?" },
    { word: "Table", trans: "שולחן", sentence: "Dinner is on the table." },
    { word: "Cat", trans: "חתול", sentence: "The cat says meow." },
    { word: "Outside", trans: "בחוץ", sentence: "Let's play outside." },
    { word: "Tree", trans: "עץ", sentence: "The bird is in the tree." },
    { word: "In", trans: "בתוך", sentence: "The toys are in the box." },
    { word: "Draw", trans: "לצייר", sentence: "I draw a picture." },
    { word: "Read", trans: "לקרוא", sentence: "I read a book." },
    { word: "Stick", trans: "להדביק", sentence: "Stick the paper with glue." },
    { word: "Write", trans: "לכתוב", sentence: "Write your name." },
    { word: "Tell a story", trans: "לספר סיפור", sentence: "Tell us a story." },
    { word: "Library", trans: "ספרייה", sentence: "We read books in the library." },
    { word: "Computer", trans: "מחשב", sentence: "I play games on the computer." },
    { word: "Party", trans: "מסיבה", sentence: "Happy birthday party!" },
    { word: "Mom", trans: "אמא", sentence: "I love my mom." },
    { word: "Juice", trans: "מיץ", sentence: "I drink orange juice." },
    { word: "Orange", trans: "תפוז", sentence: "The orange is sweet." },
    { word: "Night", trans: "לילה", sentence: "We sleep at night." },
    { word: "Has", trans: "יש ל...", sentence: "She has a new bag." },
    { word: "Take pictures", trans: "לצלם תמונות", sentence: "I take pictures with my camera." }, // Might be dup
    { word: "Go", trans: "ללכת", sentence: "Let's go home." },
    { word: "Wait", trans: "לחכות", sentence: "Wait for the bus." }
];

// Collect all existing Hebrew translations to use as pool for distractors
let allHebrewOptions = [];
currentData.forEach(item => {
    if (item.options) allHebrewOptions.push(...item.options);
});

// Also add our new translations to the pool
newWordsMap.forEach(i => allHebrewOptions.push(i.trans));

// Dedupe pool
allHebrewOptions = [...new Set(allHebrewOptions)];

function getRandomDistractors(correctTrans, count = 3) {
    const distractors = [];
    const pool = allHebrewOptions.filter(x => x !== correctTrans);

    while (distractors.length < count && pool.length > 0) {
        const idx = Math.floor(Math.random() * pool.length);
        distractors.push(pool[idx]);
        pool.splice(idx, 1);
    }
    return distractors;
}

const added = [];
const skipped = [];

newWordsMap.forEach(newItem => {
    if (existingWords.has(newItem.word.toLowerCase())) {
        skipped.push(newItem.word);
        return;
    }

    const distractors = getRandomDistractors(newItem.trans);
    const item = {
        word: newItem.word, // Keep original casing
        options: [newItem.trans, ...distractors], // Correct is always 0 index based on existing file structure logic?
        // Wait, looking at the file:
        // "Pan" -> options=["מחבת", ...], correct: 0.
        // Yes, 0 is correct.
        correct: 0,
        sentence: newItem.sentence
    };
    currentData.push(item);
    added.push(newItem.word);
});

fs.writeFileSync(filePath, JSON.stringify(currentData, null, 2), 'utf8');

console.log(`Added ${added.length} words.`);
console.log(`Skipped ${skipped.length} duplicates: ${skipped.join(', ')}`);
