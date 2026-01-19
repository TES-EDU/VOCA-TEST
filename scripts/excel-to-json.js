import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const XLSX = require('xlsx');
import { join, dirname } from 'path';
import { writeFileSync, readdirSync, existsSync, mkdirSync } from 'fs';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = join(__dirname, '..');
const DATA_TEMPLATE_DIR = join(PROJECT_ROOT, 'data-template');
const OUTPUT_DIR = join(PROJECT_ROOT, 'src', 'data', 'books');

// Ensure output directory exists
if (!existsSync(OUTPUT_DIR)) {
    mkdirSync(OUTPUT_DIR, { recursive: true });
}

const files = readdirSync(DATA_TEMPLATE_DIR).filter(f => f.match(/TES_VOCA_Lv\d+\.xls[xm]/));

console.log(`Found ${files.length} Excel files in ${DATA_TEMPLATE_DIR}`);

files.forEach(file => {
    const levelMatch = file.match(/Lv(\d+)/);
    if (!levelMatch) return;
    const level = parseInt(levelMatch[1]);
    const bookId = `book_${level}`;
    const filePath = join(DATA_TEMPLATE_DIR, file);

    console.log(`Processing Lv.${level} from ${file}...`);

    const workbook = XLSX.readFile(filePath);
    const units = workbook.SheetNames.map((sheetName, i) => {
        const unitNum = i + 1;
        const ws = workbook.Sheets[sheetName];
        // header: 1 returns array of arrays [ [row1], [row2], ... ]
        const rows = XLSX.utils.sheet_to_json(ws, { header: 1 });

        const words = rows.map((row, idx) => {
            // Skip empty rows or rows without a word in first column
            if (!row || row.length === 0 || !row[0]) return null;

            // ID Generation: Level + Unit(2) + Word(2)
            // e.g. Lv1 Unit1 Word1 -> 10101
            const wordId = parseInt(`${level}${String(unitNum).padStart(2, '0')}${String(idx + 1).padStart(2, '0')}`);

            return {
                id: wordId,
                word: String(row[0]).trim(),
                meaning: String(row[1] || '').trim(),
                example: String(row[2] || '').trim(),
                exampleMeaning: String(row[3] || '').trim()
            };
        }).filter(w => w !== null);

        // Remove header row if it exists and looks like a header (e.g., contains 'word' or 'child' if we mistakenly indentified data as header before)
        // Based on inspection, the first row IS data ("child"), so we keep it.

        return {
            id: `unit_${level}_${unitNum}`,
            title: `Unit ${String(unitNum).padStart(2, '0')}`,
            words: words
        };
    });

    const bookData = {
        id: bookId,
        title: `TES Step Up! VOCA Lv.${level}`,
        units: units
    };

    const outputPath = join(OUTPUT_DIR, `level${level}.json`);
    writeFileSync(outputPath, JSON.stringify(bookData, null, 4));
    console.log(`Created ${outputPath} with ${units.length} units`);
});
