import { useMemo } from 'react'
import { DataContract } from '@/types/odcs'
import { generateODCSYaml } from '@/lib/odcsYamlGenerator'

interface YamlPanelProps {
  contract: DataContract
}

export function YamlPanel({ contract }: YamlPanelProps) {
  const yamlText = useMemo(() => generateODCSYaml(contract), [contract])
  const lines = yamlText.split('\n')

  return (
    <div className="w-[340px] flex-shrink-0 border-l border-[#d3d3e5] bg-[#fbfbff] flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="px-4 py-2.5 border-b border-[#d3d3e5] flex items-center justify-between flex-shrink-0">
        <span className="text-[11px] font-semibold text-[#3f3f4a] uppercase tracking-wide">
          YAML (READ-ONLY)
        </span>
      </div>

      {/* Code */}
      <div className="flex-1 overflow-auto">
        <pre className="text-[11px] font-mono leading-5 min-w-0">
          <table className="w-full border-collapse">
            <tbody>
              {lines.map((line, i) => (
                <tr key={i} className="hover:bg-[#f5f5fa]/60">
                  <td className="select-none text-right pr-3 pl-3 text-[#656574] text-[10px] leading-5 border-r border-[#d3d3e5] w-8">
                    {i + 1}
                  </td>
                  <td className="pl-3 pr-4 text-[#33333d] leading-5 whitespace-pre">
                    {line || ' '}
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
