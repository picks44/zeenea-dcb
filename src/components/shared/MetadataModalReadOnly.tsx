import type { ReactNode } from 'react'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import type { ColumnForeignKey, QualityRule } from '@/types/odcs'
import { isColumnForeignKeyComplete } from '@/lib/relationshipExport'
import {
  LABEL_FOREIGN_KEY,
  LABEL_QUALITY_RULES,
  LABEL_REFERENCE_LINKS,
  QUALITY_RULES_EMPTY,
  REFERENCE_LINKS_EMPTY,
} from '@/lib/uxCopy'
import { RelationshipPreviewBlock } from '@/components/shared/RelationshipPreviewBlock'
import { QualityRuleReadOnly } from '@/components/shared/QualityRuleReadOnly'
import { AuthoritativeLinkReadOnly } from '@/components/shared/AuthoritativeLinkReadOnly'
import type { AuthoritativeDefinition } from '@/types/odcsShared'

export function MetadataReadOnlySection({
  label,
  children,
}: {
  label: string
  children: ReactNode
}) {
  return (
    <section>
      <h4 className="text-xs font-medium text-[#33333d] mb-1">{label}</h4>
      {children}
    </section>
  )
}

export function MetadataReadOnlyValue({ value, multiline }: { value: string; multiline?: boolean }) {
  const trimmed = value.trim()
  if (!trimmed) {
    return <p className="text-xs text-[#9898a7] leading-snug">-</p>
  }
  return (
    <p
      className={cn(
        'text-xs text-[#33333d] leading-relaxed',
        multiline && 'whitespace-pre-wrap',
      )}
    >
      {trimmed}
    </p>
  )
}

export function MetadataReadOnlyEmptyLine({ children }: { children: string }) {
  return <p className="text-xs text-[#9898a7] leading-snug">{children}</p>
}

export function MetadataReadOnlyList({ items, emptyLabel }: { items: string[]; emptyLabel: string }) {
  const filtered = items.map(s => s.trim()).filter(Boolean)
  if (filtered.length === 0) {
    return <MetadataReadOnlyEmptyLine>{emptyLabel}</MetadataReadOnlyEmptyLine>
  }
  return (
    <ul className="space-y-0.5">
      {filtered.map((item, i) => (
        <li key={`${i}-${item}`} className="text-xs text-[#33333d] leading-relaxed flex gap-1.5">
          <span className="text-[#9898a7] flex-shrink-0">·</span>
          <span>{item}</span>
        </li>
      ))}
    </ul>
  )
}

export function MetadataReadOnlyTags({ tags, emptyLabel }: { tags: string[]; emptyLabel: string }) {
  const filtered = tags.map(t => t.trim()).filter(Boolean)
  if (filtered.length === 0) {
    return <MetadataReadOnlyEmptyLine>{emptyLabel}</MetadataReadOnlyEmptyLine>
  }
  return (
    <div className="flex flex-wrap gap-1">
      {filtered.map(tag => (
        <Badge key={tag} variant="tag" className="px-1.5 py-0 text-[10px] font-normal leading-4">
          {tag}
        </Badge>
      ))}
    </div>
  )
}

export function MetadataReadOnlyQualityRules({
  rules,
  emptyLabel,
  compact,
}: {
  rules: QualityRule[]
  emptyLabel: string
  compact?: boolean
}) {
  return <QualityRuleReadOnly rules={rules} emptyLabel={emptyLabel} compact={compact} />
}

export function MetadataReadOnlyAuthLinks({
  definitions,
  emptyLabel,
  compact,
}: {
  definitions: AuthoritativeDefinition[]
  emptyLabel: string
  compact?: boolean
}) {
  return (
    <AuthoritativeLinkReadOnly definitions={definitions} emptyLabel={emptyLabel} compact={compact} />
  )
}

interface FieldMetadataReadOnlyProps {
  description: string
  examples: string[]
  tags: string[]
  quality: QualityRule[]
  authDefs: AuthoritativeDefinition[]
  foreignKey?: ColumnForeignKey
  sourceTableName?: string
  sourceColumnName?: string
  docCompact?: boolean
}

