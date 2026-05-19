import { useState, useMemo } from 'react'
import {
  Plus,
  Search,
  ChevronUp,
  ChevronDown,
  ChevronsUpDown,
  FileText,
} from 'lucide-react'
import { LifecycleStatusBadge } from '@/lib/lifecycleStatusUi'
import { Tooltip } from '@/components/ui/tooltip'
import { LIFECYCLE_FILTER_ALL_TOOLTIP, LIFECYCLE_STATUS_TOOLTIPS } from '@/lib/uxCopy'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { EmptyState } from '@/components/ui/empty-state'
import { Input } from '@/components/ui/input'
import { DataContract, LifecycleStatus, CollaboratorRole } from '@/types/odcs'
import { cn } from '@/lib/utils'
import { CURRENT_USER } from '@/lib/currentUser'
import { MEMBER_ROLE_LABELS } from '@/lib/uxCopy'

interface ContractsBacklogProps {
  contracts: DataContract[]
  onSelectContract: (uid: string) => void
  onCreateContract: () => void
}

type SortField = 'title' | 'status' | 'version' | 'owner' | 'domain' | 'updatedAt'
type SortDir = 'asc' | 'desc'

function SortIcon({ field, sortField, sortDir }: { field: SortField; sortField: SortField; sortDir: SortDir }) {
  if (sortField !== field) return <ChevronsUpDown className="h-3 w-3 text-neutral-400 ml-1" />
  return sortDir === 'asc'
    ? <ChevronUp className="h-3 w-3 text-neutral-500 ml-1" />
    : <ChevronDown className="h-3 w-3 text-neutral-500 ml-1" />
}

const PAGE_SIZE = 10

function getMyRole(contract: DataContract): CollaboratorRole {
  if (!contract.collaborators?.length) return 'owner'
  const me = contract.collaborators.find(c => c.email.toLowerCase() === CURRENT_USER.email.toLowerCase())
  return me?.role ?? 'owner'
}

