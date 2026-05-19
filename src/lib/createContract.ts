import { applyLifecycleAction } from '@/lib/contractLifecycle'
import { deriveContractId } from '@/lib/idDerivation'
import {
  PROPOSED_BANNER_IMPORTED,
  PROPOSED_BANNER_IMPORT_PENDING,
  PROPOSED_BANNER_LEGACY,
} from '@/lib/uxCopy'
import type { ContractCreationSource, DataContract, LifecycleStatus, SchemaTable, SectionId } from '@/types/odcs'

export type ContractCreationMode = ContractCreationSource

export function getInitialLifecycleStatus(mode: ContractCreationMode): LifecycleStatus {
  return mode === 'manual' ? 'draft' : 'proposed'
}

export function createContract(mode: ContractCreationMode): DataContract {
  const now = new Date().toISOString()
  return {
    uid: crypto.randomUUID(),
    dataContractSpecification: '3.1.0',
    id: '',
    info: {
      title: '',
      version: '1.0.0',
      domain: '',
      owner: '',
      description: '',
      status: getInitialLifecycleStatus(mode),
      tags: [],
    },
    dataset: [],
    stakeholders: [],
    roles: [],
    slaProperties: [],
    customProperties: [],
    gitHistory: [],
    openPR: null,
    creationSource: mode,
    createdAt: now,
    updatedAt: now,
  }
}

/** After SQL parse in the pre-contract flow — creates proposed contract with dataset. */
export function createContractWithImportedSchema(tables: SchemaTable[]): DataContract {
  if (tables.length === 0) {
    throw new Error('createContractWithImportedSchema requires at least one table')
  }
  const c = createContract('import')
  const first = tables[0]
  const title = tables.length === 1 ? first.quantumName : ''
  return {
    ...c,
    info: { ...c.info, title: c.info.title || title },
    id: deriveContractId(title || first.physicalName, c.uid),
    dataset: tables,
  }
}

/** Contextual read-only banner copy for proposed contracts (null when not applicable). */
export function getProposedLifecycleBannerMessage(
  contract: Pick<DataContract, 'creationSource' | 'dataset'>,
): string {
  if (contract.creationSource === 'import') {
    return contract.dataset.length > 0
      ? PROPOSED_BANNER_IMPORTED
      : PROPOSED_BANNER_IMPORT_PENDING
  }
  return PROPOSED_BANNER_LEGACY
}

/** Hide top-bar Start drafting on the initial Import step (Start from scratch is the primary action). */
export function shouldHideStartDraftingInTopBar(
  status: LifecycleStatus,
  creationSource: ContractCreationSource | undefined,
  activeSection: SectionId,
): boolean {
  return status === 'proposed' && creationSource === 'import' && activeSection === 'import'
}

/** Skip import on a proposed contract → draft scratch (same transition as Start drafting). */
export function applyStartFromScratch(contract: DataContract): DataContract {
  return {
    ...contract,
    creationSource: 'manual',
    info: {
      ...contract.info,
      status:
        contract.info.status === 'proposed'
          ? applyLifecycleAction(contract.info.status, 'start_draft')
          : contract.info.status,
    },
  }
}
