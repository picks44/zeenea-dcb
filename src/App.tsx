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
import { ReadinessNavigationProvider } from './components/readiness/ReadinessNavigationContext'

import { DataContract, DataContractSnapshot, SectionId, SchemaTable, AppView, EditorTab, Collaborator, CollaboratorRole, OdcsAccessRole, SlaProperty } from './types/odcs'
import type { CustomProperty } from './types/odcsShared'
import { CustomPropertiesSection } from './components/sections/CustomPropertiesSection'
import { deriveContractId } from './lib/idDerivation'
import { applyLifecycleAction, isContractLocked, isImportSectionEditable } from './lib/contractLifecycle'
import {
  applyStartFromScratch,
  createContract,
  createContractWithImportedSchema,
  getProposedLifecycleBannerMessage,
  shouldHideStartDraftingInTopBar,
} from './lib/createContract'
import type { PushResult } from './components/PushToGitModal'
import { loadContracts, saveContracts } from './lib/storage'
import { validateContract } from './lib/contractValidation'
import { CURRENT_USER } from './lib/currentUser'
import { publishBlockUserMessage } from './lib/validationUserMessages'
import {
  NO_CHANGES_TO_PUBLISH,
  PUBLISH_REQUIRES_PUBLISHER_CONTRACT,
  VIEWER_ACCESS_BANNER,
} from './lib/uxCopy'
import { useMediaQuery } from './hooks/useMediaQuery'
import { useNavCollapsed } from './hooks/useNavCollapsed'
import { MEDIA_QUERIES } from './lib/layoutBreakpoints'
import { cn } from './lib/utils'

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
  const { collapsed: navCollapsed, toggle: toggleNavCollapsed } = useNavCollapsed()
  const toast = useToast()

  useEffect(() => {
    setReadinessOpen(panelPinned)
  }, [panelPinned])

  useEffect(() => { saveContracts(contracts) }, [contracts])

  const contract = selectedId ? contracts.find(c => c.uid === selectedId) ?? null : null
  const myRole = getMyRole(contract)
  const isViewer = myRole === 'viewer'
  const isLocked = contract
    ? isContractLocked(contract.info.status, contract.inRevision, isViewer)
    : false
  const isImportLocked = contract
    ? !isImportSectionEditable(contract.info.status, isViewer)
      && isContractLocked(contract.info.status, contract.inRevision, isViewer)
    : true

  const isPublishedView = contract
    ? contract.info.status === 'active' && !contract.inRevision
    : false

  const docCompact = isPublishedView && !panelPinned

  const readinessToggleLabel = isPublishedView ? 'Quality' : 'Readiness'
  const showReadinessPanel =
    !!contract && activeSection !== 'import' && activeTab === 'form' && activeSection !== 'versions'
  const showReadinessToggle = showReadinessPanel && !panelPinned

  const showPublicationGuidance = Boolean(
    contract
    && !isLocked
    && contract.info.status !== 'deprecated'
    && contract.info.status !== 'retired',
  )

  const hideStartDrafting = contract
    ? shouldHideStartDraftingInTopBar(
        contract.info.status,
        contract.creationSource,
        activeSection,
      )
    : false

  const validation = contract ? validateContract(contract, contracts) : null
  const canPublish = !!validation?.canPublish && hasEditedSincePublish && myRole === 'owner'

  const publishBlockReason = !contract ? null
    : myRole !== 'owner' ? PUBLISH_REQUIRES_PUBLISHER_CONTRACT
    : !hasEditedSincePublish ? NO_CHANGES_TO_PUBLISH
    : validation ? publishBlockUserMessage(validation) : null

  const updateContract = useCallback((updated: DataContract) => {
    setContracts(prev =>
      prev.map(c => c.uid === updated.uid ? { ...updated, updatedAt: new Date().toISOString() } : c)
    )
  }, [])

  const openNewContract = (c: DataContract, section: SectionId) => {
    setContracts(prev => [c, ...prev])
    setSelectedId(c.uid)
    setCurrentView('editor')
    setActiveSection(section)
    setActiveTab('form')
    setHasEditedSincePublish(false)
  }

  const handleCreateContract = () => {
    setSelectedId(null)
    setCurrentView('create')
  }

  const handleCreationStartFromScratch = () => {
    openNewContract(createContract('manual'), 'fundamentals')
  }

  const handleCreationDDLParsed = useCallback((tables: SchemaTable[]) => {
    if (tables.length === 0) return
    const c = createContractWithImportedSchema(tables)
    openNewContract(c, 'fundamentals')
    setHasEditedSincePublish(true)
  }, [])

  /** Legacy: proposed contract created before pre-contract flow (empty import onboarding). */
  const handleStartFromScratch = useCallback(() => {
    if (!contract || isViewer || contract.info.status !== 'proposed') return
    updateContract(applyStartFromScratch(contract))
    setActiveSection('fundamentals')
    setHasEditedSincePublish(false)
  }, [contract, isViewer, updateContract])

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
    const canImport =
      isImportSectionEditable(contract.info.status, isViewer)
      || !isContractLocked(contract.info.status, contract.inRevision, isViewer)
    if (!canImport) return
    const first = tables[0]
    updateContract({
      ...contract,
      info: {
        ...contract.info,
        title: contract.info.title || (tables.length === 1 ? first.quantumName : contract.info.title),
      },
      id: contract.id || deriveContractId(contract.info.title || first.physicalName, contract.uid),
      dataset: tables,
    })
    setHasEditedSincePublish(true)
    setActiveSection('fundamentals')
  }, [contract, updateContract, isViewer])

  const handleFundamentalsChange = useCallback(
    (updates: Partial<DataContract['info']> & { id?: string }) => {
      if (!contract) return
      if (isContractLocked(contract.info.status, contract.inRevision, myRole === 'viewer')) return
      const { id, ...infoUpdates } = updates
      updateContract({
        ...contract,
        id: id !== undefined ? id : contract.id,
        info: { ...contract.info, ...infoUpdates },
      })
      setHasEditedSincePublish(true)
    }, [contract, updateContract, myRole])

  const handleSchemaChange = useCallback((tables: SchemaTable[]) => {
    if (!contract) return
    if (isContractLocked(contract.info.status, contract.inRevision, myRole === 'viewer')) return
    updateContract({ ...contract, dataset: tables })
    setHasEditedSincePublish(true)
  }, [contract, updateContract, myRole])

  const handleStakeholdersChange = useCallback((stakeholders: DataContract['stakeholders']) => {
    if (!contract) return
    if (isContractLocked(contract.info.status, contract.inRevision, myRole === 'viewer')) return
    updateContract({ ...contract, stakeholders })
    setHasEditedSincePublish(true)
  }, [contract, updateContract, myRole])

  const handleRolesChange = useCallback((roles: OdcsAccessRole[]) => {
    if (!contract) return
    if (isContractLocked(contract.info.status, contract.inRevision, myRole === 'viewer')) return
    updateContract({ ...contract, roles })
    setHasEditedSincePublish(true)
  }, [contract, updateContract, myRole])

  const handleSlaChange = useCallback((slaProperties: SlaProperty[]) => {
    if (!contract) return
    if (isContractLocked(contract.info.status, contract.inRevision, myRole === 'viewer')) return
    updateContract({ ...contract, slaProperties })
    setHasEditedSincePublish(true)
  }, [contract, updateContract, myRole])

  const handleCustomPropertiesChange = useCallback((customProperties: CustomProperty[]) => {
    if (!contract) return
    if (isContractLocked(contract.info.status, contract.inRevision, myRole === 'viewer')) return
    updateContract({ ...contract, customProperties })
    setHasEditedSincePublish(true)
  }, [contract, updateContract, myRole])

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

  const handleStartDraft = useCallback(() => {
    if (!contract || contract.info.status !== 'proposed') return
    updateContract({
      ...contract,
      info: { ...contract.info, status: applyLifecycleAction(contract.info.status, 'start_draft') },
    })
    setHasEditedSincePublish(true)
  }, [contract, updateContract])

  const handleDeprecateContract = useCallback(() => {
    if (!contract || contract.info.status !== 'active' || contract.inRevision) return
    setConfirmConfig({
      title: 'Deprecate contract',
      description: 'Mark this contract as deprecated? Consumers should migrate to a newer version.',
      confirmLabel: 'Deprecate',
      variant: 'destructive',
      onConfirm: () => {
        updateContract({
          ...contract,
          info: { ...contract.info, status: applyLifecycleAction(contract.info.status, 'deprecate') },
        })
      },
    })
  }, [contract, updateContract])

  const handleRetireContract = useCallback(() => {
    if (!contract || contract.info.status !== 'deprecated') return
    setConfirmConfig({
      title: 'Retire contract',
      description: 'Retire this contract? It will no longer be available for use.',
      confirmLabel: 'Retire',
      variant: 'destructive',
      onConfirm: () => {
        updateContract({
          ...contract,
          info: { ...contract.info, status: applyLifecycleAction(contract.info.status, 'retire') },
        })
      },
    })
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
          customProperties: [...(snap.customProperties ?? [])],
          inRevision: false,
        })
        setHasEditedSincePublish(false)
      },
    })
  }, [contract, updateContract])

  const handleGitPush = useCallback((result: PushResult) => {
    if (!contract) return
    const publishCheck = validateContract(contract, contracts)
    if (!publishCheck.canPublish || myRole !== 'owner' || !hasEditedSincePublish) return
    const snapshot: DataContractSnapshot = {
      id: contract.id,
      info: {
        ...contract.info,
        version: result.newVersion,
        status: applyLifecycleAction(contract.info.status, 'publish'),
      },
      dataset: JSON.parse(JSON.stringify(contract.dataset)),
      stakeholders: [...contract.stakeholders],
      roles: [...(contract.roles ?? [])],
      slaProperties: [...(contract.slaProperties ?? [])],
      customProperties: [...(contract.customProperties ?? [])],
    }
    const commitWithSnapshot = { ...result.commit, snapshot }
    setContracts(prev => prev.map(c => c.uid === contract.uid ? {
      ...c,
      info: { ...c.info, version: result.newVersion, status: applyLifecycleAction(c.info.status, 'publish') },
      gitHistory: [...c.gitHistory.map(h => ({ ...h, contractStatus: 'deprecated' as const })), commitWithSnapshot],
      inRevision: false,
      updatedAt: result.commit.timestamp,
    } : c))
    setHasEditedSincePublish(false)
  }, [contract, contracts, hasEditedSincePublish, myRole])

  return (
    <div className="flex h-screen bg-[#fbfbff] overflow-hidden">

      <MainSidebar
        currentView={currentView}
        collapsed={navCollapsed}
        onToggleCollapsed={toggleNavCollapsed}
        onNavigate={(view) => {
          if (view === 'backlog') handleBack()
          else { setCurrentView(view); setSelectedId(null) }
        }}
      />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">

        {!(contract && currentView === 'editor' && activeSection !== 'import') && (
          <AppTopBar
            currentView={currentView}
            contractTitle={contract?.info.title}
            onBack={handleBack}
          />
        )}

        <div className="flex flex-1 min-h-0 overflow-hidden">
          {currentView === 'components' ? (
            <ComponentsPage />
          ) : currentView === 'backlog' ? (
            <ContractsBacklog
              contracts={contracts}
              onSelectContract={handleSelectContract}
              onCreateContract={handleCreateContract}
            />
          ) : currentView === 'create' ? (
            <div className="flex-1 overflow-y-auto min-w-0 bg-[#fbfbff]">
              <div className="px-4 lg:px-6 xl:px-8 py-6 max-w-4xl mx-auto w-full">
                <ImportSection
                  onParsed={(tables) => handleCreationDDLParsed(tables)}
                  onStartFromScratch={handleCreationStartFromScratch}
                  isLocked={false}
                />
              </div>
            </div>
          ) : contract ? (
            <>
            <ReadinessNavigationProvider
              contract={contract}
              contracts={contracts}
              enabled={showPublicationGuidance}
              onSectionChange={setActiveSection}
            >
            <div className="flex flex-1 min-h-0 overflow-hidden">

              {activeSection !== 'import' && (
                <ContractSectionNav
                  contract={contract}
                  activeSection={activeSection}
                  onSectionChange={setActiveSection}
                  isNew={contract.dataset.length === 0 && contract.gitHistory.length === 0}
                  onDeleteContract={handleDeleteContract}
                  docCompact={docCompact}
                />
              )}

              <div className="flex flex-1 flex-col min-w-0 min-h-0 overflow-hidden">

                {activeSection !== 'import' && (
                  <AppTopBar
                    currentView={currentView}
                    contractTitle={contract.info.title}
                    onBack={handleBack}
                  />
                )}

                <div className="flex flex-1 flex-col min-w-0 min-h-0 overflow-hidden">

                <ContractTopBar
                  contract={contract}
                  activeTab={activeTab}
                  onTabChange={setActiveTab}
                  canPublish={canPublish}
                  publishBlockReason={publishBlockReason}
                  onPushToGit={() => {
                    if (!canPublish) return
                    setShowPushModal(true)
                  }}
                  onNewVersion={handleNewVersion}
                  onStartDraft={handleStartDraft}
                  onDeprecate={handleDeprecateContract}
                  onRetire={handleRetireContract}
                  collaborators={contract.collaborators ?? []}
                  onShare={() => setShowShareModal(true)}
                  myRole={myRole}
                  showReadinessToggle={showReadinessToggle}
                  readinessToggleLabel={readinessToggleLabel}
                  readinessPanelOpen={readinessOpen}
                  onReadinessToggle={() => setReadinessOpen(o => !o)}
                  hideStartDrafting={hideStartDrafting}
                />

                {contract.info.status === 'proposed' && (
                  <div className={cn(
                    'bg-neutral-50 border-b border-neutral-200 flex items-center flex-shrink-0',
                    docCompact ? 'px-4 py-1.5 gap-2' : 'px-6 py-2 gap-2.5',
                  )}>
                    <Lock className="h-3.5 w-3.5 text-neutral-600 flex-shrink-0" />
                    <p className="text-neutral-700 text-xs font-medium">
                      {getProposedLifecycleBannerMessage(contract)}
                    </p>
                  </div>
                )}

                {contract.info.status === 'deprecated' && (
                  <div className="bg-[#fff2ee] border-b border-[#ffc4b0] px-6 py-2 flex items-center gap-2.5 flex-shrink-0">
                    <AlertTriangle className="h-3.5 w-3.5 text-[#c12c11] flex-shrink-0" />
                    <p className="text-[#c12c11] text-xs font-medium">
                      This contract is <strong>Deprecated</strong> and should no longer be used.
                    </p>
                  </div>
                )}

                {contract.info.status === 'retired' && (
                  <div className="bg-neutral-100 border-b border-neutral-300 px-6 py-2 flex items-center gap-2.5 flex-shrink-0">
                    <AlertTriangle className="h-3.5 w-3.5 text-neutral-600 flex-shrink-0" />
                    <p className="text-neutral-700 text-xs font-medium">
                      This contract is <strong>Retired</strong> and is no longer maintained.
                    </p>
                  </div>
                )}

                {contract.info.status === 'active' && !contract.inRevision && (
                  <div className={cn(
                    'bg-[#edf6ff] border-b border-[#b8d0fb] flex items-center flex-shrink-0',
                    docCompact ? 'px-4 py-1.5 gap-2' : 'px-6 py-2 gap-2.5',
                  )}>
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
                        <ImportSection
                          onParsed={handleDDLParsed}
                          onStartFromScratch={handleStartFromScratch}
                          isLocked={isImportLocked}
                        />
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
                        <SchemaSection
                          tables={contract.dataset}
                          onChange={handleSchemaChange}
                          isLocked={isLocked}
                          docCompact={docCompact}
                        />
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
                      ) : activeSection === 'custom' ? (
                        <CustomPropertiesSection
                          customProperties={contract.customProperties ?? []}
                          onChange={handleCustomPropertiesChange}
                          isLocked={isLocked}
                          docCompact={docCompact}
                        />
                      ) : null}
                      </div>
                    </div>
                    {showReadinessPanel && panelPinned && (
                      <ReadinessPanel
                        contract={contract}
                        contracts={contracts}
                        myRole={myRole}
                        hasEditedSincePublish={hasEditedSincePublish}
                        layout="pinned"
                        docCompact={docCompact}
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
                          contracts={contracts}
                          myRole={myRole}
                          hasEditedSincePublish={hasEditedSincePublish}
                          layout="overlay"
                          onClose={() => setReadinessOpen(false)}
                          docCompact={docCompact}
                        />
                      </>
                    )}
                  </div>
                )}
                </div>
              </div>

            </div>
            </ReadinessNavigationProvider>

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
                allContracts={contracts}
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
            </>
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
