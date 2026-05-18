import yaml from 'js-yaml'
import { isRoleRowEmpty, isSlaRowEmpty } from './contractValidation'
import {
  ColumnDefinition,
  DataContract,
  DataContractSnapshot,
  QualityRule,
  SchemaTable,
} from '../types/odcs'

function stripUndefined(obj: Record<string, unknown>): void {
  for (const key of Object.keys(obj)) {
    if (obj[key] === undefined) delete obj[key]
  }
}

function columnQualityRules(col: ColumnDefinition): QualityRule[] {
  if (col.quality?.length) return col.quality
  if (col.qualityRule?.trim()) {
    return [{ id: col.id, type: 'text', description: col.qualityRule.trim() }]
  }
  return []
}

function buildPropertyRelationships(
  table: SchemaTable,
): Map<string, Record<string, unknown>[]> {
  const byColumn = new Map<string, Record<string, unknown>[]>()
  for (const rel of table.relationships ?? []) {
    if (rel.type !== 'belongs_to' || !rel.fromColumn) continue
    const to = rel.toColumn ? `${rel.toTable}.${rel.toColumn}` : rel.toTable
    const entry = { type: 'foreignKey', to }
    const list = byColumn.get(rel.fromColumn) ?? []
    list.push(entry)
    byColumn.set(rel.fromColumn, list)
  }
  return byColumn
}

function buildSchemaRelationships(table: SchemaTable): Record<string, unknown>[] {
  const schemaRels: Record<string, unknown>[] = []
  for (const rel of table.relationships ?? []) {
    if (rel.type === 'many_to_many') {
      schemaRels.push({
        type: 'manyToMany',
        from: [rel.fromColumn ? `${table.physicalName}.${rel.fromColumn}` : table.physicalName],
        to: [rel.toColumn ? `${rel.toTable}.${rel.toColumn}` : rel.toTable],
      })
    }
  }
  return schemaRels
}

function mapProperty(
  col: ColumnDefinition,
  pkPosition: number | undefined,
  propertyRels: Record<string, unknown>[] | undefined,
): Record<string, unknown> {
  const prop: Record<string, unknown> = {
    id: col.id,
    name: col.physicalName,
    physicalName: col.physicalName,
    businessName: col.logicalName?.trim() || undefined,
    physicalType: col.physicalType,
    logicalType: col.logicalType,
    required: col.required || undefined,
    description: col.description?.trim() || undefined,
    unique: col.isUnique || undefined,
  }

  if (col.isPrimaryKey && pkPosition !== undefined) {
    prop.primaryKey = true
    prop.primaryKeyPosition = pkPosition
  }

  if (col.isPII) {
    prop.classification = 'restricted'
  }

  if (col.examples?.trim()) {
    const parts = col.examples.split(',').map(s => s.trim()).filter(Boolean)
    prop.examples = parts.length > 1 ? parts : [col.examples.trim()]
  }

  const quality = columnQualityRules(col)
  if (quality.length > 0) {
    prop.quality = quality.map(q => {
      const rule: Record<string, unknown> = {
        type: 'text',
        description: q.description,
      }
      if (q.name) rule.name = q.name
      if (q.dimension) rule.dimension = q.dimension
      if (q.severity) rule.severity = q.severity
      if (q.businessImpact) rule.businessImpact = q.businessImpact
      stripUndefined(rule)
      return rule
    })
  }

  if (propertyRels?.length) {
    prop.relationships = propertyRels
  }

  stripUndefined(prop)
  return prop
}

function mapSchemaTable(table: SchemaTable): Record<string, unknown> {
  const propertyRelsByCol = buildPropertyRelationships(table)
  let pkIndex = 0

  const properties = table.columns.map(col => {
    const pkPosition = col.isPrimaryKey ? ++pkIndex : undefined
    return mapProperty(col, pkPosition, propertyRelsByCol.get(col.physicalName))
  })

  const schemaObj: Record<string, unknown> = {
    id: table.physicalName,
    name: table.physicalName,
    physicalName: table.physicalName,
    physicalType: table.tableType || 'table',
    description: table.description?.trim() || undefined,
    properties,
  }

  const schemaRels = buildSchemaRelationships(table)
  if (schemaRels.length > 0) {
    schemaObj.relationships = schemaRels
  }

  stripUndefined(schemaObj)
  return schemaObj
}

/** Build an ODCS v3.1.0 document object from the internal contract model. */
export function buildOdcsDocument(contract: DataContract): Record<string, unknown> {
  const doc: Record<string, unknown> = {
    kind: 'DataContract',
    apiVersion: 'v3.1.0',
    id: contract.id || 'my-contract-id',
    version: contract.info.version,
    status: contract.info.status,
    dataProduct: contract.info.title || 'Untitled Contract',
  }

  if (contract.info.domain?.trim()) {
    doc.domain = contract.info.domain.trim()
  }

  if (contract.info.description?.trim()) {
    doc.description = { purpose: contract.info.description.trim() }
  }

  if (contract.info.tags?.length) {
    doc.tags = contract.info.tags
  }

  if (contract.dataset.length > 0) {
    doc.schema = contract.dataset.map(mapSchemaTable)
  }

  const roles = (contract.roles ?? []).filter(r => !isRoleRowEmpty(r))
  if (roles.length > 0) {
    doc.roles = roles.map(r => {
      const entry: Record<string, unknown> = {
        role: r.role,
        access: r.access,
      }
      if (r.description?.trim()) entry.description = r.description.trim()
      return entry
    })
  }

  const sla = (contract.slaProperties ?? []).filter(s => !isSlaRowEmpty(s))
  if (sla.length > 0) {
    doc.slaProperties = sla.map(s => {
      const entry: Record<string, unknown> = {
        property: s.property,
        value: s.value,
      }
      if (s.unit?.trim()) entry.unit = s.unit.trim()
      if (s.element?.trim()) entry.element = s.element.trim()
      if (s.driver?.trim()) entry.driver = s.driver.trim()
      if (s.description?.trim()) entry.description = s.description.trim()
      return entry
    })
  }

  return doc
}

export function generateODCSYaml(contract: DataContract): string {
  return yaml.dump(buildOdcsDocument(contract), {
    indent: 2,
    lineWidth: 120,
    quotingType: '"',
    forceQuotes: false,
    noRefs: true,
  })
}

/** Convert a published snapshot into a minimal contract for YAML generation. */
export function contractFromSnapshot(s: DataContractSnapshot): DataContract {
  const now = new Date().toISOString()
  return {
    uid: 'snapshot',
    dataContractSpecification: '3.1.0',
    id: s.id,
    info: { ...s.info },
    dataset: JSON.parse(JSON.stringify(s.dataset)),
    stakeholders: [...(s.stakeholders ?? [])],
    roles: [...(s.roles ?? [])],
    slaProperties: [...(s.slaProperties ?? [])],
    gitHistory: [],
    openPR: null,
    createdAt: now,
    updatedAt: now,
  }
}

export function snapshotToYaml(s: DataContractSnapshot): string {
  return generateODCSYaml(contractFromSnapshot(s))
}
