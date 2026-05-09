import ExcelJS from 'exceljs';

async function readExcel() {
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.readFile('./Full_Schema_Total_Parity_Template (2).xlsx');
  
  workbook.eachSheet((worksheet, sheetId) => {
    console.log(`\nSheet: ${worksheet.name}`);
    const firstRow = worksheet.getRow(1);
    const headers = [];
    firstRow.eachCell((cell, colNumber) => {
      headers.push(cell.value);
    });
    console.log(headers);
  });
}

readExcel().catch(console.error);
