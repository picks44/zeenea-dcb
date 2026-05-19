import { useLayoutEffect, useRef, type ReactNode } from 'react'
import { useReadinessField } from '@/components/readiness/ReadinessNavigationContext'
import { schemaFieldAnchorId } from '@/lib/readinessAnchors'

const FIELD_PROPERTIES_SELECTOR = '[aria-label="Field properties"]'

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
  const rootRef = useRef<HTMLDivElement | null>(null)
  const { setRef: setReadinessRef } = useReadinessField(
    schemaFieldAnchorId(tableIndex, columnIndex),
    isMissing,
    false,
  )

  useLayoutEffect(() => {
    const root = rootRef.current
    if (!root) return

    const metadataBtn = root.querySelector<HTMLElement>(FIELD_PROPERTIES_SELECTOR)
    if (!metadataBtn) return

    if (isMissing) {
      metadataBtn.setAttribute('data-readiness-control', '')
    } else {
      metadataBtn.removeAttribute('data-readiness-control')
    }

    return () => {
      metadataBtn.removeAttribute('data-readiness-control')
    }
  }, [isMissing, columnName])

  return (
    <div
      ref={el => {
        rootRef.current = el
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
