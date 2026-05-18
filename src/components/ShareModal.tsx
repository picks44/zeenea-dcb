import { useState, useRef, useEffect } from 'react'
import { X, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { DataContract, Collaborator, CollaboratorRole } from '@/types/odcs'
import { cn } from '@/lib/utils'
import { CURRENT_USER } from '@/lib/currentUser'
import { WorkflowMetadataPill } from '@/components/shared/WorkflowMetadataPill'
import {
  CANNOT_REMOVE_OWN_PUBLISHER_ROLE,
  COLLABORATOR_ROLE_LABELS,
  COLLABORATOR_ROLE_OPTIONS,
  COLLABORATORS_ALREADY_INVITED,
  COLLABORATORS_EMPTY_BODY,
  COLLABORATORS_EMPTY_TITLE,
  COLLABORATORS_INTRO,
  COLLABORATORS_MODAL_TITLE,
  SECTION_CONCEPT_APPLICATION_ACCESS,
} from '@/lib/uxCopy'

interface MockUser { id: string; name: string; email: string }

const DIRECTORY: MockUser[] = [
  { id: 'u1', name: 'Alice Martin',   email: 'alice.martin@company.com'   },
  { id: 'u2', name: 'Thomas Bernard', email: 'thomas.bernard@company.com' },
  { id: 'u3', name: 'Sophie Lebrun',  email: 'sophie.lebrun@company.com'  },
]

const AVATAR_PALETTE = [
  'bg-[#ecffff]', 'bg-[#d0efed]', 'bg-[#dde6ec]',
  'bg-[#eed7ff]', 'bg-[#ffd5dd]', 'bg-[#d3efcd]',
  'bg-[#ffdacf]', 'bg-[#ffebce]',
]

function avatarBg(email: string): string {
  let h = 0
  for (let i = 0; i < email.length; i++) h = (h * 31 + email.charCodeAt(i)) | 0
  return AVATAR_PALETTE[Math.abs(h) % AVATAR_PALETTE.length]
}

function getInitials(name: string): string {
  return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
}

function nameFromEmail(email: string): string {
  return email.split('@')[0].split(/[._-]/).map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(' ')
}

const isValidEmail = (s: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s)

interface ShareModalProps {
  contract: DataContract
  open: boolean
  onClose: () => void
  onCollaboratorsChange: (collaborators: Collaborator[]) => void
  canManageMembers: boolean
}

export function ShareModal({ contract, open, onClose, onCollaboratorsChange, canManageMembers }: ShareModalProps) {
  const collaborators = contract.collaborators ?? []
  const [query, setQuery]               = useState('')
  const [selected, setSelected]         = useState<MockUser | null>(null)
  const [inviteRole, setInviteRole]     = useState<CollaboratorRole>('editor')
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [error, setError]               = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) { setQuery(''); setSelected(null); setError(null) }
  }, [open])

  useEffect(() => {
    function onMouseDown(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node) &&
          inputRef.current && !inputRef.current.contains(e.target as Node)) {
        setDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', onMouseDown)
    return () => document.removeEventListener('mousedown', onMouseDown)
  }, [])

  if (!open) return null

  const alreadyInvited = (email: string) => collaborators.some(c => c.email.toLowerCase() === email.toLowerCase())

  const suggestions = DIRECTORY.filter(u =>
    !alreadyInvited(u.email) && (
      query.length === 0 ||
      u.name.toLowerCase().includes(query.toLowerCase()) ||
      u.email.toLowerCase().includes(query.toLowerCase())
    )
  )
  const showEmailOption = query.length > 0 && isValidEmail(query) && !DIRECTORY.some(u => u.email.toLowerCase() === query.toLowerCase())

  const handleSelect = (user: MockUser) => {
    if (alreadyInvited(user.email)) return
    setSelected(user)
    setQuery('')
    setDropdownOpen(false)
    setError(null)
  }

  const handleSelectEmail = () => {
    if (alreadyInvited(query)) { setError(COLLABORATORS_ALREADY_INVITED); return }
    setSelected({ id: '', name: nameFromEmail(query), email: query.trim().toLowerCase() })
    setQuery('')
    setDropdownOpen(false)
    setError(null)
  }

  const handleInvite = () => {
    if (!selected) { setError('Select a person or enter an email address'); return }
    if (alreadyInvited(selected.email)) { setError(COLLABORATORS_ALREADY_INVITED); return }
    const newC: Collaborator = {
      id: crypto.randomUUID(),
      name: selected.name,
      email: selected.email,
      role: inviteRole,
      invitedAt: new Date().toISOString(),
    }
    onCollaboratorsChange([...collaborators, newC])
    setSelected(null)
    setQuery('')
    setError(null)
  }

  const handleRoleChange = (id: string, role: CollaboratorRole) =>
    onCollaboratorsChange(collaborators.map(c => c.id === id ? { ...c, role } : c))

  const handleRemove = (id: string) =>
    onCollaboratorsChange(collaborators.filter(c => c.id !== id))

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={onClose}>
      <div
        className="bg-white rounded-2xl shadow-2xl flex flex-col w-full max-w-md mx-4"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center gap-3 px-5 py-4 border-b border-[#e4e4f0] rounded-t-2xl">
          <div className="flex-1 min-w-0">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-[#9898a7]">
              {SECTION_CONCEPT_APPLICATION_ACCESS}
            </p>
            <p className="text-sm font-semibold text-[#12131f]">{COLLABORATORS_MODAL_TITLE}</p>
            <p className="text-[11px] text-[#656574] mt-0.5 leading-snug">
              {COLLABORATORS_INTRO}{' '}
              <WorkflowMetadataPill variant="workflow-only" />
            </p>
            <p className="text-xs text-[#656574] truncate mt-0.5">{contract.info.title || 'Untitled Contract'}</p>
          </div>
          <Button variant="ghost" size="icon-sm" onClick={onClose} className="flex-shrink-0">
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Invite row — Publishers can manage collaborators */}
        {canManageMembers && <div className="px-5 py-4 border-b border-[#f0f0f7]">
          <div className="flex gap-2">

            {/* Search / chip input */}
            <div className="flex-1 min-w-0 relative">
              {selected ? (
                <div className="flex items-center gap-2 h-9 px-2.5 rounded-lg border border-neutral-200 bg-[#f5f5fa]">
                  <div className={cn('h-5 w-5 rounded-full flex items-center justify-center text-[#12131f] text-[9px] font-medium flex-shrink-0', avatarBg(selected.email))}>
                    {getInitials(selected.name)}
                  </div>
                  <span className="text-xs font-medium text-[#12131f] truncate flex-1">{selected.name}</span>
                  <button onClick={() => { setSelected(null); setQuery(''); setTimeout(() => inputRef.current?.focus(), 0) }} className="text-neutral-400 hover:text-neutral-600 flex-shrink-0">
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ) : (
                <>
                  <div className="relative">
                    <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-neutral-400 pointer-events-none" />
                    <input
                      ref={inputRef}
                      value={query}
                      onChange={e => { setQuery(e.target.value); setDropdownOpen(true); setError(null) }}
                      onFocus={() => setDropdownOpen(true)}
                      onKeyDown={e => { if (e.key === 'Escape') setDropdownOpen(false) }}
                      placeholder="Name or email…"
                      className="h-9 w-full rounded-lg border border-neutral-200 bg-white pl-8 pr-3 text-sm text-[#12131f] placeholder:text-neutral-400 focus:outline-none focus:border-2 focus:border-blue-700 transition-colors"
                    />
                  </div>

                  {dropdownOpen && (suggestions.length > 0 || showEmailOption) && (
                    <div ref={dropdownRef} className="absolute top-full left-0 right-0 mt-1 bg-white border border-neutral-200 rounded-xl shadow-lg z-20 overflow-hidden">
                      {suggestions.map(u => (
                        <button
                          key={u.id}
                          onMouseDown={e => e.preventDefault()}
                          onClick={() => handleSelect(u)}
                          className="flex items-center gap-2.5 w-full px-3 py-2.5 text-left hover:bg-[#f5f5fa] transition-colors"
                        >
                          <div className={cn('h-7 w-7 rounded-full flex items-center justify-center text-[#12131f] text-[10px] font-medium flex-shrink-0', avatarBg(u.email))}>
                            {getInitials(u.name)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-medium text-[#12131f]">{u.name}</p>
                            <p className="text-[10px] text-[#9898a7]">{u.email}</p>
                          </div>
                        </button>
                      ))}
                      {showEmailOption && (
                        <button
                          onMouseDown={e => e.preventDefault()}
                          onClick={handleSelectEmail}
                          className="flex items-center gap-2.5 w-full px-3 py-2.5 text-left hover:bg-[#f5f5fa] transition-colors border-t border-[#f0f0f7]"
                        >
                          <div className="h-7 w-7 rounded-full bg-neutral-100 flex items-center justify-center flex-shrink-0">
                            <Search className="h-3.5 w-3.5 text-neutral-400" />
                          </div>
                          <div>
                            <p className="text-xs font-semibold text-[#12131f]">Invite by email</p>
                            <p className="text-[10px] text-[#9898a7]">{query}</p>
                          </div>
                        </button>
                      )}
                    </div>
                  )}
                </>
              )}
              {error && <p className="text-[11px] text-red-600 mt-1">{error}</p>}
            </div>

            <Select value={inviteRole} onValueChange={v => setInviteRole(v as CollaboratorRole)}>
              <SelectTrigger className="h-9 text-xs w-24 flex-shrink-0">
                <SelectValue>
                    {(v: string) => COLLABORATOR_ROLE_OPTIONS.find(r => r.value === v)?.label ?? v}
                  </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {COLLABORATOR_ROLE_OPTIONS.map(r => (
                  <SelectItem key={r.value} value={r.value} className="text-xs py-2">
                    <span className="font-medium">{r.label}</span>
                    <span className="text-neutral-400 ml-1.5 text-[10px]">{r.desc}</span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button size="sm" onClick={handleInvite} className="h-9 text-xs flex-shrink-0 px-4">
              Add
            </Button>
          </div>
        </div>}

        {/* Collaborator list */}
        <div className="overflow-y-auto max-h-64 rounded-b-2xl">
          {collaborators.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-2 py-10 text-center px-6">
              <p className="text-sm text-[#656574] font-medium">{COLLABORATORS_EMPTY_TITLE}</p>
              <p className="text-xs text-[#9898a7]">{COLLABORATORS_EMPTY_BODY}</p>
            </div>
          ) : (
            <div className="divide-y divide-[#f5f5fa]">
              {collaborators.map(c => {
                const isSelfPublisher = c.email.toLowerCase() === CURRENT_USER.email.toLowerCase() && c.role === 'owner'
                return (
                <div key={c.id} className="flex items-center gap-3 px-5 py-3 hover:bg-[#fbfbff] transition-colors">
                  <div className={cn('h-8 w-8 rounded-full flex items-center justify-center text-[#12131f] text-[11px] font-medium flex-shrink-0', avatarBg(c.email))}>
                    {getInitials(c.name)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-[#12131f] truncate">{c.name}</p>
                    <p className="text-[11px] text-[#9898a7] truncate">{c.email}</p>
                  </div>
                  {canManageMembers ? (
                    <>
                      {isSelfPublisher ? (
                        <span
                          className="h-7 text-[11px] w-20 flex items-center px-2 bg-[#f5f5fa] rounded text-[#9898a7] flex-shrink-0 cursor-not-allowed"
                          title={CANNOT_REMOVE_OWN_PUBLISHER_ROLE}
                        >
                          {COLLABORATOR_ROLE_LABELS.owner}
                        </span>
                      ) : (
                        <Select value={c.role} onValueChange={v => handleRoleChange(c.id, v as CollaboratorRole)}>
                          <SelectTrigger className="h-7 text-[11px] w-20 border-transparent bg-[#f5f5fa] hover:bg-[#eeeef7] flex-shrink-0 px-2">
                            <SelectValue>
                              {(v: string) => COLLABORATOR_ROLE_OPTIONS.find(r => r.value === v)?.label ?? v}
                            </SelectValue>
                          </SelectTrigger>
                          <SelectContent>
                            {COLLABORATOR_ROLE_OPTIONS.map(r => (
                              <SelectItem key={r.value} value={r.value} className="text-xs py-2">
                                <span className="font-medium">{r.label}</span>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                      {!isSelfPublisher && (
                        <button
                          onClick={() => handleRemove(c.id)}
                          className="h-6 w-6 rounded flex items-center justify-center text-[#c4c4d4] hover:text-[#c12c11] hover:bg-[#fff2ee] transition-colors flex-shrink-0"
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </>
                  ) : (
                    <span className="text-[11px] text-[#9898a7] flex-shrink-0">
                      {COLLABORATOR_ROLE_LABELS[c.role] ?? c.role}
                    </span>
                  )}
                </div>
              )})}

            </div>
          )}
        </div>
      </div>
    </div>
  )
}
