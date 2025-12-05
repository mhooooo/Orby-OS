/**
 * CSV Parser Utility
 * Supports UTF-8 encoding for Thai characters
 */

interface ParseOptions {
  headers?: boolean;
  delimiter?: string;
  skipEmptyLines?: boolean;
}

export async function parseCSV<T = Record<string, string>>(
  content: string,
  options: ParseOptions = {}
): Promise<T[]> {
  const {
    headers = false,
    delimiter = ',',
    skipEmptyLines = true,
  } = options;

  const lines = content.split('\n');
  const result: T[] = [];

  let headerRow: string[] = [];
  let startIndex = 0;

  if (headers && lines.length > 0) {
    // First line is headers
    headerRow = parseRow(lines[0], delimiter);
    startIndex = 1;
  }

  for (let i = startIndex; i < lines.length; i++) {
    const line = lines[i].trim();

    if (skipEmptyLines && !line) {
      continue;
    }

    const values = parseRow(line, delimiter);

    if (values.length === 0) {
      continue;
    }

    if (headers && headerRow.length > 0) {
      // Create object with header keys
      const obj: Record<string, string> = {};
      headerRow.forEach((header, idx) => {
        obj[header] = values[idx] || '';
      });
      result.push(obj as T);
    } else {
      // Return raw array
      result.push(values as T);
    }
  }

  return result;
}

/**
 * Parse a single CSV row, handling quoted values and commas within quotes
 */
function parseRow(line: string, delimiter: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    const nextChar = line[i + 1];

    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        // Escaped quote
        current += '"';
        i++; // Skip next quote
      } else {
        // Toggle quote mode
        inQuotes = !inQuotes;
      }
    } else if (char === delimiter && !inQuotes) {
      // End of field
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }

  // Add last field
  result.push(current.trim());

  return result;
}

/**
 * Convert array of objects to CSV string
 */
export function arrayToCSV<T extends Record<string, unknown>>(
  data: T[],
  headers?: string[]
): string {
  if (data.length === 0) {
    return '';
  }

  const keys = headers || Object.keys(data[0]);
  const rows: string[] = [];

  // Add header row
  rows.push(keys.join(','));

  // Add data rows
  for (const item of data) {
    const values = keys.map(key => {
      const value = item[key];
      if (value === null || value === undefined) {
        return '';
      }
      const str = String(value);
      // Quote if contains comma or quotes
      if (str.includes(',') || str.includes('"')) {
        return `"${str.replace(/"/g, '""')}"`;
      }
      return str;
    });
    rows.push(values.join(','));
  }

  return rows.join('\n');
}