export function FieldMetadataReadOnlyBody({
  description,
  examples,
  tags,
  quality,
  authDefs,
  foreignKey,
  sourceTableName,
  sourceColumnName,
  docCompact,
}: FieldMetadataReadOnlyProps) {
  const hasAny =
    description.trim() ||
    examples.some(e => e.trim()) ||
    tags.some(t => t.trim()) ||
    quality.some(r => r.description.trim() || r.name?.trim()) ||
    authDefs.some(d => d.url.trim() || d.type.trim() || (d.description ?? '').trim()) ||
    isColumnForeignKeyComplete(foreignKey)

  if (!hasAny) {
    return (
      <p className="text-xs text-[#9898a7] leading-snug py-1">
        No additional metadata provided.
      </p>
    )
  }

  return (
    <div className="space-y-4">
      <MetadataReadOnlySection label="Description">
        {description.trim() ? (
          <MetadataReadOnlyValue value={description} multiline />
        ) : (
          <MetadataReadOnlyEmptyLine>No description provided.</MetadataReadOnlyEmptyLine>
        )}
      </MetadataReadOnlySection>

      <MetadataReadOnlySection label="Examples">
        <MetadataReadOnlyList items={examples} emptyLabel="No examples provided." />
      </MetadataReadOnlySection>

      <MetadataReadOnlySection label="Tags">
        <MetadataReadOnlyTags tags={tags} emptyLabel="No tags added." />
      </MetadataReadOnlySection>

      <MetadataReadOnlySection label={LABEL_FOREIGN_KEY}>
        {isColumnForeignKeyComplete(foreignKey) && sourceTableName && sourceColumnName ? (
          <RelationshipPreviewBlock
            sourceLine={`${sourceTableName}.${sourceColumnName}`}
            targetLine={`${foreignKey!.toTable}.${foreignKey!.toColumn}`}
            compact={docCompact}
          />
        ) : isColumnForeignKeyComplete(foreignKey) ? (
          <p className="text-xs text-[#33333d] font-mono leading-snug">
            {foreignKey!.toTable}.{foreignKey!.toColumn}
          </p>
        ) : (
          <MetadataReadOnlyEmptyLine>No foreign key configured.</MetadataReadOnlyEmptyLine>
        )}
      </MetadataReadOnlySection>

      <MetadataReadOnlySection label={LABEL_QUALITY_RULES}>
        <MetadataReadOnlyQualityRules
          rules={quality}
          emptyLabel={QUALITY_RULES_EMPTY}
          compact={docCompact}
        />
      </MetadataReadOnlySection>

      <MetadataReadOnlySection label={LABEL_REFERENCE_LINKS}>
        <MetadataReadOnlyAuthLinks
          definitions={authDefs}
          emptyLabel={REFERENCE_LINKS_EMPTY}
          compact={docCompact}
        />
      </MetadataReadOnlySection>
    </div>
  )
}

interface TableMetadataReadOnlyProps {
  schemaId?: string
  tags: string[]
  quality: QualityRule[]
  authDefs: AuthoritativeDefinition[]
  docCompact?: boolean
}

export function TableMetadataReadOnlyBody({ schemaId, tags, quality, authDefs, docCompact }: TableMetadataReadOnlyProps) {
  const hasAny =
    Boolean(schemaId?.trim()) ||
    tags.some(t => t.trim()) ||
    quality.some(r => r.description.trim() || r.name?.trim()) ||
    authDefs.some(d => d.url.trim() || d.type.trim() || (d.description ?? '').trim())

  if (!hasAny) {
    return (
      <p className="text-xs text-[#9898a7] leading-snug py-1">
        No additional metadata provided.
      </p>
    )
  }

  return (
    <div className="space-y-4">
      {schemaId?.trim() && (
        <MetadataReadOnlySection label="Schema ID">
          <p className="font-mono text-xs text-[#33333d]">{schemaId}</p>
        </MetadataReadOnlySection>
      )}

      <MetadataReadOnlySection label="Tags">
        <MetadataReadOnlyTags tags={tags} emptyLabel="No tags added." />
      </MetadataReadOnlySection>

      <MetadataReadOnlySection label={LABEL_QUALITY_RULES}>
        <MetadataReadOnlyQualityRules
          rules={quality}
          emptyLabel={QUALITY_RULES_EMPTY}
          compact={docCompact}
        />
      </MetadataReadOnlySection>

      <MetadataReadOnlySection label={LABEL_REFERENCE_LINKS}>
        <MetadataReadOnlyAuthLinks
          definitions={authDefs}
          emptyLabel={REFERENCE_LINKS_EMPTY}
          compact={docCompact}
        />
      </MetadataReadOnlySection>
    </div>
  )
}
