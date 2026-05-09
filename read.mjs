import ExcelJS from 'exceljs';

async function main() {
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.readFile('./Full_Schema_Total_Parity_Template (2).xlsx');
    workbook.eachSheet((sheet, id) => {
        const row = sheet.getRow(1);
        const headers = [];
        row.eachCell((cell, colNumber) => {
            headers.push(cell.value);
        });
        console.log(`Sheet: ${sheet.name}`);
        console.log(JSON.stringify(headers));
    });
}

main().catch(console.error);
