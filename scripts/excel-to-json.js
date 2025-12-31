/**
 * Excel to JSON Converter for Vocabulary Data
 * 
 * Usage:
 *   node scripts/excel-to-json.js --input="path/to/file.xlsx" --book="book_3" --title="TES Step Up! VOCA Lv.3"
 * 
 * Excel Format:
 *   - Each Sheet = One Unit (Sheet1 = Unit 1, Sheet2 = Unit 2, ...)
 *   - Column A: English word
 *   - Column B: Korean meaning
 *   - Column C: Example sentence
 *   - Column D: Example translation
 */

import XLSX from 'xlsx';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Parse command line arguments
function parseArgs() {
    const args = {};
    process.argv.slice(2).forEach(arg => {
        const [key, value] = arg.replace('--', '').split('=');
        args[key] = value;
    });
    return args;
}

function convertExcelToJson(inputPath, bookId, bookTitle) {
    // Read Excel file
    const workbook = XLSX.readFile(inputPath);

    const units = [];
    const bookNum = bookId.split('_')[1] || '1';

    workbook.SheetNames.forEach((sheetName, index) => {
        const unitNum = index + 1;
        const sheet = workbook.Sheets[sheetName];

        // Convert sheet to JSON array (skip header if exists)
        const rows = XLSX.utils.sheet_to_json(sheet, { header: 1 });

        // Check if first row looks like a header
        const startRow = (rows[0] && typeof rows[0][0] === 'string' &&
            rows[0][0].toLowerCase().includes('word')) ? 1 : 0;

        const words = [];
        for (let i = startRow; i < rows.length; i++) {
            const row = rows[i];
            if (!row || !row[0]) continue; // Skip empty rows

            const wordId = parseInt(`${bookNum}${String(unitNum).padStart(2, '0')}${String(i - startRow + 1).padStart(2, '0')}`);

            words.push({
                id: wordId,
                word: String(row[0] || '').trim(),
                meaning: String(row[1] || '').trim(),
                example: String(row[2] || '').trim(),
                exampleMeaning: String(row[3] || '').trim()
            });
        }

        units.push({
            id: `unit_${bookNum}_${unitNum}`,
            title: `Unit ${String(unitNum).padStart(2, '0')}`,
            words: words
        });
    });

    return {
        id: bookId,
        title: bookTitle,
        units: units
    };
}

function main() {
    const args = parseArgs();

    if (!args.input) {
        console.error('Error: --input is required');
        console.log('Usage: node scripts/excel-to-json.js --input="path/to/file.xlsx" --book="book_3" --title="Book Title"');
        process.exit(1);
    }

    const inputPath = path.resolve(args.input);
    const bookId = args.book || 'book_1';
    const bookTitle = args.title || 'Vocabulary Book';

    if (!fs.existsSync(inputPath)) {
        console.error(`Error: File not found: ${inputPath}`);
        process.exit(1);
    }

    console.log(`Converting: ${inputPath}`);
    console.log(`Book ID: ${bookId}`);
    console.log(`Book Title: ${bookTitle}`);

    try {
        const result = convertExcelToJson(inputPath, bookId, bookTitle);

        // Output filename based on book ID
        const outputDir = path.join(__dirname, '..', 'src', 'data', 'books');
        const outputPath = path.join(outputDir, `${bookId.replace('book_', 'level')}.json`);

        // Ensure output directory exists
        if (!fs.existsSync(outputDir)) {
            fs.mkdirSync(outputDir, { recursive: true });
        }

        // Write JSON file
        fs.writeFileSync(outputPath, JSON.stringify(result, null, 4), 'utf8');

        console.log(`\n✅ Success! Output: ${outputPath}`);
        console.log(`   Units: ${result.units.length}`);
        console.log(`   Total Words: ${result.units.reduce((sum, u) => sum + u.words.length, 0)}`);

    } catch (error) {
        console.error('Error during conversion:', error.message);
        process.exit(1);
    }
}

main();
