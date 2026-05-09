import ExcelJS from 'exceljs';

async function test() {
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.readFile('./Populated_Parity_Template.xlsx');
    const sheet = workbook.getWorksheet('Projects');
    console.log("Projects Row count:", sheet.rowCount);
    console.log("Row 1 (headers):", sheet.getRow(1).values);
    console.log("Row 2 (data):", sheet.getRow(2).values);
}
test().catch(console.error);
