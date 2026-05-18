import type { ReactNode } from 'react'
import { useReadinessField } from '@/components/readiness/ReadinessNavigationContext'
import { schemaFieldAnchorId } from '@/lib/readinessAnchors'

interface SchemaColumnReadinessAnchorProps {
  tableIndex: number
  columnIndex: number
  isMissing: boolean
  registerColumn: (name: string, el: HTMLElement | null) => void
  columnName: string
  className?: string
  children: ReactNode
}

export function SchemaColumnReadinessAnchor({
  tableIndex,
  columnIndex,
  isMissing,
  registerColumn,
  columnName,
  className,
  children,
}: SchemaColumnReadinessAnchorProps) {
  const { setRef: setReadinessRef } = useReadinessField(
    schemaFieldAnchorId(tableIndex, columnIndex),
    isMissing,
    false,
  )

  return (
    <div
      ref={el => {
        registerColumn(columnName, el)
        setReadinessRef(el)
      }}
      data-schema-column={columnName}
      className={className}
    >
      {children}
    </div>
  )
}
