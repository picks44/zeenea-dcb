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

export const LOGICAL_TYPES: TypeConfig[] = [
  { value: 'string',    pmLabel: 'Text',         techLabel: 'string',    hint: 'Names, emails, sentences', icon: Type,        color: 'bg-[#cfeafd] text-[#00699f] border-sky-200',            iconBg: 'bg-[#cfeafd]',   iconColor: 'text-sky-600'      },
  { value: 'integer',   pmLabel: 'Whole number', techLabel: 'integer',   hint: '1, 42, -7',                icon: Hash,        color: 'bg-[#d0e8fd] text-[#0550dc] border-violet-200',         iconBg: 'bg-violet-100',  iconColor: 'text-[#0550dc]'    },
  { value: 'number',    pmLabel: 'Decimal',      techLabel: 'number',    hint: '3.14, 19.99, ratio',       icon: Percent,     color: 'bg-purple-100 text-purple-700 border-purple-200',       iconBg: 'bg-purple-100',  iconColor: 'text-purple-600'   },
  { value: 'boolean',   pmLabel: 'Yes / No',     techLabel: 'boolean',   hint: 'True or false',            icon: ToggleLeft,  color: 'bg-[#d3efcd] text-[#047800] border-emerald-200',        iconBg: 'bg-[#d3efcd]',   iconColor: 'text-[#047800]'    },
  { value: 'date',      pmLabel: 'Date',         techLabel: 'date',      hint: '2024-01-15',               icon: Calendar,    color: 'bg-orange-100 text-orange-700 border-orange-200',       iconBg: 'bg-orange-100',  iconColor: 'text-orange-600'   },
  { value: 'timestamp', pmLabel: 'Date & time',  techLabel: 'timestamp', hint: '2024-01-15 14:30',         icon: Clock,       color: 'bg-[#ffebce] text-[#d27b00] border-[#ffd599]',          iconBg: 'bg-[#ffebce]',   iconColor: 'text-[#d27b00]'    },
  { value: 'array',     pmLabel: 'List',         techLabel: 'array',     hint: 'Multiple values',          icon: List,        color: 'bg-[#f5f5fa] text-[#33333d] border-[#d3d3e5]',          iconBg: 'bg-[#f5f5fa]',   iconColor: 'text-[#3f3f4a]'    },
  { value: 'object',    pmLabel: 'Record',       techLabel: 'object',    hint: 'Nested structure',         icon: Code2,       color: 'bg-[#f5f5fa] text-[#33333d] border-[#d3d3e5]',          iconBg: 'bg-[#f5f5fa]',   iconColor: 'text-[#3f3f4a]'    },
  { value: 'unknown',   pmLabel: 'Unknown',      techLabel: 'unknown',   hint: 'Not recognized',           icon: HelpCircle,  color: 'bg-[#ffdacf] text-[#c12c11] border-rose-200',           iconBg: 'bg-[#fff2ee]',   iconColor: 'text-rose-400'     },
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
    description: '', examples: '', qualityRule: '', isUnknownType: false,
  }
}
