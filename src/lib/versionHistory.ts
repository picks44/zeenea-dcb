import type { GitCommit } from '@/types/odcs'

export function publishCommitTitle(
  version: string,
  contractTitle: string,
  isFirstPublish: boolean,
): string {
  if (isFirstPublish) {
    return `Initial version of ${contractTitle.trim() || 'this contract'}`
  }
  return `Update to v${version}`
}

export function getCommitTitle(commit: GitCommit): string {
  if (commit.title?.trim()) return commit.title.trim()
  const legacy = (commit.message ?? '').trim()
  if (/^Update to v[\d.]+$/.test(legacy) || /^Initial version of /.test(legacy)) {
    return legacy
  }
  return `Update to v${commit.version}`
}

export function getCommitChangelog(commit: GitCommit): string {
  if (commit.changelog !== undefined) return commit.changelog
  const legacy = (commit.message ?? '').trim()
  const title = getCommitTitle(commit)
  if (legacy === title) return ''
  if (/^Update to v[\d.]+$/.test(legacy) || /^Initial version of /.test(legacy)) return ''
  return legacy
}

export function parseChangelogLines(text: string): string[] {
  return text.split(/\r?\n/).map(line => line.trim()).filter(Boolean)
}

/** Migrate legacy commits that stored changelog in `message`. */
export function migrateGitCommit(commit: GitCommit, contractTitle?: string): GitCommit & {
  title: string
  changelog: string
} {
  const legacyMessage = (commit.message ?? '').trim()

  if (commit.title?.trim()) {
    return {
      ...commit,
      title: commit.title.trim(),
      changelog: commit.changelog ?? '',
    }
  }

  const looksLikeTitle =
    /^Update to v[\d.]+$/.test(legacyMessage) ||
    /^Initial version of /.test(legacyMessage)

  if (looksLikeTitle) {
    return { ...commit, title: legacyMessage, changelog: '' }
  }

  const isLikelyFirst =
    commit.version === '1.0.0' &&
    (legacyMessage.toLowerCase().includes('initial') || legacyMessage === 'Initial publish')

  return {
    ...commit,
    title: isLikelyFirst
      ? publishCommitTitle(commit.version, contractTitle ?? '', true)
      : `Update to v${commit.version}`,
    changelog: legacyMessage,
  }
}
