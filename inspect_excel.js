import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const XLSX = require('xlsx');

const file = 'C:\\Users\\82107\\Downloads\\TES_APP\\data-template\\TES_VOCA_Lv1.xlsx';

try {
    const workbook = XLSX.readFile(file);
    console.log('SheetNames:', workbook.SheetNames);

    // Check first sheet
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const json = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

    if (json.length > 0) {
        console.log('Row 0 (Data?):');
        json[0].forEach((val, idx) => {
            console.log(`  [${idx}]: ${val}`);
        });

        if (json.length > 1) {
            console.log('Row 1:');
            json[1].forEach((val, idx) => {
                console.log(`  [${idx}]: ${val}`);
            });
        }
    } else {
        console.log('Sheet is empty');
    }
} catch (error) {
    console.error('Error:', error);
}
