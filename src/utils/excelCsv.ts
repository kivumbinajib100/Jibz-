import * as XLSX from 'xlsx';

export interface SheetData {
  sheetName: string;
  headers: string[];
  rows: (string | number | boolean | null | undefined)[][];
}

/**
 * Export data to an Excel workbook (.xlsx) with one or multiple sheets.
 */
export function exportToExcelWorkbook(
  filename: string,
  sheets: SheetData[]
) {
  const wb = XLSX.utils.book_new();

  sheets.forEach((sheet) => {
    const data = [sheet.headers, ...sheet.rows];
    const ws = XLSX.utils.aoa_to_sheet(data);

    // Auto-fit column widths
    const colWidths = sheet.headers.map((header, colIdx) => {
      let maxLen = String(header).length;
      sheet.rows.forEach((row) => {
        const val = row[colIdx];
        if (val !== undefined && val !== null) {
          maxLen = Math.max(maxLen, String(val).length);
        }
      });
      return { wch: Math.min(Math.max(maxLen + 3, 10), 40) };
    });
    ws['!cols'] = colWidths;

    XLSX.utils.book_append_sheet(wb, ws, sheet.sheetName.substring(0, 31));
  });

  const validFilename = filename.endsWith('.xlsx') ? filename : `${filename}.xlsx`;
  XLSX.writeFile(wb, validFilename);
}

/**
 * Read an uploaded Excel (.xlsx, .xls) or CSV file and parse all worksheets into 2D string arrays.
 */
export function parseExcelWorkbook(file: File): Promise<Record<string, string[][]>> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });

        const result: Record<string, string[][]> = {};

        workbook.SheetNames.forEach((sheetName) => {
          const worksheet = workbook.Sheets[sheetName];
          const rawRows = XLSX.utils.sheet_to_json<string[]>(worksheet, {
            header: 1,
            defval: '',
            blankrows: false,
          });

          // Convert all cells to trimmed strings
          const cleanedRows = rawRows
            .map((row) => row.map((cell) => (cell === null || cell === undefined ? '' : String(cell).trim())))
            .filter((row) => row.some((cell) => cell.length > 0));

          result[sheetName] = cleanedRows;
        });

        resolve(result);
      } catch (err) {
        reject(err);
      }
    };

    reader.onerror = (error) => reject(error);
    reader.readAsArrayBuffer(file);
  });
}

/**
 * Export simple CSV (fallback or quick download)
 */
export function exportToCSV(filename: string, headers: string[], rows: (string | number | undefined | null)[][]) {
  exportToExcelWorkbook(filename, [{ sheetName: 'Data', headers, rows }]);
}

export function parseCSV(text: string): string[][] {
  const lines = text.split(/\r\n|\n/);
  const result: string[][] = [];

  for (const line of lines) {
    if (!line.trim()) continue;
    const row: string[] = [];
    let insideQuote = false;
    let entry = '';

    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      if (char === '"' && (i === 0 || line[i - 1] !== '\\')) {
        insideQuote = !insideQuote;
      } else if (char === ',' && !insideQuote) {
        row.push(entry.trim().replace(/^"|"$/g, '').replace(/""/g, '"'));
        entry = '';
      } else {
        entry += char;
      }
    }
    row.push(entry.trim().replace(/^"|"$/g, '').replace(/""/g, '"'));
    result.push(row);
  }

  return result;
}
export function downloadExcelTemplate(entityType: 'students' | 'teachers' | 'classes' | 'subjects' | 'fees' | 'grades') {
  if (entityType === 'students') {
    exportToExcelWorkbook('Students_Import_Template.xlsx', [
      {
        sheetName: 'Students',
        headers: ['Name', 'Gender', 'Class', 'Status', 'Date of Birth', 'Guardian Name', 'Phone', 'Email', 'Address'],
        rows: [
          ['Johnathan Doe', 'Male', 'P1 East', 'active', '2016-04-12', 'Robert Doe', '+256 701 234567', 'robert.doe@example.com', 'Kampala, Central'],
          ['Mary Jane Smith', 'Female', 'P2 West', 'active', '2015-08-20', 'Sarah Smith', '+256 772 987654', 'sarah.smith@example.com', 'Entebbe, Wakiso'],
        ],
      },
    ]);
  } else if (entityType === 'teachers') {
    exportToExcelWorkbook('Teachers_Import_Template.xlsx', [
      {
        sheetName: 'Teachers',
        headers: ['Full Name', 'Gender', 'Primary Subject', 'Status', 'Qualification', 'Phone', 'Email', 'Joined Date'],
        rows: [
          ['Dr. Alexander Wright', 'Male', 'Mathematics', 'active', 'Ph.D. Mathematics Education', '+256 782 112233', 'wright@school.edu', '2021-02-15'],
          ['Mrs. Grace Nakato', 'Female', 'English Language', 'active', 'B.Ed. English Literature', '+256 702 445566', 'nakato@school.edu', '2022-08-01'],
        ],
      },
    ]);
  } else if (entityType === 'classes') {
    exportToExcelWorkbook('Classes_Import_Template.xlsx', [
      {
        sheetName: 'Classes',
        headers: ['Class Name', 'Level', 'Stream', 'Class Teacher', 'Room Number', 'Capacity'],
        rows: [
          ['P3 North', 'Primary 3', 'North', 'Mr. David Mukasa', 'Room 105', 40],
          ['P4 South', 'Primary 4', 'South', 'Ms. Sarah Kiconco', 'Room 108', 38],
        ],
      },
    ]);
  } else if (entityType === 'subjects') {
    exportToExcelWorkbook('Subjects_Import_Template.xlsx', [
      {
        sheetName: 'Subjects',
        headers: ['Subject Code', 'Subject Name', 'Department', 'Category', 'Weekly Periods', 'Pass Mark'],
        rows: [
          ['ICT-101', 'Computer Studies', 'Science & Tech', 'Core', 4, 50],
          ['LIT-201', 'English Literature', 'Languages', 'Elective', 3, 50],
        ],
      },
    ]);
  } else if (entityType === 'fees') {
    exportToExcelWorkbook('Fees_Import_Template.xlsx', [
      {
        sheetName: 'FeeRecords',
        headers: ['Student ID', 'Student Name', 'Class', 'Term', 'Total Amount', 'Paid Amount', 'Due Date', 'Status'],
        rows: [
          ['STU-2026-1001', 'Alex Kisekka', 'P1 East', 'Term 1 2026', 850000, 850000, '2026-03-15', 'paid'],
          ['STU-2026-1002', 'Brenda Namatovu', 'P1 East', 'Term 1 2026', 850000, 400000, '2026-03-15', 'partial'],
        ],
      },
    ]);
  } else if (entityType === 'grades') {
    exportToExcelWorkbook('Grades_Import_Template.xlsx', [
      {
        sheetName: 'AssessmentMarks',
        headers: ['Student ID', 'Student Name', 'Class Stream', 'Subject Name', 'Exam Type', 'Marks (0-100)', 'Teacher Remarks'],
        rows: [
          ['STU-2026-1001', 'Alex Kisekka', 'P6 East', 'Mathematics', 'Mid-Term', 88, 'Excellent problem solving skills'],
          ['STU-2026-1002', 'Brenda Namatovu', 'P6 East', 'English Language', 'Mid-Term', 76, 'Very good comprehension'],
        ],
      },
    ]);
  }
}
