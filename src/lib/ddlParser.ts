import { ColumnDefinition, LogicalType, SchemaTable, TableRelationship } from '../types/odcs'
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
  totalSingleFk: number
  totalCompositeFk: number
  tableNames: string[]
}

interface ParsedForeignKey {
  fromColumns: string[]
  toTable: string
  toColumns: string[]
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

/** Join FOREIGN KEY lines split across newlines before REFERENCES. */
function normalizeColumnsBlock(block: string): string {
  return block
    .replace(/\r\n/g, '\n')
    .replace(/\n\s*REFERENCES\s+/gi, ' REFERENCES ')
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

function unquoteIdent(value: string): string {
  const t = value.trim()
  if ((t.startsWith('`') && t.endsWith('`')) || (t.startsWith('"') && t.endsWith('"'))) {
    return t.slice(1, -1)
  }
  if (t.startsWith('[') && t.endsWith(']')) {
    return t.slice(1, -1)
  }
  return t
}

function parseTableRef(ref: string): string {
  return ref.split('.').pop()?.trim() ?? ref.trim()
}

function parseIdentifierList(inner: string): string[] {
  const parts: string[] = []
  let current = ''
  let depth = 0

  for (const char of inner) {
    if (char === '(') depth++
    else if (char === ')') depth--

    if (char === ',' && depth === 0) {
      if (current.trim()) parts.push(unquoteIdent(current))
      current = ''
    } else {
      current += char
    }
  }
  if (current.trim()) parts.push(unquoteIdent(current))
  return parts
}

const TABLE_REF_PATTERN = '(?:`([^`]+)`|"([^"]+)"|\\[([^\\]]+)\\]|([\\w.]+))'

function parseReferencesTail(text: string): { toTable: string; toColumns: string[] } | null {
  const stripped = text
    .replace(/\s+ON\s+DELETE\s+\w+/gi, '')
    .replace(/\s+ON\s+UPDATE\s+\w+/gi, '')
    .trim()

  const match = stripped.match(
    new RegExp(`REFERENCES\\s+${TABLE_REF_PATTERN}\\s*\\(\\s*([^)]+)\\s*\\)`, 'i'),
  )
  if (!match) return null

  const tableRef = match[1] || match[2] || match[3] || match[4]
  const toColumns = parseIdentifierList(match[5])
  if (!tableRef || toColumns.length === 0) return null

  return { toTable: parseTableRef(tableRef), toColumns }
}

function parseForeignKeyConstraint(line: string): ParsedForeignKey | null {
  const normalized = line.replace(/\s+/g, ' ').trim()
  const withoutName = normalized.replace(
    /^CONSTRAINT\s+(?:`[^`]+`|"[^"]+"|\[[^\]]+\]|\w+)\s+/i,
    '',
  )

  const match = withoutName.match(
    new RegExp(
      `FOREIGN\\s+KEY\\s*\\(\\s*([^)]+)\\s*\\)\\s*REFERENCES\\s+${TABLE_REF_PATTERN}\\s*\\(\\s*([^)]+)\\s*\\)`,
      'i',
    ),
  )
  if (!match) return null

  const fromColumns = parseIdentifierList(match[1])
  const tableRef = match[2] || match[3] || match[4] || match[5]
  const toColumns = parseIdentifierList(match[6])
  if (fromColumns.length === 0 || !tableRef || toColumns.length === 0) return null

  return {
    fromColumns,
    toTable: parseTableRef(tableRef),
    toColumns,
  }
}

function isTableConstraintLine(trimmed: string): boolean {
  if (/^PRIMARY\s+KEY\s*\(/i.test(trimmed)) return true
  if (/^FOREIGN\s+KEY/i.test(trimmed)) return true
  if (/^CONSTRAINT\s+/i.test(trimmed)) return true
  if (/^(UNIQUE|CHECK|INDEX|KEY)\b/i.test(trimmed)) return true
  return false
}

function parseColumnLine(trimmed: string): ColumnDefinition | null {
  const colMatch = trimmed.match(
    /^(?:`([^`]+)`|"([^"]+)"|\[([^\]]+)\]|(\w+))\s+([A-Za-z][A-Za-z0-9]*(?:\s*\([^)]*\))?(?:\s+(?:UNSIGNED|ZEROFILL|CHARACTER\s+SET\s+\w+|COLLATE\s+\w+))*)/i,
  )
  if (!colMatch) return null

  const colName = colMatch[1] || colMatch[2] || colMatch[3] || colMatch[4]
  const colType = colMatch[5].trim()
  const rest = trimmed.slice(colMatch[0].length)
  const isNotNull = /NOT\s+NULL/i.test(rest)
  const isPrimaryKey = /PRIMARY\s+KEY/i.test(rest)
  const isUnique = /\bUNIQUE\b/i.test(rest)
  const isRequired = isNotNull || isPrimaryKey

