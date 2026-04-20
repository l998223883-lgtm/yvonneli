import * as XLSX from 'xlsx';
import JSZip from 'jszip';

export interface AlternateTitle {
  socCode: string;
  title: string;
  alternateTitle: string;
}

export interface OccupationData {
  socCode: string;
  title: string;
  description: string;
}

export interface JobZoneData {
  socCode: string;
  title: string;
  jobZone: number;
}

export interface EducationData {
  socCode: string;
  title: string;
  elementName: string;
  category: number;
  dataValue: number;
}

export interface KnowledgeData {
  socCode: string;
  title: string;
  elementName: string;
  scaleId: string;
  dataValue: number;
}

export interface WageCrosswalk {
  onetSocCode: string;
  onetSocTitle: string;
  acwiaSocCode: string;
  acwiaSocTitle: string;
}

export interface AppendixAData {
  onetCode: string;
  occupation: string;
  education: string;
}

export interface GeographyData {
  area: string;
  areaName: string;
  stateAb: string;
  state: string;
  countyTownName: string;
}

export interface CrosswalkPlus {
  oesSocCode: string;
  oesSocTitle: string;
  onetCode: string;
  onetTitle: string;
}

export interface WageRecord {
  areaCode: string;
  socCode: string;
  socTitle: string;
  level1: number | null;
  level2: number | null;
  level3: number | null;
  level4: number | null;
  mean: number | null;
}

const dataCache: Record<string, unknown> = {};

async function loadExcel<T>(path: string, parser: (row: unknown[]) => T | null): Promise<T[]> {
  if (dataCache[path]) return dataCache[path] as T[];
  
  const response = await fetch(path);
  const buffer = await response.arrayBuffer();
  const workbook = XLSX.read(buffer, { type: 'array' });
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const raw = XLSX.utils.sheet_to_json(sheet, { header: 1 }) as unknown[][];
  
  const results: T[] = [];
  for (let i = 1; i < raw.length; i++) {
    const parsed = parser(raw[i]);
    if (parsed) results.push(parsed);
  }
  
  dataCache[path] = results;
  return results;
}

async function loadCSV<T>(path: string, parser: (fields: string[]) => T | null): Promise<T[]> {
  if (dataCache[path]) return dataCache[path] as T[];

  const response = await fetch(path);
  const text = await response.text();
  const lines = text.split('\n');

  const results: T[] = [];
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    // Simple CSV parse handling quoted fields
    const fields: string[] = [];
    let field = '';
    let inQuotes = false;
    for (const ch of line) {
      if (ch === '"') { inQuotes = !inQuotes; continue; }
      if (ch === ',' && !inQuotes) { fields.push(field); field = ''; continue; }
      field += ch;
    }
    fields.push(field);
    const parsed = parser(fields);
    if (parsed) results.push(parsed);
  }

  dataCache[path] = results;
  return results;
}

export async function loadAlternateTitles(): Promise<AlternateTitle[]> {
  return loadExcel('/data/Alternate_Titles.xlsx', (row) => {
    if (!row[0] || !row[2]) return null;
    return {
      socCode: String(row[0]),
      title: String(row[1] || ''),
      alternateTitle: String(row[2]),
    };
  });
}

export async function loadOccupationData(): Promise<OccupationData[]> {
  return loadExcel('/data/Occupation_Data.xlsx', (row) => {
    if (!row[0]) return null;
    return {
      socCode: String(row[0]),
      title: String(row[1] || ''),
      description: String(row[2] || ''),
    };
  });
}

export async function loadJobZones(): Promise<JobZoneData[]> {
  return loadExcel('/data/Job_Zones.xlsx', (row) => {
    if (!row[0]) return null;
    return {
      socCode: String(row[0]),
      title: String(row[1] || ''),
      jobZone: Number(row[2]) || 0,
    };
  });
}

export async function loadEducationData(): Promise<EducationData[]> {
  return loadExcel('/data/Education_Training_and_Experience.xlsx', (row) => {
    if (!row[0] || !row[3]) return null;
    return {
      socCode: String(row[0]),
      title: String(row[1] || ''),
      elementName: String(row[3] || ''),
      category: Number(row[6]) || 0,
      dataValue: Number(row[7]) || 0,
    };
  });
}

