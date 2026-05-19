import { applyLifecycleAction } from '@/lib/contractLifecycle'
import type { ContractCreationSource, DataContract, LifecycleStatus, SectionId } from '@/types/odcs'

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
