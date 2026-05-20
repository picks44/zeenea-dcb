import type { ColumnDefinition, ColumnForeignKey, SchemaTable, TableRelationship } from '@/types/odcs'

function replaceName(value: string, oldName: string, newName: string): string {
  return value === oldName ? newName : value
}

function replaceInList(list: string[] | undefined, oldName: string, newName: string): string[] | undefined {
  if (!list?.length) return list
  const next = list.map(v => replaceName(v, oldName, newName))
  return next.some((v, i) => v !== list[i]) ? next : list
}

type ColumnRename = { table: string; oldName: string; newName: string }

function patchForeignKeyWithRenames(
  fk: ColumnForeignKey | undefined,
  tableRenames: Map<string, string>,
  columnRenames: ColumnRename[],
  deletedTables: Set<string>,
  deletedColumns: Map<string, Set<string>>,
): ColumnForeignKey | undefined {
  if (!fk) return undefined
  let toTable = tableRenames.get(fk.toTable) ?? fk.toTable
  if (deletedTables.has(toTable)) return undefined
  let toColumn = fk.toColumn
  for (const r of columnRenames) {
    if (r.table === toTable) toColumn = replaceName(toColumn, r.oldName, r.newName)
  }
  const deletedCols = deletedColumns.get(toTable)
  if (deletedCols?.has(toColumn)) return undefined
  if (toTable === fk.toTable && toColumn === fk.toColumn) return fk
  return { toTable, toColumn }
}

function patchRelationship(
  rel: TableRelationship,
  sourceTable: string,
  tableRenames: Map<string, string>,
  columnRenames: ColumnRename[],
  deletedTables: Set<string>,
  deletedColumns: Map<string, Set<string>>,
): TableRelationship | null {
  let toTable = tableRenames.get(rel.toTable) ?? rel.toTable
  if (deletedTables.has(toTable)) return null

  let fromColumn = rel.fromColumn
  let toColumn = rel.toColumn
  let fromColumns = rel.fromColumns
  let toColumns = rel.toColumns

  for (const r of columnRenames) {
    if (r.table === sourceTable) {
      fromColumn = fromColumn ? replaceName(fromColumn, r.oldName, r.newName) : fromColumn
      fromColumns = replaceInList(fromColumns, r.oldName, r.newName)
    }
    if (r.table === toTable) {
      toColumn = toColumn ? replaceName(toColumn, r.oldName, r.newName) : toColumn
      toColumns = replaceInList(toColumns, r.oldName, r.newName)
    }
  }

  const sourceDeleted = deletedColumns.get(sourceTable)
  if (fromColumn && sourceDeleted?.has(fromColumn)) fromColumn = undefined
  if (fromColumns?.length && sourceDeleted) {
    fromColumns = fromColumns.filter(c => !sourceDeleted.has(c))
  }

  const targetDeleted = deletedColumns.get(toTable)
  if (toColumn && targetDeleted?.has(toColumn)) toColumn = undefined
  if (toColumns?.length && targetDeleted) {
    toColumns = toColumns.filter(c => !targetDeleted.has(c))
  }

  if (rel.type === 'composite_foreign_key' || (fromColumns?.length ?? 0) >= 2 || (toColumns?.length ?? 0) >= 2) {
    const from = (fromColumns ?? []).filter(Boolean)
    const to = (toColumns ?? []).filter(Boolean)
    if (from.length < 2 || to.length < 2) return null
  }

  if (rel.type === 'belongs_to' && (!fromColumn?.trim() || !toColumn?.trim())) {
    return null
  }

  const changed =
    toTable !== rel.toTable
    || fromColumn !== rel.fromColumn
    || toColumn !== rel.toColumn
    || fromColumns !== rel.fromColumns
    || toColumns !== rel.toColumns

  if (!changed) return rel

  const next: TableRelationship = { ...rel, toTable }
  if (fromColumn?.trim()) next.fromColumn = fromColumn
  else delete next.fromColumn
  if (toColumn?.trim()) next.toColumn = toColumn
  else delete next.toColumn
  if (fromColumns?.length) next.fromColumns = fromColumns
  else delete next.fromColumns
  if (toColumns?.length) next.toColumns = toColumns
  else delete next.toColumns
  return next
}

