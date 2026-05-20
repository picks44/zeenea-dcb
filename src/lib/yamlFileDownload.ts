/** Builds `{contractId}_{version}.yaml` with filesystem-safe segments. */
export function buildYamlDownloadFilename(contractId: string, version: string): string {
  const safe = (segment: string) =>
    segment.replace(/[^\w.-]+/g, '-').replace(/^-+|-+$/g, '') || 'unknown'
  return `${safe(contractId)}_${safe(version)}.yaml`
}

/** Triggers a UTF-8 `.yaml` download with the same text shown in the YAML preview. */
export function downloadYamlFile(content: string, filename: string): void {
  const blob = new Blob([content], { type: 'text/yaml;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = filename
  anchor.rel = 'noopener'
  document.body.appendChild(anchor)
  anchor.click()
  document.body.removeChild(anchor)
  URL.revokeObjectURL(url)
}
