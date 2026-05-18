import yaml from 'js-yaml'
import { DataContract, SchemaTable } from '../types/odcs'

function buildRelationshipData(dataset: SchemaTable[]): {
  schemaLevel: Record<string, unknown>[]
  fieldRefs: Map<string, string>
} {
  const schemaLevel: Record<string, unknown>[] = []
  const fieldRefs = new Map<string, string>()
  for (const table of dataset) {
    if (!table.relationships?.length) continue
    for (const rel of table.relationships) {
      if (rel.type === 'many_to_many') {
        schemaLevel.push({
          type: 'manyToMany',
          from: [rel.fromColumn ? `${table.physicalName}.${rel.fromColumn}` : table.physicalName],
          to:   [rel.toColumn   ? `${rel.toTable}.${rel.toColumn}`          : rel.toTable],
        })
      } else if (rel.type === 'belongs_to' && rel.fromColumn) {
        // Single FK → field-level references per ODCS spec
        const ref = rel.toColumn ? `${rel.toTable}.${rel.toColumn}` : rel.toTable
        fieldRefs.set(`${table.physicalName}.${rel.fromColumn}`, ref)
      }
      // has_one / has_many: UI-only convenience types, no ODCS equivalent
    }
  }
  return { schemaLevel, fieldRefs }
}

export function generateODCSYaml(contract: DataContract): string {
  const doc: Record<string, unknown> = {
    dataContractSpecification: contract.dataContractSpecification,
    id: contract.id || 'my-contract-id',
    info: {
      title: contract.info.title || 'Untitled Contract',
      version: contract.info.version,
      status: contract.info.status,
      domain: contract.info.domain || undefined,
      owner: contract.info.owner || undefined,
      description: contract.info.description || undefined,
      tags: contract.info.tags && contract.info.tags.length > 0 ? contract.info.tags : undefined,
    },
  }

  const info = doc.info as Record<string, unknown>
  for (const key of Object.keys(info)) {
    if (info[key] === undefined) delete info[key]
  }

  const { schemaLevel, fieldRefs } = buildRelationshipData(contract.dataset)
  if (schemaLevel.length > 0) doc.relationships = schemaLevel

  if (contract.dataset.length > 0) {
    doc.dataset = contract.dataset.map(table => ({
      table: table.physicalName,
      physicalName: table.physicalName,
      type: table.tableType || 'table',
      description: table.description || undefined,
      columns: table.columns.map(col => {
        const colDoc: Record<string, unknown> = {
          physicalName: col.physicalName,
          logicalName: col.logicalName || undefined,
          physicalType: col.physicalType,
          logicalType: col.logicalType,
          required: col.required || undefined,
          isPrimaryKey: col.isPrimaryKey || undefined,
          isPII: col.isPII || undefined,
          isUnique: col.isUnique || undefined,
          description: col.description || undefined,
          examples: col.examples || undefined,
          qualityRule: col.qualityRule || undefined,
          references: fieldRefs.get(`${table.physicalName}.${col.physicalName}`) || undefined,
        }
        for (const key of Object.keys(colDoc)) {
          if (colDoc[key] === undefined) delete colDoc[key]
        }
        return colDoc
      }),
    }))
  }

  if (contract.stakeholders.length > 0) {
    doc.stakeholders = contract.stakeholders.map(s => ({
      name: s.name,
      role: s.role,
      email: s.email || undefined,
      team: s.team || undefined,
    }))
  }

  return yaml.dump(doc, {
    indent: 2,
    lineWidth: 120,
    quotingType: '"',
    forceQuotes: false,
    noRefs: true,
  })
}
