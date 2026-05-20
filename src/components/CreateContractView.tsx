import { useState, type ReactNode } from 'react'
import { ArrowLeft, Database, FilePlus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ImportSection } from '@/components/sections/ImportSection'
import {
  CREATE_BACK_TO_OPTIONS,
  CREATE_CONTRACT_HEADING,
  CREATE_CONTRACT_SUBTITLE,
  CREATE_DDL_FORM_INTRO,
  CREATE_DDL_STEP_TITLE,
  CREATE_HOW_TO_START,
  CREATE_IMPORT_CARD_CTA,
  CREATE_IMPORT_CARD_INTRO,
  CREATE_IMPORT_CARD_TITLE,
  CREATE_SCRATCH_CARD_CTA,
  CREATE_SCRATCH_CARD_INTRO,
  CREATE_SCRATCH_CARD_TITLE,
} from '@/lib/uxCopy'
import type { SchemaTable } from '@/types/odcs'

type CreateMode = null | 'ddl'

interface CreateContractViewProps {
  onParsed: (tables: SchemaTable[]) => void
  onStartFromScratch: () => void
}

interface CreationChoiceCardProps {
  icon: ReactNode
  title: string
  description: string
  cta: string
  ctaVariant?: 'default' | 'secondary'
  onAction: () => void
}

function CreationChoiceCard({
  icon,
  title,
  description,
  cta,
  ctaVariant = 'default',
  onAction,
}: CreationChoiceCardProps) {
  return (
    <article className="bg-white rounded-2xl border border-[#d3d3e5] shadow-sm flex flex-col p-5 h-full">
      <div className="flex items-start gap-3 mb-4 flex-1">
        <div
          className="h-10 w-10 rounded-xl bg-[#f5f5fa] border border-[#e4e4f0] flex items-center justify-center flex-shrink-0"
          aria-hidden
        >
          {icon}
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="text-sm font-semibold text-[#12131f] mb-1">{title}</h3>
          <p className="text-[11px] text-[#656574] leading-relaxed">{description}</p>
        </div>
      </div>
      <Button onClick={onAction} className="w-full gap-2" variant={ctaVariant}>
        {cta}
      </Button>
    </article>
  )
}

export function CreateContractView({ onParsed, onStartFromScratch }: CreateContractViewProps) {
  const [mode, setMode] = useState<CreateMode>(null)

  if (mode === 'ddl') {
    return (
      <div className="px-4 lg:px-6 xl:px-8 py-5 max-w-2xl mx-auto w-full">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => setMode(null)}
          className="gap-1.5 -ml-2 mb-4 text-[#656574] hover:text-[#12131f]"
        >
          <ArrowLeft className="h-4 w-4" />
          {CREATE_BACK_TO_OPTIONS}
        </Button>

        <div className="bg-white rounded-2xl border border-[#d3d3e5] shadow-sm overflow-hidden">
          <div className="px-6 pt-6 pb-4 border-b border-[#f0f0f7]">
            <h2 className="text-base font-semibold text-[#12131f] mb-1">{CREATE_DDL_STEP_TITLE}</h2>
            <p className="text-xs text-[#656574] leading-relaxed">{CREATE_DDL_FORM_INTRO}</p>
          </div>
          <ImportSection
            layout="creation"
            onParsed={(tables) => onParsed(tables)}
            isLocked={false}
          />
        </div>
      </div>
    )
  }

  return (
    <div className="px-4 lg:px-6 xl:px-8 py-5 max-w-3xl mx-auto w-full">
      <header className="mb-6">
        <h1 className="text-lg font-semibold text-[#12131f]">{CREATE_CONTRACT_HEADING}</h1>
        <p className="text-xs text-[#656574] mt-1 leading-relaxed">{CREATE_CONTRACT_SUBTITLE}</p>
      </header>

      <section aria-labelledby="create-how-to-start">
        <h2
          id="create-how-to-start"
          className="text-sm font-semibold text-[#12131f] mb-4"
        >
          {CREATE_HOW_TO_START}
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <CreationChoiceCard
            icon={<Database className="h-5 w-5 text-[#0550dc]" />}
            title={CREATE_IMPORT_CARD_TITLE}
            description={CREATE_IMPORT_CARD_INTRO}
            cta={CREATE_IMPORT_CARD_CTA}
            onAction={() => setMode('ddl')}
          />
          <CreationChoiceCard
            icon={<FilePlus className="h-5 w-5 text-[#33333d]" />}
            title={CREATE_SCRATCH_CARD_TITLE}
            description={CREATE_SCRATCH_CARD_INTRO}
            cta={CREATE_SCRATCH_CARD_CTA}
            ctaVariant="secondary"
            onAction={onStartFromScratch}
          />
        </div>
      </section>
    </div>
  )
}
