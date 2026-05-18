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

export function parseDDL(ddl: string): SchemaTable | null {
  // Clean up the DDL
  const cleaned = ddl
    .replace(/--[^\n]*/g, '') // Remove single-line comments
    .replace(/\/\*[\s\S]*?\*\//g, '') // Remove multi-line comments
    .trim()

  // Match CREATE TABLE statement
  const createTableMatch = cleaned.match(
    /CREATE\s+(?:OR\s+REPLACE\s+)?TABLE\s+(?:IF\s+NOT\s+EXISTS\s+)?(?:`([^`]+)`|"([^"]+)"|(\w+(?:\.\w+)*))\s*\(([\s\S]+)\)/i
  )

  if (!createTableMatch) {
    return null
  }

  const tableName = (createTableMatch[1] || createTableMatch[2] || createTableMatch[3])
    .split('.')
    .pop() || 'unknown_table'

  const columnsBlock = createTableMatch[4]

  // Split by commas but respect nested parentheses
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

  const columns: ColumnDefinition[] = []

  for (const line of columnLines) {
    const trimmed = line.trim()
    if (!trimmed) continue

    // Skip constraint definitions
    if (/^(PRIMARY\s+KEY|FOREIGN\s+KEY|UNIQUE|CHECK|INDEX|KEY|CONSTRAINT)/i.test(trimmed)) {
      // However, check if primary key is inline in previous columns
      continue
    }

    // Parse column: name type [constraints...]
    const colMatch = trimmed.match(
      /^(?:`([^`]+)`|"([^"]+)"|(\w+))\s+([A-Za-z][A-Za-z0-9]*(?:\s*\([^)]*\))?(?:\s+(?:UNSIGNED|ZEROFILL|CHARACTER\s+SET\s+\w+|COLLATE\s+\w+))*)/i
    )

    if (!colMatch) continue

    const colName = colMatch[1] || colMatch[2] || colMatch[3]
    const colType = colMatch[4].trim()

    // Check constraints in the rest of the line
    const rest = trimmed.slice(colMatch[0].length)
    const isNotNull = /NOT\s+NULL/i.test(rest)
    const isPrimaryKey = /PRIMARY\s+KEY/i.test(rest)
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
      isUnique: false,
      examples: '',
      qualityRule: '',
      isUnknownType,
    })
  }

  if (columns.length === 0) {
    return null
  }

  return {
    physicalName: tableName,
    quantumName: tableName
      .replace(/_/g, ' ')
      .replace(/\b\w/g, c => c.toUpperCase()),
    tableType: 'table',
    description: '',
    columns,
  }
}