  const { logicalType, isUnknownType } = mapSqlType(colType)

  const column: ColumnDefinition = {
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
  }

  const inlineRef = parseReferencesTail(rest)
  if (inlineRef?.toColumns.length === 1) {
    column.foreignKey = {
      toTable: inlineRef.toTable,
      toColumn: inlineRef.toColumns[0],
    }
  }

  return column
}

function applyForeignKeys(table: SchemaTable, foreignKeys: ParsedForeignKey[]): void {
  const relationships: TableRelationship[] = []

  for (const fk of foreignKeys) {
    if (fk.fromColumns.length === 1 && fk.toColumns.length === 1) {
      const col = table.columns.find(c => c.physicalName === fk.fromColumns[0])
      if (col && !col.foreignKey) {
        col.foreignKey = { toTable: fk.toTable, toColumn: fk.toColumns[0] }
      }
    } else if (fk.fromColumns.length >= 2 && fk.toColumns.length >= 2) {
      relationships.push({
        id: generateId(),
        toTable: fk.toTable,
        type: 'composite_foreign_key',
        fromColumns: fk.fromColumns,
        toColumns: fk.toColumns,
      })
    }
  }

  if (relationships.length > 0) {
    table.relationships = relationships
  }
}

function parseTableDefinition(columnsBlock: string): {
  columns: ColumnDefinition[]
  foreignKeys: ParsedForeignKey[]
} {
  const columns: ColumnDefinition[] = []
  const foreignKeys: ParsedForeignKey[] = []
  const block = normalizeColumnsBlock(columnsBlock)

  for (const line of splitColumnLines(block)) {
    const trimmed = line.trim()
    if (!trimmed) continue

    if (/^CONSTRAINT\s+/i.test(trimmed) && /FOREIGN\s+KEY/i.test(trimmed)) {
      const fk = parseForeignKeyConstraint(trimmed)
      if (fk) foreignKeys.push(fk)
      continue
    }

    if (/^FOREIGN\s+KEY/i.test(trimmed)) {
      const fk = parseForeignKeyConstraint(trimmed)
      if (fk) foreignKeys.push(fk)
      continue
    }

    if (isTableConstraintLine(trimmed)) {
      continue
    }

    const column = parseColumnLine(trimmed)
    if (column) {
      columns.push(column)
    }
  }

  return { columns, foreignKeys }
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
    relationships: [],
  }
}

function countTableRelationships(tables: SchemaTable[]): {
  totalSingleFk: number
  totalCompositeFk: number
} {
  let totalSingleFk = 0
  let totalCompositeFk = 0

  for (const table of tables) {
    for (const col of table.columns) {
      if (col.foreignKey?.toTable?.trim() && col.foreignKey?.toColumn?.trim()) {
        totalSingleFk++
      }
    }
    totalCompositeFk += (table.relationships ?? []).filter(r => r.type === 'composite_foreign_key').length
  }

  return { totalSingleFk, totalCompositeFk }
}

/** Parse every CREATE TABLE in a DDL script. */
export function parseDDLMulti(ddl: string): SchemaTable[] {
  const cleaned = cleanDDL(ddl)
  const tables: SchemaTable[] = []

  const createRegex =
    /CREATE\s+(?:OR\s+REPLACE\s+)?TABLE\s+(?:IF\s+NOT\s+EXISTS\s+)?(?:`([^`]+)`|"([^"]+)"|\[([^\]]+)\]|(\w+(?:\.\w+)*))\s*\(/gi

  let match: RegExpExecArray | null
  while ((match = createRegex.exec(cleaned)) !== null) {
    const tableName = (match[1] || match[2] || match[3] || match[4]).split('.').pop() || 'unknown_table'
    const openParenIndex = match.index + match[0].length - 1
    const columnsBlock = extractParenBlock(cleaned, openParenIndex)
    if (!columnsBlock) continue

    const { columns, foreignKeys } = parseTableDefinition(columnsBlock)
    if (columns.length === 0) continue

    const table = buildTable(tableName, columns)
    applyForeignKeys(table, foreignKeys)
    tables.push(table)
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

  const { totalSingleFk, totalCompositeFk } = countTableRelationships(tables)

  return {
    tables,
    tableCount: tables.length,
    totalColumns,
    totalPk,
    totalRequired,
    totalOptional: totalColumns - totalPk - totalRequired,
    totalSingleFk,
    totalCompositeFk,
    tableNames: tables.map(t => t.physicalName),
  }
}
