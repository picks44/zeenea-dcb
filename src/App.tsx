import { useState, useEffect, useCallback } from 'react'
import { AlertTriangle, Eye, Lock } from 'lucide-react'
import { AppTopBar } from './components/AppTopBar'
import { MainSidebar } from './components/MainSidebar'
import { ContractsBacklog } from './components/ContractsBacklog'
import { ContractTopBar } from './components/ContractTopBar'
import { ContractSectionNav } from './components/ContractSectionNav'
import { ShareModal } from './components/ShareModal'
import { PushToGitModal } from './components/PushToGitModal'
import { VersionCompareModal } from './components/VersionCompareModal'
import { YamlView } from './components/YamlView'
import { VersionsView } from './components/VersionsView'
import { Toast, useToast } from './components/ui/toast'
import { ConfirmDialog, ConfirmConfig } from './components/ui/confirm-dialog'

import { ComponentsPage } from './pages/ComponentsPage'
import { ImportSection } from './components/sections/ImportSection'
import { FundamentalsSection } from './components/sections/FundamentalsSection'
import { SchemaSection } from './components/sections/SchemaSection'
import { StakeholdersSection } from './components/sections/StakeholdersSection'
import { AccessRolesSection } from './components/sections/AccessRolesSection'
import { SlaSection } from './components/sections/SlaSection'
import { ReadinessPanel } from './components/ReadinessPanel'

import { DataContract, DataContractSnapshot, SectionId, SchemaTable, AppView, EditorTab, Collaborator, CollaboratorRole, OdcsAccessRole, SlaProperty } from './types/odcs'
import type { PushResult } from './components/PushToGitModal'
import { loadContracts, saveContracts } from './lib/storage'
import { validateContract } from './lib/contractValidation'
import { CURRENT_USER } from './lib/currentUser'
import { PUBLISH_REQUIRES_PUBLISHER_CONTRACT, VIEWER_ACCESS_BANNER } from './lib/uxCopy'
import { useMediaQuery } from './hooks/useMediaQuery'
import { MEDIA_QUERIES } from './lib/layoutBreakpoints'
import { cn } from './lib/utils'

function makeContract(): DataContract {
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
      status: 'draft',
      tags: [],
    },
    dataset: [],
    stakeholders: [],
    roles: [],
    slaProperties: [],
    gitHistory: [],
    openPR: null,
    createdAt: now,
    updatedAt: now,
  }
}

function getMyRole(contract: DataContract | null): CollaboratorRole {
  if (!contract?.collaborators?.length) return 'owner'
  const me = contract.collaborators.find(c => c.email.toLowerCase() === CURRENT_USER.email.toLowerCase())
  return me?.role ?? 'owner'
}

