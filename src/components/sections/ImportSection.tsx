import { useState, useRef } from 'react'
import { Upload, AlertCircle, Sparkles, Table2, Columns3, KeyRound, Asterisk, Check, Link2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { parseDDLMulti, summarizeDDLImport } from '@/lib/ddlParser'
import { SchemaTable } from '@/types/odcs'
import { cn } from '@/lib/utils'
import { IMPORT_SECTION_INTRO, IMPORT_START_FROM_SCRATCH } from '@/lib/uxCopy'
import demoExampleDdl from '../../../demo.sql?raw'

type ImportSectionLayout = 'default' | 'creation'

interface ImportSectionProps {
  onParsed: (tables: SchemaTable[], ddl: string) => void
  onStartFromScratch?: () => void
  isLocked: boolean
  layout?: ImportSectionLayout
}

const IMPORT_STEPS = ['Parsing schema', 'Mapping fields', 'Applying types']

export function ImportSection({
  onParsed,
  onStartFromScratch,
  isLocked,
  layout = 'default',
}: ImportSectionProps) {
  const isCreation = layout === 'creation'
  const [ddl, setDdl]               = useState('')
  const [error, setError]           = useState<string | null>(null)
  const [isDragOver, setIsDragOver] = useState(false)
  const [phase, setPhase]               = useState<'idle' | 'loading' | 'success'>('idle')
  const [importProgress, setImportProgress] = useState(0)
  const [progressDuration, setProgressDuration] = useState(0)
  const [importStep, setImportStep]     = useState(0)
  const pendingImport = useRef<{ tables: SchemaTable[]; ddl: string } | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  const preview = ddl.trim() ? summarizeDDLImport(parseDDLMulti(ddl)) : null

  const handleParse = () => {
    setError(null)
    if (!ddl.trim()) { setError('Paste a SQL CREATE TABLE statement first.'); return }
    if (!preview) {
      setError("Couldn't read this SQL. Make sure it contains a valid CREATE TABLE statement.")
      return
    }
    pendingImport.current = { tables: preview.tables, ddl }
    setPhase('loading')
    setImportStep(0)
    setImportProgress(0)
    setProgressDuration(0)

    requestAnimationFrame(() => requestAnimationFrame(() => {
      setProgressDuration(1050)
      setImportProgress(34)
    }))

    setTimeout(() => setImportStep(1), 1400)
    setTimeout(() => { setProgressDuration(900); setImportProgress(67) }, 1550)

    setTimeout(() => setImportStep(2), 2700)
    setTimeout(() => { setProgressDuration(1150); setImportProgress(100) }, 2850)

    setTimeout(() => setPhase('success'), 4200)
    setTimeout(() => {
      if (pendingImport.current) onParsed(pendingImport.current.tables, pendingImport.current.ddl)
    }, 5200)
  }

  if (phase === 'loading' || phase === 'success') {
    const summary = pendingImport.current
      ? summarizeDDLImport(pendingImport.current.tables)
      : null
    const relCount = (summary?.totalSingleFk ?? 0) + (summary?.totalCompositeFk ?? 0)
    const tableLabel = summary
      ? `${summary.tableCount} table${summary.tableCount !== 1 ? 's' : ''}`
      : ''
    return (
      <div className={cn(isCreation ? 'w-full px-5 pb-5' : 'max-w-2xl mx-auto py-8')}>
        <div
          className={cn(
            'flex flex-col items-center justify-center gap-5',
            isCreation ? 'py-10' : 'bg-white rounded-2xl border border-[#d3d3e5] shadow-sm py-16',
          )}
        >

          {phase === 'loading' ? (
            <>
              <div className="space-y-2 text-center">
                <div className="relative h-6 w-44 overflow-hidden">
                  {IMPORT_STEPS.map((step, i) => (
                    <div
                      key={i}
                      className="absolute inset-0 flex items-center justify-center text-sm font-semibold text-[#12131f] whitespace-nowrap"
                      style={{
                        transform: `translateY(${(i - importStep) * 100}%)`,
                        transition: 'transform 380ms cubic-bezier(0.4, 0, 0.2, 1)',
                      }}
                    >
                      {step}
                    </div>
                  ))}
                </div>
                <p className="text-xs text-[#9898a7] font-mono">{tableLabel}</p>
              </div>
              <div className="w-64 h-2 bg-[#f5f5fa] rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#0550dc] rounded-full"
                  style={{
                    width: `${importProgress}%`,
                    transition: progressDuration > 0 ? `width ${progressDuration}ms ease-out` : 'none',
                  }}
                />
              </div>
              <p className="text-[11px] text-[#9898a7]">
                {summary?.totalColumns ?? 0} field{(summary?.totalColumns ?? 0) !== 1 ? 's' : ''} detected
                {relCount > 0 ? ` · ${relCount} relationship${relCount !== 1 ? 's' : ''}` : ''}
              </p>
            </>
          ) : (
            <>
              <div className="h-12 w-12 rounded-full bg-[#d3efcd] flex items-center justify-center">
                <Check className="h-6 w-6 text-[#047800]" strokeWidth={2.5} />
              </div>
              <div className="space-y-1 text-center">
                <p className="text-sm font-semibold text-[#12131f]">Schema imported</p>
                <p className="text-xs text-[#9898a7]">
                  {tableLabel} · {summary?.totalColumns ?? 0} field{(summary?.totalColumns ?? 0) !== 1 ? 's' : ''}
                  {relCount > 0
                    ? ` · ${relCount} relationship${relCount !== 1 ? 's' : ''}`
                    : ''}
                </p>
                {relCount > 0 ? (
                  <p className="text-[11px] text-[#656574] max-w-sm mx-auto leading-snug">
                    Relationships detected from SQL constraints and added to the contract.
                  </p>
                ) : null}
              </div>
            </>
          )}

        </div>
      </div>
    )
  }

  const loadExample = () => {
    setDdl(demoExampleDdl.trim())
    setError(null)
  }

  const handleDragOver  = (e: React.DragEvent) => { e.preventDefault(); setIsDragOver(true) }
  const handleDragLeave = () => setIsDragOver(false)
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault(); setIsDragOver(false)
    const file = e.dataTransfer.files[0]
    if (file && (file.name.endsWith('.sql') || file.type === 'text/plain')) {
      const reader = new FileReader()
      reader.onload = ev => { setDdl(ev.target?.result as string || ''); setError(null) }
      reader.readAsText(file)
    }
  }
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = ev => { setDdl(ev.target?.result as string || ''); setError(null) }
      reader.readAsText(file)
    }
  }

  const previewTableNames = preview?.tableNames.slice(0, 3) ?? []

  const sqlEditor = (
    <div
      className={cn(
        'rounded-xl overflow-hidden border border-[#e4e4f0] bg-[#f5f5fa]',
        isCreation ? 'mx-5' : 'mx-4 mb-4',
        isDragOver && 'border-[#0550dc]',
      )}
    >
      <div className="flex items-center justify-between px-4 py-2 bg-[#f5f5fa] border-b border-[#e4e4f0]">
        <span className="text-[10px] font-mono font-medium text-[#9898a7] tracking-wider uppercase select-none">SQL</span>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={loadExample}
            disabled={isLocked}
            className="text-[11px] text-[#0550dc] hover:text-[#0343be] font-medium flex items-center gap-1 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            <Sparkles className="h-3 w-3" />
            Load example
          </button>
          <span className="text-[#d3d3e5] text-xs select-none">·</span>
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            disabled={isLocked}
            className="text-[11px] text-[#656574] hover:text-[#33333d] font-medium flex items-center gap-1 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            <Upload className="h-3 w-3" />
            Upload .sql
          </button>
          <input ref={fileRef} type="file" accept=".sql,.txt" className="hidden" onChange={handleFileChange} />
        </div>
      </div>

      <textarea
        value={ddl}
        onChange={e => { setDdl(e.target.value); setError(null) }}
        placeholder={`CREATE TABLE your_table (\n  id          BIGINT        NOT NULL PRIMARY KEY,\n  name        VARCHAR(255)  NOT NULL,\n  created_at  TIMESTAMP     NOT NULL\n);`}
        disabled={isLocked}
        spellCheck={false}
        className={cn(
          'w-full resize-y font-mono text-[13px] leading-[1.75]',
          'text-[#2a2a30] placeholder:text-[#c4c4d4] bg-[#f5f5fa]',
          'px-5 py-4 outline-none',
          'disabled:opacity-50 disabled:cursor-not-allowed',
          isCreation ? 'min-h-[220px]' : 'min-h-[300px]',
        )}
      />
    </div>
  )

  const dragHint = !ddl && !isDragOver && (
    <p className="text-center text-[11px] text-[#9898a7] pb-3 flex items-center justify-center gap-1.5">
      <Upload className="h-3 w-3" />
      Or drag & drop a .sql file
    </p>
  )
  const dragActiveHint = isDragOver && (
    <p className="text-center text-[11px] text-[#0550dc] pb-3 font-medium">
      Drop to load your file
    </p>
  )

  const previewBlock = preview && !error && (
    <div className={cn('space-y-2', isCreation ? 'mx-5 mb-3' : 'mx-4 mb-4')}>
      <div className="flex items-center gap-2 flex-wrap">
        <span className="inline-flex items-center gap-1.5 h-6 px-2.5 rounded-md bg-[#f5f5fa] border border-[#e4e4f0] font-mono text-[11px] font-medium text-[#33333d]">
          <Table2 className="h-3 w-3 text-[#9898a7]" />
          {preview.tableCount} table{preview.tableCount !== 1 ? 's' : ''}
        </span>
        <span className="inline-flex items-center gap-1.5 h-6 px-2.5 rounded-md bg-[#f5f5fa] border border-[#e4e4f0] text-[11px] text-[#656574]">
          <Columns3 className="h-3 w-3 text-[#9898a7]" />
          {preview.totalColumns} columns
        </span>
        {preview.totalPk > 0 && (
          <span className="inline-flex items-center gap-1.5 h-6 px-2.5 rounded-md bg-[#f5f5fa] border border-[#e4e4f0] text-[11px] text-[#656574]">
            <KeyRound className="h-3 w-3 text-[#9898a7]" />
            {preview.totalPk} PK
          </span>
        )}
        {preview.totalRequired > 0 && (
          <span className="inline-flex items-center gap-1.5 h-6 px-2.5 rounded-md bg-[#f5f5fa] border border-[#e4e4f0] text-[11px] text-[#656574]">
            <Asterisk className="h-3 w-3 text-[#9898a7]" />
            {preview.totalRequired} required
          </span>
        )}
        {preview.totalOptional > 0 && (
          <span className="inline-flex items-center h-6 px-2.5 rounded-md bg-[#f5f5fa] border border-[#e4e4f0] text-[11px] text-[#9898a7]">
            {preview.totalOptional} optional
          </span>
        )}
        {preview.totalSingleFk > 0 && (
          <span className="inline-flex items-center gap-1.5 h-6 px-2.5 rounded-md bg-[#f5f5fa] border border-[#e4e4f0] text-[11px] text-[#656574]">
            <Link2 className="h-3 w-3 text-[#9898a7]" />
            {preview.totalSingleFk} FK
          </span>
        )}
        {preview.totalCompositeFk > 0 && (
          <span className="inline-flex items-center gap-1.5 h-6 px-2.5 rounded-md bg-[#f5f5fa] border border-[#e4e4f0] text-[11px] text-[#656574]">
            <Link2 className="h-3 w-3 text-[#9898a7]" />
            {preview.totalCompositeFk} composite FK
          </span>
        )}
      </div>
      {(preview.totalSingleFk > 0 || preview.totalCompositeFk > 0) && (
        <p className="text-[11px] text-[#656574] leading-snug">
          Relationships detected from SQL constraints and added to the contract.
        </p>
      )}
      {previewTableNames.length > 0 && (
        <p className="text-[11px] text-[#9898a7] font-mono truncate" title={preview.tableNames.join(', ')}>
          {previewTableNames.join(', ')}
          {preview.tableCount > 3 && ` +${preview.tableCount - 3} more`}
        </p>
      )}
    </div>
  )

  const errorBlock = error && (
    <div className={cn(
      'flex items-start gap-2 px-4 py-3 bg-[#fff2ee] border border-[#ffc4b0] rounded-lg',
      isCreation ? 'mx-5 mb-3' : 'mx-4 mb-4',
    )}>
      <AlertCircle className="h-3.5 w-3.5 text-[#c12c11] flex-shrink-0 mt-0.5" />
      <p className="text-[#c12c11] text-xs">{error}</p>
    </div>
  )

  const importFooter = (
    <div className={cn(
      'flex items-center justify-center gap-3 border-t border-[#f0f0f7]',
      isCreation ? 'px-5 py-4 mt-auto' : 'px-6 py-5',
    )}>
      <Button onClick={handleParse} disabled={!ddl.trim() || isLocked} className="gap-2 px-6 w-full sm:w-auto">
        <Sparkles className="h-4 w-4" />
        Import fields
      </Button>
      {!isCreation && onStartFromScratch ? (
        <Button
          variant="ghost"
          onClick={onStartFromScratch}
          disabled={isLocked}
          className="text-[#656574]"
        >
          {IMPORT_START_FROM_SCRATCH}
        </Button>
      ) : null}
    </div>
  )

  const featureGrid = !isCreation && (
    <div className="mt-6 grid grid-cols-3 gap-4">
      {[
        { icon: Columns3, title: 'Field names',  desc: 'Physical and business names mapped from column definitions.' },
        { icon: Table2,   title: 'Data types',   desc: 'SQL types mapped to ODCS logical types.' },
        { icon: Link2, title: 'Relationships', desc: 'FOREIGN KEY constraints mapped to field-level and composite table relationships.' },
      ].map(({ icon: Icon, title, desc }) => (
        <div key={title} className="flex flex-col gap-1">
          <div className="flex items-center gap-1.5 text-[#33333d]">
            <Icon className="h-3 w-3 text-[#9898a7]" />
            <span className="text-[11px] font-semibold">{title}</span>
          </div>
          <p className="text-[11px] text-[#9898a7] leading-relaxed">{desc}</p>
        </div>
      ))}
    </div>
  )

  if (isCreation) {
    return (
      <div
        className={cn(
          'flex flex-col flex-1 min-h-0 pb-1 transition-shadow duration-150',
          isDragOver && 'shadow-[inset_0_0_0_2px_#b8d0fb]',
        )}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        {sqlEditor}
        {dragHint}
        {dragActiveHint}
        {previewBlock}
        {errorBlock}
        {importFooter}
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto py-8">
      <div
        className={cn(
          'bg-white rounded-2xl border transition-all duration-150',
          isDragOver ? 'border-[#0550dc] shadow-[0_0_0_3px_#b8d0fb]' : 'border-[#d3d3e5] shadow-sm'
        )}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <div className="px-6 pt-6 pb-5">
          <h1 className="text-base font-semibold text-[#12131f] mb-1">Import from SQL</h1>
          <p className="text-[#656574] text-xs leading-relaxed">
            {IMPORT_SECTION_INTRO}
          </p>
        </div>

        {sqlEditor}
        {dragHint}
        {dragActiveHint}
        {previewBlock}
        {errorBlock}
        {importFooter}
      </div>

      {featureGrid}
    </div>
  )
}
