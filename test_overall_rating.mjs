import ExcelJS from 'exceljs';

function normalizeHeader(header) {
    return header
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '_')
        .replace(/^_|_$/g, '');
}

function rowToObject(row, headers) {
    const obj = {};
    row.eachCell({ includeEmpty: true }, (cell, colNumber) => {
        const header = headers[colNumber - 1];
        if (header) {
            let value = cell.value;
            if (value && typeof value === 'object' && 'text' in value) {
                value = value.text;
            } else if (value && typeof value === 'object' && 'richText' in value) {
                value = value.richText.map(rt => rt.text).join('');
            } else if (value && typeof value === 'object' && value instanceof Date) {
                value = value.toISOString();
            }
            obj[header] = value;
        }
    });
    return obj;
}

async function test() {
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.readFile('./Populated_Parity_Template.xlsx');
    const sheet = workbook.getWorksheet('Analysis');
    const rawRow = sheet.getRow(1).values;
    const headers = Array.isArray(rawRow) ? rawRow.slice(1).map(h => normalizeHeader(String(h))) : [];
    
    sheet.eachRow((row, rowNumber) => {
        if (rowNumber === 1) return;
        const obj = rowToObject(row, headers);
        console.log(`Row ${rowNumber}:`, { overall_rating: obj.overall_rating, typeof: typeof obj.overall_rating });
    });
}
test().catch(console.error);