export async function loadKnowledgeData(): Promise<KnowledgeData[]> {
  return loadExcel('/data/Knowledge.xlsx', (row) => {
    if (!row[0]) return null;
    return {
      socCode: String(row[0]),
      title: String(row[1] || ''),
      elementName: String(row[3] || ''),
      scaleId: String(row[4] || ''),
      dataValue: Number(row[6]) || 0,
    };
  });
}

export async function loadWageCrosswalks(): Promise<WageCrosswalk[]> {
  return loadExcel('/data/Wage_Crosswalks.xlsx', (row) => {
    if (!row[0]) return null;
    return {
      onetSocCode: String(row[0]),
      onetSocTitle: String(row[1] || ''),
      acwiaSocCode: String(row[2] || ''),
      acwiaSocTitle: String(row[3] || ''),
    };
  });
}

export async function loadAppendixA(): Promise<AppendixAData[]> {
  return loadExcel('/data/Appendix_A.xlsx', (row) => {
    if (!row[0]) return null;
    return {
      onetCode: String(row[0]),
      occupation: String(row[1] || ''),
      education: String(row[2] || ''),
    };
  });
}

export async function loadGeography(): Promise<GeographyData[]> {
  return loadCSV('/data/Geography.csv', (fields) => {
    if (!fields[0]) return null;
    return {
      area: fields[0],
      areaName: fields[1] || '',
      stateAb: fields[2] || '',
      state: fields[3] || '',
      countyTownName: fields[4] || '',
    };
  });
}

export async function loadCrosswalkPlus(): Promise<CrosswalkPlus[]> {
  return loadCSV('/data/xwalk_plus.csv', (fields) => {
    if (!fields[0]) return null;
    return {
      oesSocCode: fields[0],
      oesSocTitle: fields[1] || '',
      onetCode: fields[3] || '',
      onetTitle: fields[4] || '',
    };
  });
}

export async function loadOFLCWages(): Promise<WageRecord[]> {
  const cacheKey = '/data/OFLC_Wages_2025-26.zip';
  if (dataCache[cacheKey]) return dataCache[cacheKey] as WageRecord[];

  const response = await fetch(cacheKey);
  const buffer = await response.arrayBuffer();
  const zip = await JSZip.loadAsync(buffer);

  // Find the Excel file inside the zip
  const xlsxFile = Object.keys(zip.files).find(
    name => name.endsWith('.xlsx') || name.endsWith('.xls')
  );
  
  if (!xlsxFile) {
    // Try CSV
    const csvFile = Object.keys(zip.files).find(name => name.endsWith('.csv'));
    if (csvFile) {
      const csvContent = await zip.files[csvFile].async('text');
      return parseWageCSV(csvContent, cacheKey);
    }
    throw new Error('No wage data file found in zip');
  }

  const xlsxBuffer = await zip.files[xlsxFile].async('arraybuffer');
  const workbook = XLSX.read(xlsxBuffer, { type: 'array' });
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const raw = XLSX.utils.sheet_to_json(sheet, { header: 1 }) as unknown[][];

  // Detect column indices from header
  const header = (raw[0] || []).map(h => String(h || '').toLowerCase().trim());
  const areaIdx = header.findIndex(h => h.includes('area') && h.includes('code') || h === 'area_code' || h === 'areacode');
  const socIdx = header.findIndex(h => h.includes('soc') && h.includes('code') || h === 'soc_code' || h === 'soccode');
  const socTitleIdx = header.findIndex(h => h.includes('soc') && h.includes('title') || h === 'soc_title');
  const l1Idx = header.findIndex(h => h.includes('level_1') || h.includes('level1') || h.includes('lev_1') || h === 'pw_level_1');
  const l2Idx = header.findIndex(h => h.includes('level_2') || h.includes('level2') || h.includes('lev_2') || h === 'pw_level_2');
  const l3Idx = header.findIndex(h => h.includes('level_3') || h.includes('level3') || h.includes('lev_3') || h === 'pw_level_3');
  const l4Idx = header.findIndex(h => h.includes('level_4') || h.includes('level4') || h.includes('lev_4') || h === 'pw_level_4');
  const meanIdx = header.findIndex(h => h.includes('mean') || h === 'pw_mean');

  // Fallback: try positional if header detection fails
  const getIdx = (detected: number, fallback: number) => detected >= 0 ? detected : fallback;

  const results: WageRecord[] = [];
  for (let i = 1; i < raw.length; i++) {
    const row = raw[i];
    if (!row || !row[getIdx(areaIdx, 0)]) continue;
    
    const parseWage = (val: unknown): number | null => {
      if (val === null || val === undefined || val === '' || val === '*' || val === '#') return null;
      const n = Number(String(val).replace(/[$,]/g, ''));
      return isNaN(n) ? null : n;
    };

    results.push({
      areaCode: String(row[getIdx(areaIdx, 0)]),
      socCode: String(row[getIdx(socIdx, 1)] || ''),
      socTitle: String(row[getIdx(socTitleIdx, 2)] || ''),
      level1: parseWage(row[getIdx(l1Idx, 3)]),
      level2: parseWage(row[getIdx(l2Idx, 4)]),
      level3: parseWage(row[getIdx(l3Idx, 5)]),
      level4: parseWage(row[getIdx(l4Idx, 6)]),
      mean: parseWage(row[getIdx(meanIdx, 7)]),
    });
  }

  dataCache[cacheKey] = results;
  return results;
}

