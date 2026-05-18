import { ColumnDefinition, LogicalType, SchemaTable } from '../types/odcs'
import { generateId } from './utils'

const SQL_TYPE_MAP: Record<string, { logicalType: LogicalType; label: string }> = {
  varchar: { logicalType: 'string', label: 'Text' },
  nvarchar: { logicalType: 'string', label: 'Text' },
  char: { logicalType: 'string', label: 'Text' },
  nchar: { logicalType: 'string', label: 'Text' },
  text: { logicalType: 'string', label: 'Text' },
  ntext: { logicalType: 'string', label: 'Text' },
  clob: { logicalType: 'string', label: 'Text' },
  string: { logicalType: 'string', label: 'Text' },
  int: { logicalType: 'integer', label: 'Whole Number' },
  integer: { logicalType: 'integer', label: 'Whole Number' },
  bigint: { logicalType: 'integer', label: 'Whole Number' },
  smallint: { logicalType: 'integer', label: 'Whole Number' },
  tinyint: { logicalType: 'integer', label: 'Whole Number' },
  mediumint: { logicalType: 'integer', label: 'Whole Number' },
  serial: { logicalType: 'integer', label: 'Whole Number' },
  bigserial: { logicalType: 'integer', label: 'Whole Number' },
  decimal: { logicalType: 'number', label: 'Decimal Number' },
  numeric: { logicalType: 'number', label: 'Decimal Number' },
  float: { logicalType: 'number', label: 'Decimal Number' },
  float4: { logicalType: 'number', label: 'Decimal Number' },
  float8: { logicalType: 'number', label: 'Decimal Number' },
  double: { logicalType: 'number', label: 'Decimal Number' },
  real: { logicalType: 'number', label: 'Decimal Number' },
  money: { logicalType: 'number', label: 'Decimal Number' },
  timestamp: { logicalType: 'timestamp', label: 'Date & Time' },
  timestamptz: { logicalType: 'timestamp', label: 'Date & Time' },
  datetime: { logicalType: 'timestamp', label: 'Date & Time' },
  datetime2: { logicalType: 'timestamp', label: 'Date & Time' },
  date: { logicalType: 'date', label: 'Date & Time' },
  time: { logicalType: 'timestamp', label: 'Date & Time' },
  boolean: { logicalType: 'boolean', label: 'Yes/No' },
  bool: { logicalType: 'boolean', label: 'Yes/No' },
  bit: { logicalType: 'boolean', label: 'Yes/No' },
  json: { logicalType: 'object', label: 'Object' },
  jsonb: { logicalType: 'object', label: 'Object' },
  uuid: { logicalType: 'string', label: 'Text' },
}

export interface DDLImportSummary {
  tables: SchemaTable[]
  tableCount: number
  totalColumns: number
  totalPk: number
  totalRequired: number
  totalOptional: number
  tableNames: string[]
}

function mapSqlType(sqlType: string): { logicalType: LogicalType; isUnknownType: boolean } {
  const baseType = sqlType.toLowerCase().replace(/\(.*\)/, '').trim()
  const mapping = SQL_TYPE_MAP[baseType]
  if (mapping) {
    return { logicalType: mapping.logicalType, isUnknownType: false }
  }
  return { logicalType: 'string', isUnknownType: true }
}

function formatPhysicalType(rawType: string): string {
  return rawType.toUpperCase()
}

function cleanDDL(ddl: string): string {
  return ddl
    .replace(/--[^\n]*/g, '')
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .trim()
}

function extractParenBlock(text: string, openIndex: number): string | null {
  if (text[openIndex] !== '(') return null
  let depth = 0
  for (let i = openIndex; i < text.length; i++) {
    if (text[i] === '(') depth++
    else if (text[i] === ')') {
      depth--
      if (depth === 0) return text.slice(openIndex + 1, i)
    }
  }
  return null
}

function splitColumnLines(columnsBlock: string): string[] {
  const columnLines: string[] = []
  let depth = 0
  let current = ''

  for (const char of columnsBlock) {
    if (char === '(') depth++
    else if (char === ')') depth--

    if (char === ',' && depth === 0) {
      columnLines.push(current.trim())
      current = ''
    } else {
      current += char
    }
  }
  if (current.trim()) {
    columnLines.push(current.trim())
  }

  return columnLines
}