function patchTable(
  table: SchemaTable,
  tableRenames: Map<string, string>,
  columnRenames: ColumnRename[],
  deletedTables: Set<string>,
  deletedColumns: Map<string, Set<string>>,
): SchemaTable {
  const columns: ColumnDefinition[] = table.columns.map(col => {
    const fk = patchForeignKeyWithRenames(
      col.foreignKey,
      tableRenames,
      columnRenames,
      deletedTables,
      deletedColumns,
    )
    if (fk === col.foreignKey) return col
    return { ...col, foreignKey: fk }
  })

  const relationships = (table.relationships ?? [])
    .map(rel =>
      patchRelationship(
        rel,
        table.physicalName,
        tableRenames,
        columnRenames,
        deletedTables,
        deletedColumns,
      ),
    )
    .filter((r): r is TableRelationship => r !== null)

  const relsChanged =
    columns.some((c, i) => c !== table.columns[i])
    || relationships.length !== (table.relationships ?? []).length
    || relationships.some((r, i) => r !== (table.relationships ?? [])[i])

  if (!relsChanged) return table
  return { ...table, columns, relationships }
}

function detectColumnRenames(prev: SchemaTable, next: SchemaTable): ColumnRename[] {
  const renames: ColumnRename[] = []
  for (const col of next.columns) {
    const prevCol = prev.columns.find(c => c.id === col.id)
    if (prevCol && prevCol.physicalName !== col.physicalName) {
      renames.push({
        table: next.physicalName,
        oldName: prevCol.physicalName,
        newName: col.physicalName,
      })
    }
  }
  return renames
}

function detectDeletedColumns(prev: SchemaTable, next: SchemaTable): string[] {
  const nextIds = new Set(next.columns.map(c => c.id))
  return prev.columns.filter(c => !nextIds.has(c.id)).map(c => c.physicalName)
}

/** Apply reference sync after a single table update (rename / column changes). */
export function syncDatasetAfterTableUpdate(
  tables: SchemaTable[],
  tableIndex: number,
  prevTable: SchemaTable,
  updatedTable: SchemaTable,
): SchemaTable[] {
  const tableRenames = new Map<string, string>()
  if (prevTable.physicalName !== updatedTable.physicalName) {
    tableRenames.set(prevTable.physicalName, updatedTable.physicalName)
  }

  const columnRenames = detectColumnRenames(prevTable, updatedTable)
  const deletedColumns = new Map<string, Set<string>>()
  const deleted = detectDeletedColumns(prevTable, updatedTable)
  if (deleted.length > 0) {
    deletedColumns.set(updatedTable.physicalName, new Set(deleted))
  }

  if (tableRenames.size === 0 && columnRenames.length === 0 && deletedColumns.size === 0) {
    const next = [...tables]
    next[tableIndex] = updatedTable
    return next
  }

  const deletedTables = new Set<string>()
  return tables.map((t, i) => {
    const base = i === tableIndex ? updatedTable : t
    return patchTable(base, tableRenames, columnRenames, deletedTables, deletedColumns)
  })
}

/** Remove inbound references to a deleted table across the remaining dataset. */
export function syncDatasetAfterTableDelete(
  tables: SchemaTable[],
  deletedTablePhysicalName: string,
): SchemaTable[] {
  const deletedTables = new Set([deletedTablePhysicalName])
  const deletedColumns = new Map<string, Set<string>>()
  const emptyRenames: ColumnRename[] = []
  const emptyTableRenames = new Map<string, string>()

  return tables.map(t => patchTable(t, emptyTableRenames, emptyRenames, deletedTables, deletedColumns))
}

/** Returns true when a column FK points at a missing table or column. */
export function isForeignKeyTargetMissing(
  fk: ColumnForeignKey | undefined,
  allTables: SchemaTable[],
): boolean {
  if (!fk?.toTable?.trim() || !fk?.toColumn?.trim()) return false
  const target = allTables.find(t => t.physicalName === fk.toTable)
  if (!target) return true
  return !target.columns.some(c => c.physicalName === fk.toColumn)
}
