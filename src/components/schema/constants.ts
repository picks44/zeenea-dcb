import {
  Type, Hash, Percent, ToggleLeft, Calendar, Clock, List, Code2, HelpCircle,
} from 'lucide-react'
import { LogicalType, ColumnDefinition } from '@/types/odcs'
import { generateId } from '@/lib/utils'

export type TypeConfig = {
  value: LogicalType
  pmLabel: string
  techLabel: string
  hint: string
  icon: React.ComponentType<{ className?: string }>
  color: string
  iconBg: string
  iconColor: string
}

// Logical-type chroma is schema-specific and uses Actian token families.
// string → cyan, numeric → blue, boolean → green, date/time → orange,
// structures → neutral, unknown → red.
export const LOGICAL_TYPES: TypeConfig[] = [
  { value: 'string',    pmLabel: 'Text',         techLabel: 'string',    hint: 'Names, emails, sentences', icon: Type,        color: 'bg-blue-50 text-cyan-700 border-cyan-100',          iconBg: 'bg-blue-50',    iconColor: 'text-cyan-700'   },
  { value: 'integer',   pmLabel: 'Whole number', techLabel: 'integer',   hint: '1, 42, -7',                icon: Hash,        color: 'bg-blue-50 text-blue-700 border-blue-100',          iconBg: 'bg-blue-50',    iconColor: 'text-blue-700'   },
  { value: 'number',    pmLabel: 'Decimal',      techLabel: 'number',    hint: '3.14, 19.99, ratio',       icon: Percent,     color: 'bg-blue-100 text-blue-800 border-blue-100',       iconBg: 'bg-blue-100',   iconColor: 'text-blue-800'   },
  { value: 'boolean',   pmLabel: 'Yes / No',     techLabel: 'boolean',   hint: 'True or false',            icon: ToggleLeft,  color: 'bg-green-50 text-green-700 border-green-100',     iconBg: 'bg-green-50',   iconColor: 'text-green-700'  },
  { value: 'date',      pmLabel: 'Date',         techLabel: 'date',      hint: '2024-01-15',               icon: Calendar,    color: 'bg-orange-50 text-orange-700 border-orange-100',  iconBg: 'bg-orange-50',  iconColor: 'text-orange-700' },
  { value: 'timestamp', pmLabel: 'Date & time',  techLabel: 'timestamp', hint: '2024-01-15 14:30',         icon: Clock,       color: 'bg-orange-50 text-orange-700 border-orange-100',  iconBg: 'bg-orange-50',  iconColor: 'text-orange-700' },
  { value: 'array',     pmLabel: 'List',         techLabel: 'array',     hint: 'Multiple values',          icon: List,        color: 'bg-neutral-50 text-neutral-600 border-neutral-200', iconBg: 'bg-neutral-50', iconColor: 'text-neutral-500' },
  { value: 'object',    pmLabel: 'Record',       techLabel: 'object',    hint: 'Nested structure',         icon: Code2,       color: 'bg-neutral-50 text-neutral-600 border-neutral-200', iconBg: 'bg-neutral-50', iconColor: 'text-neutral-500' },
  { value: 'unknown',   pmLabel: 'Unknown',      techLabel: 'unknown',   hint: 'Not recognized',           icon: HelpCircle,  color: 'bg-red-25 text-red-700 border-red-100',             iconBg: 'bg-red-25',     iconColor: 'text-red-700'    },
]

export const DB_TYPES_BY_LOGICAL: Record<LogicalType, string[]> = {
  string:    ['VARCHAR', 'TEXT', 'CHAR', 'NVARCHAR', 'CLOB', 'LONGTEXT'],
  integer:   ['INT', 'INTEGER', 'BIGINT', 'SMALLINT', 'TINYINT'],
  number:    ['DECIMAL', 'NUMERIC', 'FLOAT', 'DOUBLE', 'REAL'],
  boolean:   ['BOOLEAN', 'BIT', 'TINYINT(1)'],
  date:      ['DATE'],
  timestamp: ['TIMESTAMP', 'DATETIME', 'TIMESTAMPTZ'],
  array:     ['JSON', 'JSONB', 'TEXT', 'ARRAY'],
  object:    ['JSON', 'JSONB', 'TEXT', 'HSTORE'],
  unknown:   ['VARCHAR', 'TEXT', 'JSON'],
}

export function typeConfig(t: LogicalType): TypeConfig {
  return LOGICAL_TYPES.find(l => l.value === t) ?? LOGICAL_TYPES[LOGICAL_TYPES.length - 1]
}

export function makeColumn(logicalType: LogicalType = 'string'): ColumnDefinition {
  return {
    id: generateId(), physicalName: '', logicalName: '',
    physicalType: DB_TYPES_BY_LOGICAL[logicalType][0],
    logicalType,
    required: false, isPrimaryKey: false, isPII: false, isUnique: false,
    description: '', examples: [], qualityRule: '', isUnknownType: false,
  }
}
