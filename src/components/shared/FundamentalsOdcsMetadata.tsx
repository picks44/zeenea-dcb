import type { ReactNode } from 'react'
import { DataContract } from '@/types/odcs'
import { ReadOnlyField } from '@/components/shared/ReadOnlyField'
import { LifecycleStatusBadge } from '@/lib/lifecycleStatusUi'
import { ODCS_API_VERSION, ODCS_KIND } from '@/lib/p1Constants'
import { cn } from '@/lib/utils'

interface FundamentalsOdcsMetadataProps {
  contract: DataContract
  compact?: boolean
  /** Optional slot for ID (e.g. GuidanceField + copy control in edit mode). */
  idControl?: ReactNode
  /** Optional slot for version (e.g. GuidanceField in edit mode). */
  versionControl?: ReactNode
}

/**
 * Read-only ODCS fundamentals block (apiVersion, kind, status, id, version).
 * Does not mutate contract state — display only unless slots inject edit wrappers.
 */
export function FundamentalsOdcsMetadata({
  contract,
  compact,
  idControl,
  versionControl,
}: FundamentalsOdcsMetadataProps) {
  const { info, id } = contract

  return (
    <div
      className={cn(
        'border border-neutral-100 rounded-lg bg-neutral-25/40',
        compact ? 'px-3 py-2' : 'px-3 py-3',
      )}
    >
      <p className={cn('font-medium text-neutral-600', compact ? 'text-[11px]' : 'text-xs')}>
        ODCS metadata
      </p>
      <p className={cn('text-neutral-400 leading-snug mt-0.5', compact ? 'text-[10px]' : 'text-[11px]')}>
        System-managed fields included in the exported YAML contract.
      </p>

      <div className={cn('grid grid-cols-1 sm:grid-cols-2', compact ? 'gap-2 mt-2' : 'gap-3 mt-3')}>
        <ReadOnlyField label="apiVersion" value={ODCS_API_VERSION} mono compact={compact} />
        <ReadOnlyField label="kind" value={ODCS_KIND} mono compact={compact} />

        <div>
          <span
            className={cn(
              'font-medium text-[#33333d] block',
              compact ? 'text-[11px] mb-0.5' : 'text-xs mb-1',
            )}
          >
            status
          </span>
          <LifecycleStatusBadge status={info.status} />
        </div>

        {idControl ?? (
          <ReadOnlyField label="id" value={id} mono required compact={compact} />
        )}

        {versionControl ?? (
          <div>
            <span
              className={cn(
                'font-medium text-[#33333d] block',
                compact ? 'text-[11px] mb-0.5' : 'text-xs mb-1',
              )}
            >
              version
            </span>
            <span
              className={cn(
                'font-mono text-[#33333d]',
                compact ? 'text-[12px]' : 'text-sm',
              )}
            >
              v{info.version}
            </span>
          </div>
        )}
      </div>
    </div>
  )
}