export default function App() {
  const [contracts, setContracts] = useState<DataContract[]>(() => loadContracts())
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [currentView, setCurrentView] = useState<AppView>('backlog')
  const [activeSection, setActiveSection] = useState<SectionId>('fundamentals')
  const [activeTab, setActiveTab] = useState<EditorTab>('form')
  const [showPushModal, setShowPushModal] = useState(false)
  const [compareHash, setCompareHash] = useState<string | null>(null)
  const [hasEditedSincePublish, setHasEditedSincePublish] = useState(false)
  const [confirmConfig, setConfirmConfig] = useState<ConfirmConfig | null>(null)
  const [showShareModal, setShowShareModal] = useState(false)
  const [readinessOpen, setReadinessOpen] = useState(false)
  const panelPinned = useMediaQuery(MEDIA_QUERIES.panelPinned)
  const toast = useToast()

  useEffect(() => {
    setReadinessOpen(panelPinned)
  }, [panelPinned])

  useEffect(() => { saveContracts(contracts) }, [contracts])

  const contract = selectedId ? contracts.find(c => c.uid === selectedId) ?? null : null
  const myRole = getMyRole(contract)
  const isLocked = contract
    ? myRole === 'viewer' || (contract.info.status === 'active' && !contract.inRevision) || contract.info.status === 'deprecated'
    : false

  const isPublishedView = contract
    ? contract.info.status === 'active' && !contract.inRevision
    : false

  const docCompact = isPublishedView && !panelPinned

  const readinessToggleLabel = isPublishedView ? 'Quality' : 'Readiness'
  const showReadinessPanel =
    !!contract && activeSection !== 'import' && activeTab === 'form' && activeSection !== 'versions'
  const showReadinessToggle = showReadinessPanel && !panelPinned

  const validation = contract ? validateContract(contract) : null
  const canPublish = !!validation?.canPublish && hasEditedSincePublish && myRole === 'owner'

  const publishBlockReason = !contract ? null
    : myRole !== 'owner' ? PUBLISH_REQUIRES_PUBLISHER_CONTRACT
    : !hasEditedSincePublish ? 'No changes since last publish.'
    : validation?.publishBlockReason ?? null

  const updateContract = useCallback((updated: DataContract) => {
    setContracts(prev =>
      prev.map(c => c.uid === updated.uid ? { ...updated, updatedAt: new Date().toISOString() } : c)
    )
  }, [])

  const handleCreate = () => {
    const c = makeContract()
    setContracts(prev => [c, ...prev])
    setSelectedId(c.uid)
    setCurrentView('editor')
    setActiveSection('import' as SectionId)
    setActiveTab('form')
    setHasEditedSincePublish(false)
  }

  const handleSelectContract = (uid: string) => {
    setSelectedId(uid)
    setCurrentView('editor')
    setActiveSection('fundamentals')
    setActiveTab('form')
    const c = contracts.find(c => c.uid === uid)
    if (c) {
      const lastCommit = c.gitHistory[c.gitHistory.length - 1]
      const hasEdits = !lastCommit
        ? c.updatedAt !== c.createdAt
        : new Date(c.updatedAt) > new Date(lastCommit.timestamp)
      setHasEditedSincePublish(hasEdits)
    }
  }

  const handleBack = () => {
    setCurrentView('backlog')
    setSelectedId(null)
  }

  const handleDDLParsed = useCallback((tables: SchemaTable[], _ddl: string) => {
    if (!contract || tables.length === 0) return
    const first = tables[0]
    updateContract({
      ...contract,
      info: {
        ...contract.info,
        title: contract.info.title || (tables.length === 1 ? first.quantumName : contract.info.title),
      },
      id: contract.id || first.physicalName.toLowerCase().replace(/[^a-z0-9]/g, '-'),
      dataset: tables,
    })
    setHasEditedSincePublish(true)
    setActiveSection('fundamentals')
  }, [contract, updateContract])

  const handleFundamentalsChange = useCallback(
    (updates: Partial<DataContract['info']> & { id?: string }) => {
      if (!contract) return
      const { id, ...infoUpdates } = updates
      updateContract({
        ...contract,
        id: id !== undefined ? id : contract.id,
        info: { ...contract.info, ...infoUpdates },
      })
      setHasEditedSincePublish(true)
    }, [contract, updateContract])

  const handleSchemaChange = useCallback((tables: SchemaTable[]) => {
    if (!contract) return
    updateContract({ ...contract, dataset: tables })
    setHasEditedSincePublish(true)
  }, [contract, updateContract])

  const handleStakeholdersChange = useCallback((stakeholders: DataContract['stakeholders']) => {
    if (!contract) return
    updateContract({ ...contract, stakeholders })
    setHasEditedSincePublish(true)
  }, [contract, updateContract])

  const handleRolesChange = useCallback((roles: OdcsAccessRole[]) => {
    if (!contract) return
    updateContract({ ...contract, roles })
    setHasEditedSincePublish(true)
  }, [contract, updateContract])

  const handleSlaChange = useCallback((slaProperties: SlaProperty[]) => {
    if (!contract) return
    updateContract({ ...contract, slaProperties })
    setHasEditedSincePublish(true)
  }, [contract, updateContract])

  const handleDeleteContract = () => {
    if (!contract) return
    setConfirmConfig({
      title: 'Delete contract',
      description: `Delete "${contract.info.title || 'Untitled Contract'}"? This cannot be undone.`,
      confirmLabel: 'Delete',
      variant: 'destructive',
      onConfirm: () => {
        setContracts(prev => prev.filter(c => c.uid !== contract.uid))
        setCurrentView('backlog')
        setSelectedId(null)
      },
    })
  }

  const handleNewVersion = useCallback(() => {
    if (!contract) return
    updateContract({ ...contract, inRevision: true })
    setHasEditedSincePublish(false)
  }, [contract, updateContract])

  const handleCollaboratorsChange = useCallback((collaborators: Collaborator[]) => {
    if (!contract) return
    updateContract({ ...contract, collaborators })
  }, [contract, updateContract])

  const handleDiscardDraft = useCallback(() => {
    if (!contract) return
    const lastCommit = contract.gitHistory[contract.gitHistory.length - 1]
    if (!lastCommit?.snapshot) return
    setConfirmConfig({
      title: 'Discard changes',
      description: `Revert all unpublished changes and return to v${lastCommit.version}? This cannot be undone.`,
      confirmLabel: 'Discard',
      variant: 'destructive',
      onConfirm: () => {
        const snap = lastCommit.snapshot!
        updateContract({
          ...contract,
          id: snap.id,
          info: { ...snap.info },
          dataset: JSON.parse(JSON.stringify(snap.dataset)),
          stakeholders: [...snap.stakeholders],
          roles: [...(snap.roles ?? [])],
          slaProperties: [...(snap.slaProperties ?? [])],
          inRevision: false,
        })
        setHasEditedSincePublish(false)
      },
    })
  }, [contract, updateContract])

  const handleGitPush = useCallback((result: PushResult) => {
    if (!contract) return
    const snapshot: DataContractSnapshot = {
      id: contract.id,
      info: { ...contract.info, version: result.newVersion, status: 'active' },
      dataset: JSON.parse(JSON.stringify(contract.dataset)),
      stakeholders: [...contract.stakeholders],
      roles: [...(contract.roles ?? [])],
      slaProperties: [...(contract.slaProperties ?? [])],
    }
    const commitWithSnapshot = { ...result.commit, snapshot }
    setContracts(prev => prev.map(c => c.uid === contract.uid ? {
      ...c,
      info: { ...c.info, version: result.newVersion, status: 'active' },
      gitHistory: [...c.gitHistory.map(h => ({ ...h, contractStatus: 'deprecated' as const })), commitWithSnapshot],
      inRevision: false,
      updatedAt: result.commit.timestamp,
    } : c))
    setHasEditedSincePublish(false)
  }, [contract])

  return (
    <div className="flex h-screen bg-[#fbfbff] overflow-hidden">

      <MainSidebar
        currentView={currentView}
        onNavigate={(view) => {
          if (view === 'backlog') handleBack()
          else { setCurrentView(view); setSelectedId(null) }
        }}
      />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">

        <AppTopBar
          currentView={currentView}
          contractTitle={contract?.info.title}
          onBack={handleBack}
        />

        <div className="flex flex-1 min-h-0 overflow-hidden">
          {currentView === 'components' ? (
            <ComponentsPage />
          ) : currentView === 'backlog' ? (
            <ContractsBacklog
              contracts={contracts}
              onSelectContract={handleSelectContract}
              onCreateContract={handleCreate}
            />
          ) : contract ? (
            <div className="flex flex-1 min-h-0 overflow-hidden">

              {activeSection !== 'import' && (
                <ContractSectionNav
                  contract={contract}
                  activeSection={activeSection}
                  onSectionChange={setActiveSection}
                  isNew={contract.dataset.length === 0 && contract.gitHistory.length === 0}
                  onDeleteContract={handleDeleteContract}
                />
              )}

              <div className="flex-1 flex flex-col min-w-0 overflow-hidden">

                <ContractTopBar
                  contract={contract}
                  activeTab={activeTab}
                  onTabChange={setActiveTab}
                  canPublish={canPublish}
                  publishBlockReason={publishBlockReason}
                  onPushToGit={() => setShowPushModal(true)}
                  onNewVersion={handleNewVersion}
                  collaborators={contract.collaborators ?? []}
                  onShare={() => setShowShareModal(true)}
                  myRole={myRole}
                  showReadinessToggle={showReadinessToggle}
                  readinessToggleLabel={readinessToggleLabel}
                  readinessPanelOpen={readinessOpen}
                  onReadinessToggle={() => setReadinessOpen(o => !o)}
                />

                {contract.info.status === 'deprecated' && (
                  <div className="bg-[#fff2ee] border-b border-[#ffc4b0] px-6 py-2 flex items-center gap-2.5 flex-shrink-0">
                    <AlertTriangle className="h-3.5 w-3.5 text-[#c12c11] flex-shrink-0" />
                    <p className="text-[#c12c11] text-xs font-medium">
                      This contract is <strong>Deprecated</strong> and should no longer be used.
                    </p>
                  </div>
                )}

                {contract.info.status === 'active' && !contract.inRevision && (
                  <div className="bg-[#edf6ff] border-b border-[#b8d0fb] px-6 py-2 flex items-center gap-2.5 flex-shrink-0">
                    <Lock className="h-3.5 w-3.5 text-[#00699f] flex-shrink-0" />
                    <p className="text-[#003d5c] text-xs font-medium">
                      This contract is active and read-only. Start a new version to edit and publish changes.
                    </p>
                  </div>
                )}

                {myRole === 'viewer' && (
                  <div className="bg-[#f5f5fa] border-b border-[#d3d3e5] px-6 py-2 flex items-center gap-2 flex-shrink-0">
                    <Eye className="h-3.5 w-3.5 text-[#656574] flex-shrink-0" />
                    <p className="text-[#656574] text-xs">{VIEWER_ACCESS_BANNER}</p>
                  </div>
                )}

                {activeSection === 'versions' ? (
                  <div
                    className={cn(
                      'flex-1 overflow-y-auto py-6',
                      docCompact ? 'px-3 lg:px-4' : 'px-4 lg:px-6 xl:px-8',
                    )}
                  >
                    <VersionsView
                      contract={contract}
                      onVersionClick={hash => setCompareHash(hash)}
                      onDiscardDraft={handleDiscardDraft}
                    />
                  </div>
                ) : activeTab === 'yaml' ? (
                  <YamlView contract={contract} />
                ) : (
                  <div className="flex flex-1 min-h-0 overflow-hidden">
                    <div className="flex-1 overflow-y-auto min-w-0">
                      <div
                        className={cn(
                          'min-w-0',
                          docCompact ? 'px-3 lg:px-4 py-4' : 'px-4 lg:px-6 xl:px-8 py-6',
                        )}
                      >
                      {activeSection === 'import' ? (
                        <ImportSection onParsed={handleDDLParsed} isLocked={isLocked} />
                      ) : activeSection === 'fundamentals' ? (
                        <FundamentalsSection
                          contract={contract}
                          onChange={handleFundamentalsChange}
                          isLocked={isLocked}
                          isOwner={myRole === 'owner'}
                          isPublishedView={isPublishedView}
                          docCompact={docCompact}
                        />
                      ) : activeSection === 'schema' ? (
                        <SchemaSection tables={contract.dataset} onChange={handleSchemaChange} isLocked={isLocked} />
                      ) : (activeSection === 'stakeholders' || activeSection === 'team') ? (
                        <StakeholdersSection
                          stakeholders={contract.stakeholders}
                          onChange={handleStakeholdersChange}
                          isLocked={isLocked}
                          docCompact={docCompact}
                        />
                      ) : activeSection === 'accessRoles' ? (
                        <AccessRolesSection
                          roles={contract.roles ?? []}
                          onChange={handleRolesChange}
                          isLocked={isLocked}
                          docCompact={docCompact}
                        />
                      ) : activeSection === 'sla' ? (
                        <SlaSection
                          slaProperties={contract.slaProperties ?? []}
                          onChange={handleSlaChange}
                          isLocked={isLocked}
                          isPublishedView={isPublishedView}
                          docCompact={docCompact}
                        />
                      ) : null}
                      </div>
                    </div>
                    {showReadinessPanel && panelPinned && (
                      <ReadinessPanel
                        contract={contract}
                        myRole={myRole}
                        hasEditedSincePublish={hasEditedSincePublish}
                        layout="pinned"
                      />
                    )}
                    {showReadinessPanel && !panelPinned && readinessOpen && (
                      <>
                        <button
                          type="button"
                          className="fixed inset-0 z-40 bg-black/20"
                          aria-label="Close panel"
                          onClick={() => setReadinessOpen(false)}
                        />
                        <ReadinessPanel
                          contract={contract}
                          myRole={myRole}
                          hasEditedSincePublish={hasEditedSincePublish}
                          layout="overlay"
                          onClose={() => setReadinessOpen(false)}
                        />
                      </>
                    )}
                  </div>
                )}
              </div>

              <ShareModal
                contract={contract}
                open={showShareModal}
                onClose={() => setShowShareModal(false)}
                onCollaboratorsChange={handleCollaboratorsChange}
                canManageMembers={myRole === 'owner'}
              />

              <PushToGitModal
                key={contract.uid}
                contract={contract}
                open={showPushModal}
                onClose={() => setShowPushModal(false)}
                onPushed={handleGitPush}
              />

              {compareHash && (
                <VersionCompareModal
                  key={compareHash}
                  contract={contract}
                  initialHash={compareHash}
                  open={!!compareHash}
                  onClose={() => setCompareHash(null)}
                />
              )}
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center text-[#656574] text-sm">
              No contract selected.
            </div>
          )}
        </div>
      </div>

      <Toast visible={toast.visible} message={toast.message} />
      <ConfirmDialog config={confirmConfig} onClose={() => setConfirmConfig(null)} />
    </div>
  )
}