function parseWageCSV(csvContent: string, cacheKey: string): WageRecord[] {
  const lines = csvContent.split('\n');
  const header = lines[0]?.toLowerCase() || '';
  
  const results: WageRecord[] = [];
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i]?.trim();
    if (!line) continue;
    const fields: string[] = [];
    let field = '';
    let inQuotes = false;
    for (const ch of line) {
      if (ch === '"') { inQuotes = !inQuotes; continue; }
      if (ch === ',' && !inQuotes) { fields.push(field); field = ''; continue; }
      field += ch;
    }
    fields.push(field);

    const parseWage = (val: string): number | null => {
      if (!val || val === '*' || val === '#') return null;
      const n = Number(val.replace(/[$,]/g, ''));
      return isNaN(n) ? null : n;
    };

    if (fields.length >= 7) {
      results.push({
        areaCode: fields[0] || '',
        socCode: fields[1] || '',
        socTitle: fields[2] || '',
        level1: parseWage(fields[3]),
        level2: parseWage(fields[4]),
        level3: parseWage(fields[5]),
        level4: parseWage(fields[6]),
        mean: fields[7] ? parseWage(fields[7]) : null,
      });
    }
  }

  dataCache[cacheKey] = results;
  return results;
}

export function getBachelorPercentage(educationRows: EducationData[], socCode: string): number {
  const eduRows = educationRows.filter(
    e => e.socCode === socCode && e.elementName === 'Required Level of Education'
  );
  const bachelorPlus = eduRows
    .filter(e => e.category >= 6)
    .reduce((sum, e) => sum + e.dataValue, 0);
  return bachelorPlus;
}

/**
 * Look up wages for a specific SOC code and area code.
 */
export function lookupWages(wages: WageRecord[], socCode: string, areaCode: string): WageRecord | undefined {
  // Try exact match first
  let match = wages.find(w => w.socCode === socCode && w.areaCode === areaCode);
  if (match) return match;
  
  // Try truncated SOC code (e.g., 15-1252.00 -> 15-1252)
  const truncated = socCode.replace(/\..*$/, '');
  match = wages.find(w => w.socCode === truncated && w.areaCode === areaCode);
  if (match) return match;

  // Try national level (area code often "99" or "National")
  match = wages.find(w => w.socCode === truncated && (w.areaCode === '99' || w.areaCode.toLowerCase().includes('national')));
  return match;
}

/**
 * Find the area code for a given zip code using geography data.
 * In production, you'd use a zip-to-county lookup; for now we do a fuzzy search.
 */
export function findAreaCode(geography: GeographyData[], zipCode: string): string | null {
  // This is a simplified lookup. In production, you'd have a zip-to-FIPS-to-area mapping.
  // For now, return the first area code found for any match.
  if (!zipCode) return null;
  // Placeholder: return null to signal we need the full zip-to-area mapping
  return null;
}
