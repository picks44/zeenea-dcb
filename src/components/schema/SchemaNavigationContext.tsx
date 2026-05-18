import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  type ReactNode,
} from 'react'

export type SchemaNavTarget = {
  table: string
  column?: string
}

type TableRegistration = {
  expand: () => void
  root: HTMLElement
  columns: Map<string, HTMLElement>
}

type SchemaNavigationValue = {
  navigateTo: (target: SchemaNavTarget) => void
}

const SchemaNavigationContext = createContext<SchemaNavigationValue | null>(null)
const SchemaNavigationRegistryContext = createContext<
  ((tableName: string, reg: TableRegistration | null) => void) | null
>(null)

function flashElement(el: HTMLElement) {
  el.classList.add('schema-nav-flash')
  const cleanup = () => el.classList.remove('schema-nav-flash')
  el.addEventListener('animationend', cleanup, { once: true })
  window.setTimeout(cleanup, 1500)
}

export function SchemaNavigationProvider({ children }: { children: ReactNode }) {
  const tablesRef = useRef<Map<string, TableRegistration>>(new Map())

  const navigateTo = useCallback((target: SchemaNavTarget) => {
    const reg = tablesRef.current.get(target.table)
    if (!reg) return

    reg.expand()

    window.requestAnimationFrame(() => {
      window.requestAnimationFrame(() => {
        reg.root.scrollIntoView({ behavior: 'smooth', block: 'center' })

        if (target.column) {
          const colEl = reg.columns.get(target.column)
          if (colEl) {
            colEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
            flashElement(colEl)
            return
          }
        }

        flashElement(reg.root)
      })
    })
  }, [])

  const registerTable = useCallback((tableName: string, reg: TableRegistration | null) => {
    if (reg) tablesRef.current.set(tableName, reg)
    else tablesRef.current.delete(tableName)
  }, [])

  const api = useMemo(() => ({ navigateTo }), [navigateTo])

  return (
    <SchemaNavigationContext.Provider value={api}>
      <SchemaNavigationRegistryContext.Provider value={registerTable}>
        {children}
      </SchemaNavigationRegistryContext.Provider>
    </SchemaNavigationContext.Provider>
  )
}

export function useSchemaNavigation() {
  return useContext(SchemaNavigationContext)
}

/** Register a schema table block for relationship navigation targets. */
export function useRegisterSchemaTable(tableName: string, expand: () => void) {
  const registerTable = useContext(SchemaNavigationRegistryContext)
  const columnRefs = useRef<Map<string, HTMLElement>>(new Map())
  const expandRef = useRef(expand)
  expandRef.current = expand

  const setTableRoot = useCallback(
    (node: HTMLElement | null) => {
      if (!registerTable) return
      if (node) {
        registerTable(tableName, {
          expand: () => expandRef.current(),
          root: node,
          columns: columnRefs.current,
        })
      } else {
        registerTable(tableName, null)
      }
    },
    [registerTable, tableName],
  )

  const registerColumn = useCallback((columnName: string, el: HTMLElement | null) => {
    if (el) columnRefs.current.set(columnName, el)
    else columnRefs.current.delete(columnName)
  }, [])

  return { setTableRoot, registerColumn }
}