export function ContractsBacklog({ contracts, onSelectContract, onCreateContract }: ContractsBacklogProps) {
  const [search, setSearch] = useState('')
  const [lifecycleFilter, setLifecycleFilter] = useState<'' | LifecycleStatus>('')
  const [sortField, setSortField] = useState<SortField>('updatedAt')
  const [sortDir, setSortDir] = useState<SortDir>('desc')
  const [page, setPage] = useState(1)

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDir('asc')
    }
    setPage(1)
  }

  const filtered = useMemo(() => {
    let result = [...contracts]
    if (search.trim()) {
      const q = search.toLowerCase()
      result = result.filter(c => c.info.title.toLowerCase().includes(q) || c.id.toLowerCase().includes(q))
    }
    if (lifecycleFilter) {
      result = result.filter(c => c.info.status === lifecycleFilter)
    }
    result.sort((a, b) => {
      let aVal = ''
      let bVal = ''
      if (sortField === 'title') { aVal = a.info.title; bVal = b.info.title }
      else if (sortField === 'status') { aVal = a.info.status; bVal = b.info.status }
      else if (sortField === 'version') { aVal = a.info.version; bVal = b.info.version }
      else if (sortField === 'owner') { aVal = a.info.owner; bVal = b.info.owner }
      else if (sortField === 'domain') { aVal = a.info.domain; bVal = b.info.domain }
      else if (sortField === 'updatedAt') { aVal = a.updatedAt; bVal = b.updatedAt }
      const cmp = aVal.localeCompare(bVal)
      return sortDir === 'asc' ? cmp : -cmp
    })
    return result
  }, [contracts, search, lifecycleFilter, sortField, sortDir])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)
  const showStart = filtered.length === 0 ? 0 : (page - 1) * PAGE_SIZE + 1
  const showEnd = Math.min(page * PAGE_SIZE, filtered.length)

  const thClass = 'text-left px-4 py-3 text-[11px] font-semibold uppercase tracking-wide text-neutral-400 cursor-pointer select-none whitespace-nowrap'

  const lifecycleFilters: {
    status: '' | LifecycleStatus
    label: string
    count: number
    variant: 'secondary' | LifecycleStatus
  }[] = [
    { status: '', label: 'All', count: contracts.length, variant: 'secondary' },
    { status: 'draft', label: 'Draft', count: contracts.filter(c => c.info.status === 'draft').length, variant: 'draft' },
    { status: 'active', label: 'Active', count: contracts.filter(c => c.info.status === 'active').length, variant: 'active' },
    { status: 'deprecated', label: 'Deprecated', count: contracts.filter(c => c.info.status === 'deprecated').length, variant: 'deprecated' },
  ]

  return (
    <div className="flex-1 flex flex-col min-w-0 overflow-hidden bg-neutral-25">
      {/* Page header */}
      <div className="bg-white border-b border-neutral-200 px-8 py-5 flex-shrink-0">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-xl font-bold text-neutral-900">Contracts</h1>
              <span className="bg-neutral-50 text-neutral-600 text-xs font-medium px-2 py-0.5 rounded-full">
                {contracts.length}
              </span>
            </div>
            <p className="text-neutral-500 text-sm mt-0.5">
              Manage your data contracts across their lifecycle.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button onClick={onCreateContract} className="gap-1.5 flex-shrink-0">
              <Plus className="h-4 w-4" />
              Create contract
            </Button>
          </div>
        </div>

        {/* Status stats — clickable filters */}
        <div className="mt-4 flex items-center gap-2 flex-wrap">
          {lifecycleFilters.map(item => {
            const filterTooltip = item.status
              ? LIFECYCLE_STATUS_TOOLTIPS[item.status]
              : LIFECYCLE_FILTER_ALL_TOOLTIP
            return (
              <Tooltip key={item.label} content={filterTooltip} side="bottom" delayDuration={400}>
                <button
                  type="button"
                  onClick={() => { setLifecycleFilter(item.status); setPage(1) }}
                  className={cn(
                    'inline-flex rounded transition-shadow cursor-help',
                    lifecycleFilter === item.status && 'ring-2 ring-blue-700 ring-offset-1',
                  )}
                  aria-label={`${item.label} (${item.count}): ${filterTooltip}`}
                >
                  <Badge variant={item.variant} className="gap-1">
                    {item.label}
                    <span className="font-semibold tabular-nums">{item.count}</span>
                  </Badge>
                </button>
              </Tooltip>
            )
          })}
        </div>

        {/* Search row */}
        <div className="mt-3 flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-neutral-400" />
            <Input
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(1) }}
              placeholder="Search contracts by name or ID..."
              className="pl-8 h-8 text-xs w-72"
            />
          </div>
          {(search || lifecycleFilter) && (
            <button
              onClick={() => { setSearch(''); setLifecycleFilter(''); setPage(1) }}
              className="text-xs text-neutral-400 hover:text-neutral-600 underline"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-auto px-8 py-6">
        <div className="bg-white border border-neutral-200 rounded-xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-neutral-25 border-b border-neutral-200">
                  <th className={thClass} onClick={() => handleSort('title')}>
                    <span className="flex items-center">Name <SortIcon field="title" sortField={sortField} sortDir={sortDir} /></span>
                  </th>
                  <th className={thClass} onClick={() => handleSort('status')}>
                    <span className="flex items-center">Status <SortIcon field="status" sortField={sortField} sortDir={sortDir} /></span>
                  </th>
                  <th className={thClass}>My role</th>
                  <th className={thClass} onClick={() => handleSort('version')}>
                    <span className="flex items-center">Version <SortIcon field="version" sortField={sortField} sortDir={sortDir} /></span>
                  </th>
                  <th className={thClass} onClick={() => handleSort('owner')}>
                    <span className="flex items-center">Owner <SortIcon field="owner" sortField={sortField} sortDir={sortDir} /></span>
                  </th>
                  <th className={thClass} onClick={() => handleSort('domain')}>
                    <span className="flex items-center">Domain <SortIcon field="domain" sortField={sortField} sortDir={sortDir} /></span>
                  </th>
                  <th className={thClass}>Fields</th>
                  <th className={thClass}>Tags</th>
                  <th className={thClass} onClick={() => handleSort('updatedAt')}>
                    <span className="flex items-center">Updated <SortIcon field="updatedAt" sortField={sortField} sortDir={sortDir} /></span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {paginated.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="px-4 py-20 text-center">
                      {contracts.length === 0 ? (
                        <EmptyState
                          icon={<FileText className="h-6 w-6" />}
                          title="No contracts yet"
                          description="A data contract describes the structure, ownership, and lifecycle of a dataset. Create your first one to get started."
                          action={{ label: 'Create your first contract', onClick: onCreateContract }}
                        />
                      ) : (
                        <p className="text-neutral-500 text-sm">No contracts match your search.</p>
                      )}
                    </td>
                  </tr>
                ) : (
                  paginated.map(contract => {
                    const fieldCount = contract.dataset.reduce((acc, t) => acc + t.columns.length, 0)
                    const tags = contract.info.tags ?? []
                    const updatedDate = new Date(contract.updatedAt).toLocaleDateString('en-US', {
                      month: 'short', day: 'numeric', year: 'numeric',
                    })
                    return (
                      <tr
                        key={contract.uid}
                        onClick={() => onSelectContract(contract.uid)}
                        className="border-b border-neutral-100 hover:bg-blue-25/40 cursor-pointer transition-colors last:border-b-0"
                      >
                        <td className="px-4 py-3">
                          <div>
                            <span className="font-medium text-neutral-900 text-sm hover:text-blue-700">
                              {contract.info.title || <span className="text-neutral-400 italic">Untitled</span>}
                            </span>
                            {contract.id && (
                              <div className="text-[11px] text-neutral-400 font-mono mt-0.5">{contract.id}</div>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3 align-middle">
                          <LifecycleStatusBadge status={contract.info.status} />
                        </td>
                        <td className="px-4 py-3">
                          {(() => {
                            const role = getMyRole(contract)
                            const variant = { owner: 'owner', editor: 'contributor', viewer: 'consumer' }[role] as 'owner' | 'contributor' | 'consumer'
                            const label   = MEMBER_ROLE_LABELS[role]
                            return <Badge variant={variant}>{label}</Badge>
                          })()}
                        </td>
                        <td className="px-4 py-3">
                          <Badge variant="version">v{contract.info.version}</Badge>
                        </td>
                        <td className="px-4 py-3 text-xs text-neutral-600">
                          {contract.info.owner || <span className="text-neutral-400">—</span>}
                        </td>
                        <td className="px-4 py-3 text-xs text-neutral-600">
                          {contract.info.domain || <span className="text-neutral-400">—</span>}
                        </td>
                        <td className="px-4 py-3 text-xs text-neutral-600 text-center">
                          {fieldCount > 0 ? fieldCount : <span className="text-neutral-400">—</span>}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex flex-wrap gap-1">
                            {tags.slice(0, 3).map(tag => (
                              <Badge key={tag} variant="tag">{tag}</Badge>
                            ))}
                            {tags.length > 3 && (
                              <span className="text-neutral-400 text-[10px]">+{tags.length - 3}</span>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-xs text-neutral-500 whitespace-nowrap">{updatedDate}</td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {filtered.length > 0 && (
            <div className="px-4 py-3 border-t border-neutral-100 flex items-center justify-between">
              <span className="text-xs text-neutral-500">
                Showing {showStart}–{showEnd} of {filtered.length}
              </span>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-2 py-1 text-xs text-neutral-500 hover:text-neutral-600 disabled:opacity-40 disabled:cursor-not-allowed border border-neutral-200 rounded hover:bg-neutral-25 transition-colors"
                >
                  Prev
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter(p => p === 1 || p === totalPages || Math.abs(p - page) <= 1)
                  .reduce<(number | '...')[]>((acc, p, i, arr) => {
                    if (i > 0 && typeof arr[i - 1] === 'number' && (p as number) - (arr[i - 1] as number) > 1) {
                      acc.push('...')
                    }
                    acc.push(p)
                    return acc
                  }, [])
                  .map((p, i) =>
                    p === '...' ? (
                      <span key={`ellipsis-${i}`} className="px-1 text-neutral-400 text-xs">…</span>
                    ) : (
                      <button
                        key={p}
                        onClick={() => setPage(p as number)}
                        className={cn(
                          'px-2 py-1 text-xs rounded border transition-colors',
                          page === p
                            ? 'bg-blue-700 text-white border-blue-700'
                            : 'text-neutral-500 border-neutral-200 hover:bg-neutral-25 hover:text-neutral-600'
                        )}
                      >
                        {p}
                      </button>
                    )
                  )}
                <button
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="px-2 py-1 text-xs text-neutral-500 hover:text-neutral-600 disabled:opacity-40 disabled:cursor-not-allowed border border-neutral-200 rounded hover:bg-neutral-25 transition-colors"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
