import ExcelJS from 'exceljs';

export interface ParsedProject {
    project_name: string;
    [key: string]: any;

    units?: any[];
    amenities?: any[];
    specifications?: any;
    landmarks?: any[];
    commercials?: any[];
    competitors?: any[];
    connectivity?: any;
    visits?: any[];
    leads?: any[];
    developer?: any;
    analysis?: any;
}

export interface FullSchemaUpload {
    projects: ParsedProject[];
    users: any[];
    drafts: any[];
}

function normalizeHeader(header: string): string {
    return header
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '_')
        .replace(/^_|_$/g, '');
}

function rowToObject(row: ExcelJS.Row, headers: string[]): Record<string, any> {
    const obj: Record<string, any> = {};
    row.eachCell({ includeEmpty: true }, (cell, colNumber) => {
        const header = headers[colNumber - 1];
        if (header) {
            let value = cell.value;
            if (value && typeof value === 'object' && 'text' in value) {
                value = (value as any).text;
            } else if (value && typeof value === 'object' && 'richText' in value) {
                value = (value as any).richText.map((rt: any) => rt.text).join('');
            } else if (value && typeof value === 'object' && value instanceof Date) {
                value = value.toISOString();
            }
            obj[header] = value;
        }
    });
    return obj;
}

export async function parseExcelFile(file: File): Promise<FullSchemaUpload> {
    const buffer = await file.arrayBuffer();
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(buffer);

    const projectsMap: Record<string, ParsedProject> = {};
    const users: any[] = [];
    const drafts: any[] = [];

    // 1. Parse Projects Sheet
    const projectsSheet = workbook.getWorksheet('Projects') || workbook.worksheets[0];
    if (projectsSheet) {
        const rawProjectRow = projectsSheet.getRow(1).values;
        const projectHeaders = Array.isArray(rawProjectRow) ? rawProjectRow.slice(1).map(h => normalizeHeader(String(h))) : [];

        projectsSheet.eachRow((row, rowNumber) => {
            if (rowNumber === 1) return;
            const rowData = rowToObject(row, projectHeaders);
            const projName = rowData['project_name']?.toString().trim() || rowData['name']?.toString().trim();
            if (!projName) return;

            projectsMap[projName] = {
                ...rowData,
                project_name: projName,
                units: [],
                amenities: [],
                landmarks: [],
                commercials: [],
                competitors: [],
                visits: [],
                leads: []
            };
        });
    }

    // 2. Parse Relational Sheets
    const relationSheets: Array<{ sheetName: string, relationName: keyof ParsedProject, isArray: boolean }> = [
        { sheetName: 'Units', relationName: 'units', isArray: true },
        { sheetName: 'Amenities', relationName: 'amenities', isArray: true },
        { sheetName: 'Landmarks', relationName: 'landmarks', isArray: true },
        { sheetName: 'Commercials', relationName: 'commercials', isArray: true },
        { sheetName: 'Competitors', relationName: 'competitors', isArray: true },
        { sheetName: 'Visits', relationName: 'visits', isArray: true },
        { sheetName: 'Leads', relationName: 'leads', isArray: true },
        { sheetName: 'Specifications', relationName: 'specifications', isArray: false },
        { sheetName: 'Connectivity', relationName: 'connectivity', isArray: false },
        { sheetName: 'Developer', relationName: 'developer', isArray: false },
        { sheetName: 'Analysis', relationName: 'analysis', isArray: false },
    ];

    for (const { sheetName, relationName, isArray } of relationSheets) {
        const sheet = workbook.getWorksheet(sheetName);
        if (sheet) {
            const rawRow = sheet.getRow(1).values;
            const headers = Array.isArray(rawRow) ? rawRow.slice(1).map(h => normalizeHeader(String(h))) : [];

            sheet.eachRow((row, rowNumber) => {
                if (rowNumber === 1) return;
                const rowData = rowToObject(row, headers);
                const projName = rowData['project_name']?.toString().trim() || rowData['name']?.toString().trim();

                if (projName && projectsMap[projName]) {
                    if (isArray) {
                        (projectsMap[projName][relationName] as any[]).push(rowData);
                    } else {
                        projectsMap[projName][relationName] = rowData;
                    }
                }
            });
        }
    }

    // 3. Parse Independent Sheets (Users, Drafts)
    const usersSheet = workbook.getWorksheet('Users');
    if (usersSheet) {
        const rawRow = usersSheet.getRow(1).values;
        const headers = Array.isArray(rawRow) ? rawRow.slice(1).map(h => normalizeHeader(String(h))) : [];
        usersSheet.eachRow((row, rowNumber) => {
            if (rowNumber === 1) return;
            users.push(rowToObject(row, headers));
        });
    }

    const draftsSheet = workbook.getWorksheet('Drafts');
    if (draftsSheet) {
        const rawRow = draftsSheet.getRow(1).values;
        const headers = Array.isArray(rawRow) ? rawRow.slice(1).map(h => normalizeHeader(String(h))) : [];
        draftsSheet.eachRow((row, rowNumber) => {
            if (rowNumber === 1) return;
            drafts.push(rowToObject(row, headers));
        });
    }

    return {
        projects: Object.values(projectsMap),
        users,
        drafts
    };
}

export async function generateExcelTemplateBlob(): Promise<Blob> {
    const response = await fetch('/api/bulk-upload/mock');
    if (!response.ok) {
        throw new Error('Failed to fetch mock data template');
    }
    return response.blob();
}