function parseColumns(columnsBlock: string): ColumnDefinition[] {
  const columns: ColumnDefinition[] = []

  for (const line of splitColumnLines(columnsBlock)) {
    const trimmed = line.trim()
    if (!trimmed) continue

    if (/^(PRIMARY\s+KEY|FOREIGN\s+KEY|UNIQUE|CHECK|INDEX|KEY|CONSTRAINT)/i.test(trimmed)) {
      continue
    }

    const colMatch = trimmed.match(
      /^(?:`([^`]+)`|"([^"]+)"|(\w+))\s+([A-Za-z][A-Za-z0-9]*(?:\s*\([^)]*\))?(?:\s+(?:UNSIGNED|ZEROFILL|CHARACTER\s+SET\s+\w+|COLLATE\s+\w+))*)/i,
    )

    if (!colMatch) continue

    const colName = colMatch[1] || colMatch[2] || colMatch[3]
    const colType = colMatch[4].trim()
    const rest = trimmed.slice(colMatch[0].length)
    const isNotNull = /NOT\s+NULL/i.test(rest)
    const isPrimaryKey = /PRIMARY\s+KEY/i.test(rest)
    const isUnique = /\bUNIQUE\b/i.test(rest)
    const isRequired = isNotNull || isPrimaryKey

    const { logicalType, isUnknownType } = mapSqlType(colType)

    columns.push({
      id: generateId(),
      physicalName: colName,
      logicalName: colName
        .replace(/_/g, ' ')
        .replace(/\b\w/g, c => c.toUpperCase()),
      physicalType: formatPhysicalType(colType),
      logicalType,
      required: isRequired,
      description: '',
      isPrimaryKey,
      isPII: false,
      isUnique,
      examples: [],
      qualityRule: '',
      isUnknownType,
    })
  }

  return columns
}

function buildTable(tableName: string, columns: ColumnDefinition[]): SchemaTable {
  return {
    id: generateId(),
    physicalName: tableName,
    quantumName: tableName
      .replace(/_/g, ' ')
      .replace(/\b\w/g, c => c.toUpperCase()),
    tableType: 'table',
    description: '',
    columns,
    tags: [],
    quality: [],
    authoritativeDefinitions: [],
  }
}

/** Parse every CREATE TABLE in a DDL script. */
export function parseDDLMulti(ddl: string): SchemaTable[] {
  const cleaned = cleanDDL(ddl)
  const tables: SchemaTable[] = []

  const createRegex =
    /CREATE\s+(?:OR\s+REPLACE\s+)?TABLE\s+(?:IF\s+NOT\s+EXISTS\s+)?(?:`([^`]+)`|"([^"]+)"|(\w+(?:\.\w+)*))\s*\(/gi

  let match: RegExpExecArray | null
  while ((match = createRegex.exec(cleaned)) !== null) {
    const tableName = (match[1] || match[2] || match[3]).split('.').pop() || 'unknown_table'
    const openParenIndex = match.index + match[0].length - 1
    const columnsBlock = extractParenBlock(cleaned, openParenIndex)
    if (!columnsBlock) continue

    const columns = parseColumns(columnsBlock)
    if (columns.length === 0) continue

    tables.push(buildTable(tableName, columns))
  }

  return tables
}

/** First CREATE TABLE only (legacy single-table callers). */
export function parseDDL(ddl: string): SchemaTable | null {
  const tables = parseDDLMulti(ddl)
  return tables[0] ?? null
}

export function summarizeDDLImport(tables: SchemaTable[]): DDLImportSummary | null {
  if (tables.length === 0) return null

  let totalPk = 0
  let totalRequired = 0
  let totalColumns = 0

  for (const table of tables) {
    totalColumns += table.columns.length
    for (const col of table.columns) {
      if (col.isPrimaryKey) totalPk++
      else if (col.required) totalRequired++
    }
  }

  return {
    tables,
    tableCount: tables.length,
    totalColumns,
    totalPk,
    totalRequired,
    totalOptional: totalColumns - totalPk - totalRequired,
    tableNames: tables.map(t => t.physicalName),
  }
}
