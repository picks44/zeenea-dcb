import { describe, expect, it } from 'vitest'
import { buildYamlDownloadFilename } from '@/lib/yamlFileDownload'

describe('buildYamlDownloadFilename', () => {
  it('uses contract id and version with .yaml extension', () => {
    expect(buildYamlDownloadFilename('sales-orders-a1b2c3d4', '1.0.0')).toBe(
      'sales-orders-a1b2c3d4_1.0.0.yaml',
    )
  })

  it('sanitizes unsafe path characters', () => {
    expect(buildYamlDownloadFilename('id/with space', 'v1/beta')).toBe('id-with-space_v1-beta.yaml')
  })

  it('falls back when segments are empty after sanitization', () => {
    expect(buildYamlDownloadFilename('///', '   ')).toBe('unknown_unknown.yaml')
  })
})
