import { useState } from 'react'
import { Copy, Check } from 'lucide-react'
import { DataContract } from '@/types/odcs'
import { generateODCSYaml } from '@/lib/odcsYamlGenerator'
import { Button } from '@/components/ui/button'
import { EXPORT_COVERAGE } from '@/lib/uxCopy'

function colorYamlValue(value: string): React.ReactNode {
  if (!value) return null
  const v = value.trim()
  if (v === 'true' || v === 'false')
    return <span className="text-[#d27b00] font-medium">{value}</span>
  if (v === 'null' || v === '~')
    return <span className="text-[#656574] italic">{value}</span>
  if (/^-?\d+(\.\d+)?$/.test(v))
    return <span className="text-[#0550dc]">{value}</span>
  if (v.startsWith('"') || v.startsWith("'"))
    return <span className="text-[#047800]">{value}</span>
  if (v === '|' || v === '>')
    return <span className="text-[#656574]">{value}</span>
  return <span className="text-[#33333d]">{value}</span>
}

function YamlLine({ line }: { line: string }): React.ReactNode {
  if (!line.trim()) return <span>{' '}</span>
  if (/^\s*#/.test(line))
    return <span className="text-[#656574] italic">{line}</span>
  if (/^\s*---\s*$/.test(line))
    return <span className="text-[#656574]">{line}</span>

  const arrMatch = line.match(/^(\s*)(- )(.*)$/)
  if (arrMatch) {
    const [, indent, dash, rest] = arrMatch
    const kv = rest.match(/^([\w.-]+)(\s*:\s*)(.*)$/)
    if (kv) {
      return <span>{indent}<span className="text-[#656574]">{dash}</span><span className="font-semibold text-[#00699f]">{kv[1]}</span><span className="text-[#656574]">{kv[2]}</span>{colorYamlValue(kv[3])}</span>
    }
    return <span>{indent}<span className="text-[#656574]">{dash}</span>{colorYamlValue(rest)}</span>
  }

  const kvMatch = line.match(/^(\s*)([\w.-]+)(\s*:\s*)(.*)$/)
  if (kvMatch) {
    const [, indent, key, colon, value] = kvMatch
    return (
      <span>
        {indent}
        <span className="font-semibold text-[#00699f]">{key}</span>
        <span className="text-[#656574]">{colon}</span>
        {colorYamlValue(value)}
      </span>
    )
  }

  return <span className="text-[#33333d]">{line}</span>
}

interface YamlViewProps {
  contract: DataContract
}

export function YamlView({ contract }: YamlViewProps) {
  const [copied, setCopied] = useState(false)
  const yaml = generateODCSYaml(contract)
  const lines = yaml.split('\n')

  const handleCopy = () => {
    navigator.clipboard.writeText(yaml)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  return (
    <div className="flex-1 flex flex-col min-w-0 overflow-hidden bg-[#f8f8f8]">
      <div className="flex items-center justify-between px-6 py-2.5 bg-white border-b border-[#d3d3e5] flex-shrink-0">
        <span className="text-xs font-semibold text-[#3f3f4a] uppercase tracking-wide">ODCS v3.1.0 — Generated export (read-only)</span>
        <Button variant="outline" size="sm" onClick={handleCopy} className="gap-1.5">
          {copied ? <><Check className="h-3 w-3 text-green-700" /> Copied</> : <><Copy className="h-3 w-3" /> Copy YAML</>}
        </Button>
      </div>
      <div className="px-6 py-2 bg-[#fbfbff] border-b border-[#e4e4f0] space-y-1 flex-shrink-0">
        <p className="text-[10px] text-[#656574] leading-snug">{EXPORT_COVERAGE.exported}</p>
        <p className="text-[10px] text-[#656574] leading-snug">{EXPORT_COVERAGE.workflow}</p>
      </div>
      <div className="flex-1 overflow-auto">
        <pre className="text-[12.5px] font-mono leading-[22px] min-w-0">
          <table className="border-collapse">
            <tbody>
              {lines.map((line, i) => (
                <tr key={i} className="hover:bg-black/[0.03]">
                  <td className="select-none text-right pr-4 pl-6 text-[#9898a7] text-[11px] leading-[22px] border-r border-[#d3d3e5] w-10 sticky left-0 bg-[#f8f8f8]">
                    {i + 1}
                  </td>
                  <td className="pl-5 pr-10 leading-[22px] whitespace-pre">
                    <YamlLine line={line} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </pre>
      </div>
    </div>
  )
}
