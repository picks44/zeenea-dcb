import { useState, useRef } from 'react'
import { Upload, AlertCircle, Sparkles, Table2, Columns3, KeyRound, Asterisk, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { parseDDL } from '@/lib/ddlParser'
import { SchemaTable } from '@/types/odcs'
import { cn } from '@/lib/utils'

interface ImportSectionProps {
  onParsed: (table: SchemaTable, ddl: string) => void
  isLocked: boolean
}

const EXAMPLES = [
  `CREATE TABLE customer_orders (
  order_id         BIGINT        NOT NULL PRIMARY KEY,
  customer_id      BIGINT        NOT NULL,
  customer_email   VARCHAR(255)  NOT NULL,
  order_date       TIMESTAMP     NOT NULL,
  status           VARCHAR(50)   NOT NULL,
  subtotal         DECIMAL(10,2),
  tax_amount       DECIMAL(10,2),
  total_amount     DECIMAL(10,2) NOT NULL,
  shipping_address TEXT,
  is_gift          BOOLEAN       DEFAULT false,
  notes            TEXT,
  created_at       TIMESTAMP     NOT NULL,
  updated_at       TIMESTAMP
);`,
  `CREATE TABLE products (
  product_id   BIGINT        NOT NULL PRIMARY KEY,
  sku          VARCHAR(100)  NOT NULL UNIQUE,
  name         VARCHAR(255)  NOT NULL,
  description  TEXT,
  category_id  INT           NOT NULL,
  price        DECIMAL(12,2) NOT NULL,
  cost         DECIMAL(12,2),
  stock_qty    INT           NOT NULL DEFAULT 0,
  is_active    BOOLEAN       NOT NULL DEFAULT true,
  weight_kg    DECIMAL(6,3),
  created_at   TIMESTAMP     NOT NULL,
  updated_at   TIMESTAMP
);`,
  `CREATE TABLE user_sessions (
  session_id    VARCHAR(128) NOT NULL PRIMARY KEY,
  user_id       BIGINT       NOT NULL,
  ip_address    VARCHAR(45)  NOT NULL,
  user_agent    TEXT,
  started_at    TIMESTAMP    NOT NULL,
  last_seen_at  TIMESTAMP    NOT NULL,
  expires_at    TIMESTAMP    NOT NULL,
  is_revoked    BOOLEAN      NOT NULL DEFAULT false,
  device_type   VARCHAR(50),
  country_code  CHAR(2)
);`,
  `CREATE TABLE payment_transactions (
  transaction_id   BIGINT        NOT NULL PRIMARY KEY,
  order_id         BIGINT        NOT NULL,
  payment_method   VARCHAR(50)   NOT NULL,
  provider         VARCHAR(100)  NOT NULL,
  provider_ref     VARCHAR(255),
  amount           DECIMAL(12,2) NOT NULL,
  currency         CHAR(3)       NOT NULL DEFAULT 'EUR',
  status           VARCHAR(30)   NOT NULL,
  failure_reason   TEXT,
  processed_at     TIMESTAMP     NOT NULL,
  refunded_at      TIMESTAMP
);`,
  `CREATE TABLE inventory_movements (
  movement_id    BIGINT      NOT NULL PRIMARY KEY,
  product_id     BIGINT      NOT NULL,
  warehouse_id   INT         NOT NULL,
  movement_type  VARCHAR(20) NOT NULL,
  quantity       INT         NOT NULL,
  unit_cost      DECIMAL(10,2),
  reference_id   BIGINT,
  reference_type VARCHAR(50),
  moved_at       TIMESTAMP   NOT NULL,
  created_by     BIGINT      NOT NULL
);`,
  `CREATE TABLE analytics_events (
  event_id     VARCHAR(36)  NOT NULL PRIMARY KEY,
  user_id      BIGINT,
  session_id   VARCHAR(128),
  event_type   VARCHAR(100) NOT NULL,
  page_url     TEXT         NOT NULL,
  referrer     TEXT,
  properties   TEXT,
  device_type  VARCHAR(30),
  browser      VARCHAR(50),
  os           VARCHAR(50),
  country_code CHAR(2),
  occurred_at  TIMESTAMP    NOT NULL
);`,
]

const IMPORT_STEPS = ['Parsing schema', 'Mapping fields', 'Applying types']

export function ImportSection({ onParsed, isLocked }: ImportSectionProps) {
  const [ddl, setDdl]               = useState('')
  const [error, setError]           = useState<string | null>(null)
  const [isDragOver, setIsDragOver] = useState(false)
  const [exampleIdx, setExampleIdx] = useState(0)
  const [phase, setPhase]               = useState<'idle' | 'loading' | 'success'>('idle')
  const [importProgress, setImportProgress] = useState(0)
  const [progressDuration, setProgressDuration] = useState(0)
  const [importStep, setImportStep]     = useState(0)
  const pendingImport = useRef<{ table: SchemaTable; ddl: string } | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  const preview = ddl.trim() ? parseDDL(ddl) : null

  const handleParse = () => {
    setError(null)
    if (!ddl.trim()) { setError('Paste a SQL CREATE TABLE statement first.'); return }
    if (!preview) {
      setError("Couldn't read this SQL. Make sure it contains a valid CREATE TABLE statement.")
      return
    }
    pendingImport.current = { table: preview, ddl }
    setPhase('loading')
    setImportStep(0)
    setImportProgress(0)
    setProgressDuration(0)

    // Stage 1 — rush to ~34%
    requestAnimationFrame(() => requestAnimationFrame(() => {
      setProgressDuration(1050)
      setImportProgress(34)
    }))

    // Step 2 — slide in, resume progress to ~67%
    setTimeout(() => setImportStep(1), 1400)
    setTimeout(() => { setProgressDuration(900); setImportProgress(67) }, 1550)

    // Step 3 — slide in, finish to 100%
    setTimeout(() => setImportStep(2), 2700)
    setTimeout(() => { setProgressDuration(1150); setImportProgress(100) }, 2850)

    setTimeout(() => setPhase('success'), 4200)
    setTimeout(() => {
      if (pendingImport.current) onParsed(pendingImport.current.table, pendingImport.current.ddl)
    }, 5200)
  }

  if (phase === 'loading' || phase === 'success') {
    const table = pendingImport.current?.table
    const fieldCount = table?.columns.length ?? 0
    return (
      <div className="max-w-2xl mx-auto py-8">
        <div className="bg-white rounded-2xl border border-[#d3d3e5] shadow-sm flex flex-col items-center justify-center py-16 gap-5">

          {phase === 'loading' ? (
            <>
              <div className="space-y-2 text-center">
                {/* Vertical ticker */}
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
                <p className="text-xs text-[#9898a7] font-mono">{table?.physicalName}</p>
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
                {fieldCount} field{fieldCount !== 1 ? 's' : ''} detected
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
                  {fieldCount} field{fieldCount !== 1 ? 's' : ''} · <span className="font-mono">{table?.physicalName}</span>
                </p>
              </div>
            </>
          )}

        </div>
      </div>
    )
  }

  const handleSkip = () =>
    onParsed({ physicalName: 'my_table', quantumName: 'My Table', tableType: 'table', description: '', columns: [] }, '')

  const loadExample = () => {
    setDdl(EXAMPLES[exampleIdx % EXAMPLES.length])
    setExampleIdx(i => (i + 1) % EXAMPLES.length)
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

  const pkCount       = preview?.columns.filter(c => c.isPrimaryKey).length ?? 0
  const requiredCount = preview?.columns.filter(c => c.required && !c.isPrimaryKey).length ?? 0
  const optionalCount = preview ? preview.columns.length - pkCount - requiredCount : 0

  return (
    <div className="max-w-2xl mx-auto py-8">

      {/* White card */}
      <div
        className={cn(
          'bg-white rounded-2xl border transition-all duration-150',
          isDragOver ? 'border-[#0550dc] shadow-[0_0_0_3px_#b8d0fb]' : 'border-[#d3d3e5] shadow-sm'
        )}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >

        {/* Card header */}
        <div className="px-6 pt-6 pb-5">
          <h1 className="text-base font-semibold text-[#12131f] mb-1">Import from SQL</h1>
          <p className="text-[#656574] text-xs leading-relaxed">
            Paste a <code className="bg-[#f5f5fa] px-1.5 py-0.5 rounded font-mono text-[11px] text-[#3f3f4a]">CREATE TABLE</code> statement to auto-populate your schema, or skip and define fields manually.
          </p>
        </div>

        {/* Code area */}
        <div className="mx-4 mb-4 rounded-xl overflow-hidden border border-[#e4e4f0] bg-[#f5f5fa]">

          {/* Toolbar */}
          <div className="flex items-center justify-between px-4 py-2 bg-[#f5f5fa] border-b border-[#e4e4f0]">
            <span className="text-[10px] font-mono font-medium text-[#9898a7] tracking-wider uppercase select-none">SQL</span>
            <div className="flex items-center gap-3">
              <button
                onClick={loadExample}
                disabled={isLocked}
                className="text-[11px] text-[#0550dc] hover:text-[#0343be] font-medium flex items-center gap-1 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <Sparkles className="h-3 w-3" />
                Load example
              </button>
              <span className="text-[#d3d3e5] text-xs select-none">·</span>
              <button
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

          {/* Textarea */}
          <textarea
            value={ddl}
            onChange={e => { setDdl(e.target.value); setError(null) }}
            placeholder={`CREATE TABLE your_table (\n  id          BIGINT        NOT NULL PRIMARY KEY,\n  name        VARCHAR(255)  NOT NULL,\n  created_at  TIMESTAMP     NOT NULL\n);`}
            disabled={isLocked}
            spellCheck={false}
            className={cn(
              'w-full min-h-[300px] resize-y font-mono text-[13px] leading-[1.75]',
              'text-[#2a2a30] placeholder:text-[#c4c4d4] bg-[#f5f5fa]',
              'px-5 py-4 outline-none',
              'disabled:opacity-50 disabled:cursor-not-allowed'
            )}
          />
        </div>

        {/* Drag hint */}
        {!ddl && !isDragOver && (
          <p className="text-center text-[11px] text-[#9898a7] pb-3 flex items-center justify-center gap-1.5">
            <Upload className="h-3 w-3" />
            Or drag & drop a .sql file
          </p>
        )}
        {isDragOver && (
          <p className="text-center text-[11px] text-[#0550dc] pb-3 font-medium">
            Drop to load your file
          </p>
        )}

        {/* Preview summary */}
        {preview && !error && (
          <div className="mx-4 mb-4 flex items-center gap-2 flex-wrap">
            <span className="inline-flex items-center gap-1.5 h-6 px-2.5 rounded-md bg-[#f5f5fa] border border-[#e4e4f0] font-mono text-[11px] font-medium text-[#33333d]">
              <Table2 className="h-3 w-3 text-[#9898a7]" />
              {preview.physicalName}
            </span>
            <span className="inline-flex items-center gap-1.5 h-6 px-2.5 rounded-md bg-[#f5f5fa] border border-[#e4e4f0] text-[11px] text-[#656574]">
              <Columns3 className="h-3 w-3 text-[#9898a7]" />
              {preview.columns.length} columns
            </span>
            {pkCount > 0 && (
              <span className="inline-flex items-center gap-1.5 h-6 px-2.5 rounded-md bg-[#f5f5fa] border border-[#e4e4f0] text-[11px] text-[#656574]">
                <KeyRound className="h-3 w-3 text-[#9898a7]" />
                {pkCount} PK
              </span>
            )}
            {requiredCount > 0 && (
              <span className="inline-flex items-center gap-1.5 h-6 px-2.5 rounded-md bg-[#f5f5fa] border border-[#e4e4f0] text-[11px] text-[#656574]">
                <Asterisk className="h-3 w-3 text-[#9898a7]" />
                {requiredCount} required
              </span>
            )}
            {optionalCount > 0 && (
              <span className="inline-flex items-center h-6 px-2.5 rounded-md bg-[#f5f5fa] border border-[#e4e4f0] text-[11px] text-[#9898a7]">
                {optionalCount} optional
              </span>
            )}
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="mx-4 mb-4 flex items-start gap-2 px-4 py-3 bg-[#fff2ee] border border-[#ffc4b0] rounded-lg">
            <AlertCircle className="h-3.5 w-3.5 text-[#c12c11] flex-shrink-0 mt-0.5" />
            <p className="text-[#c12c11] text-xs">{error}</p>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-center gap-3 px-6 py-5 border-t border-[#f0f0f7]">
          <Button onClick={handleParse} disabled={!ddl.trim() || isLocked} className="gap-2 px-6">
            <Sparkles className="h-4 w-4" />
            Import fields
          </Button>
          <Button variant="ghost" onClick={handleSkip} className="text-[#656574]">
            Skip
          </Button>
        </div>

      </div>

      {/* Feature hints */}
      <div className="mt-6 grid grid-cols-3 gap-4">
        {[
          { icon: Columns3, title: 'Field names',  desc: 'Physical and logical names extracted and mapped automatically.' },
          { icon: Table2,   title: 'Data types',   desc: 'SQL types converted to standard logical types.' },
          { icon: KeyRound, title: 'Constraints',  desc: 'NOT NULL, PRIMARY KEY and UNIQUE markers detected.' },
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

    </div>
  )
}
