import { useState } from 'react'
import { Save, Plus, Trash2, Upload, Check, Bell, FileText, Database } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Checkbox } from '@/components/ui/checkbox'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Tooltip } from '@/components/ui/tooltip'
import { Breadcrumb } from '@/components/ui/breadcrumb'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Avatar } from '@/components/ui/avatar'
import { EmptyState } from '@/components/ui/empty-state'
import { Toast, useToast } from '@/components/ui/toast'
import { ConfirmDialog, ConfirmConfig } from '@/components/ui/confirm-dialog'
import {
  Select, SelectContent, SelectItem,
  SelectTrigger, SelectValue,
} from '@/components/ui/select'
import {
  Dialog, DialogContent, DialogDescription,
  DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
} from '@/components/ui/dialog'

// ─── Color token data ─────────────────────────────────────────────────────────

const COLOR_PALETTES: { name: string; colors: { token: string; hex: string; shade: string }[] }[] = [
  {
    name: 'Neutral',
    colors: [
      { token: '--color-neutral-25',  hex: '#fbfbff', shade: '25'  },
      { token: '--color-neutral-50',  hex: '#f5f5fa', shade: '50'  },
      { token: '--color-neutral-100', hex: '#e4e4f0', shade: '100' },
      { token: '--color-neutral-200', hex: '#d3d3e5', shade: '200' },
      { token: '--color-neutral-300', hex: '#9898a7', shade: '300' },
      { token: '--color-neutral-400', hex: '#656574', shade: '400' },
      { token: '--color-neutral-500', hex: '#3f3f4a', shade: '500' },
      { token: '--color-neutral-600', hex: '#33333d', shade: '600' },
      { token: '--color-neutral-700', hex: '#2a2a30', shade: '700' },
      { token: '--color-neutral-900', hex: '#12131f', shade: '900' },
    ],
  },
  {
    name: 'Blue — Action',
    colors: [
      { token: '--color-blue-25',  hex: '#edf6ff', shade: '25'  },
      { token: '--color-blue-50',  hex: '#cfeafd', shade: '50'  },
      { token: '--color-blue-100', hex: '#b8d0fb', shade: '100' },
      { token: '--color-blue-700', hex: '#0550dc', shade: '700' },
      { token: '--color-blue-800', hex: '#0343be', shade: '800' },
    ],
  },
  {
    name: 'Cyan — Info',
    colors: [
      { token: '--color-cyan-25',  hex: '#ecf6ff', shade: '25'  },
      { token: '--color-cyan-100', hex: '#99cde8', shade: '100' },
      { token: '--color-cyan-700', hex: '#00699f', shade: '700' },
    ],
  },
  {
    name: 'Green — Success',
    colors: [
      { token: '--color-green-25',  hex: '#f0ffec', shade: '25'  },
      { token: '--color-green-50',  hex: '#d3efcd', shade: '50'  },
      { token: '--color-green-100', hex: '#a8d9a5', shade: '100' },
      { token: '--color-green-700', hex: '#047800', shade: '700' },
      { token: '--color-green-800', hex: '#035c00', shade: '800' },
    ],
  },
  {
    name: 'Red — Danger',
    colors: [
      { token: '--color-red-25',  hex: '#fff2ee', shade: '25'  },
      { token: '--color-red-50',  hex: '#ffdacf', shade: '50'  },
      { token: '--color-red-100', hex: '#ffb09b', shade: '100' },
      { token: '--color-red-700', hex: '#c12c11', shade: '700' },
      { token: '--color-red-800', hex: '#a02309', shade: '800' },
    ],
  },
  {
    name: 'Orange — Warning',
    colors: [
      { token: '--color-orange-25',  hex: '#fff8ec', shade: '25'  },
      { token: '--color-orange-50',  hex: '#ffebce', shade: '50'  },
      { token: '--color-orange-100', hex: '#ffd599', shade: '100' },
      { token: '--color-orange-700', hex: '#d27b00', shade: '700' },
    ],
  },
]

// ─── Layout helpers ───────────────────────────────────────────────────────────

function Section({
  title,
  description,
  children,
}: {
  title: string
  description?: string
  children: React.ReactNode
}) {
  return (
    <section className="mb-10">
      <div className="mb-4">
        <h2 className="text-[11px] font-semibold text-[#9898a7] uppercase tracking-widest">{title}</h2>
        {description && <p className="text-xs text-[#656574] mt-0.5">{description}</p>}
      </div>
      <div className="space-y-5">{children}</div>
    </section>
  )
}

function Row({ label, children }: { label?: string; children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-6">
      {label && (
        <span className="text-[11px] text-[#9898a7] w-20 flex-shrink-0 pt-2 leading-none">
          {label}
        </span>
      )}
      <div className="flex items-center gap-3 flex-wrap">{children}</div>
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export function ComponentsPage() {
  const [switchOn, setSwitchOn] = useState(false)
  const [checked, setChecked] = useState(false)
  const [radioVal, setRadioVal] = useState('b')
  const [confirmConfig, setConfirmConfig] = useState<ConfirmConfig | null>(null)
  const toast = useToast()

  return (
    <div className="flex-1 overflow-y-auto px-10 py-8">
      <div className="max-w-[860px]">

        <h1 className="text-xl font-semibold text-[#12131f] mb-1">Components</h1>
        <p className="text-sm text-[#656574] mb-8">
          UI component library — Actian Design System v1.3.0
        </p>

        <Separator className="mb-8" />

        {/* ── Colors ── */}
        <Section title="Colors" description="Actian DS semantic color palettes. Use CSS custom properties in code, never raw hex.">
          <div className="space-y-6">
            {COLOR_PALETTES.map(palette => (
              <div key={palette.name}>
                <p className="text-[11px] font-medium text-[#656574] mb-2">{palette.name}</p>
                <div className="flex flex-wrap gap-2">
                  {palette.colors.map(({ token, hex, shade }) => (
                    <div key={token} className="flex flex-col items-center gap-1.5 w-[72px]">
                      <div
                        className="w-full h-10 rounded-md border border-black/[0.06] shadow-sm"
                        style={{ backgroundColor: hex }}
                      />
                      <div className="text-center">
                        <p className="text-[10px] font-medium text-[#33333d] leading-none">{shade}</p>
                        <p className="text-[9px] font-mono text-[#9898a7] mt-0.5 leading-none">{hex}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </Section>

        <Separator className="mb-8" />

        {/* ── Button ── */}
        <Section title="Button" description="Interactive elements that trigger actions.">
          <Row label="Variants">
            <Button>Primary</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="outline">Outline</Button>
            <Button variant="ghost">Ghost</Button>
            <Button variant="destructive">Destructive</Button>
            <Button variant="success">Success</Button>
            <Button variant="link">Link</Button>
          </Row>
          <Row label="Sizes">
            <Button size="lg">Large</Button>
            <Button>Default</Button>
            <Button size="sm">Small</Button>
            <Button size="icon"><Plus className="h-4 w-4" /></Button>
            <Button size="icon-sm"><Plus className="h-3 w-3" /></Button>
          </Row>
          <Row label="With icon">
            <Button><Save className="h-4 w-4" />Save draft</Button>
            <Button variant="outline"><Upload className="h-4 w-4" />Publish</Button>
            <Button variant="destructive"><Trash2 className="h-4 w-4" />Delete</Button>
          </Row>
          <Row label="Disabled">
            <Button disabled>Primary</Button>
            <Button variant="secondary" disabled>Secondary</Button>
            <Button variant="outline" disabled>Outline</Button>
            <Button variant="ghost" disabled>Ghost</Button>
          </Row>
        </Section>

        <Separator className="mb-8" />

        {/* ── Input ── */}
        <Section title="Input" description="Single-line text entry.">
          <Row label="Default">
            <Input placeholder="Enter a value…" className="w-56" />
            <Input defaultValue="Filled value" className="w-56" />
          </Row>
          <Row label="With label">
            <div className="space-y-1.5">
              <Label htmlFor="inp-demo">Contract title</Label>
              <Input id="inp-demo" placeholder="e.g. Customer orders" className="w-56" />
            </div>
          </Row>
          <Row label="Disabled">
            <Input placeholder="Disabled" disabled className="w-56" />
          </Row>
        </Section>

        <Separator className="mb-8" />

        {/* ── Textarea ── */}
        <Section title="Textarea" description="Multi-line text entry.">
          <Row>
            <Textarea placeholder="Enter a description…" className="w-80 h-20 resize-none" />
            <Textarea placeholder="Disabled" disabled className="w-56 h-20 resize-none" />
          </Row>
        </Section>

        <Separator className="mb-8" />

        {/* ── Select ── */}
        <Section title="Select" description="Dropdown choice from a predefined list.">
          <Row label="Default">
            <Select>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Pick a type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="string">Text</SelectItem>
                <SelectItem value="integer">Whole number</SelectItem>
                <SelectItem value="number">Decimal</SelectItem>
                <SelectItem value="boolean">Yes / No</SelectItem>
                <SelectItem value="date">Date</SelectItem>
              </SelectContent>
            </Select>
          </Row>
          <Row label="Disabled">
            <Select disabled>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Disabled" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="a">Option</SelectItem>
              </SelectContent>
            </Select>
          </Row>
        </Section>

        <Separator className="mb-8" />

        {/* ── Checkbox ── */}
        <Section title="Checkbox" description="Binary on/off selection.">
          <Row label="States">
            <div className="flex items-center gap-2">
              <Checkbox id="cb-off" />
              <Label htmlFor="cb-off">Unchecked</Label>
            </div>
            <div className="flex items-center gap-2">
              <Checkbox id="cb-on" checked onCheckedChange={() => {}} />
              <Label htmlFor="cb-on">Checked</Label>
            </div>
            <div className="flex items-center gap-2">
              <Checkbox id="cb-ind" indeterminate />
              <Label htmlFor="cb-ind">Indeterminate</Label>
            </div>
            <div className="flex items-center gap-2">
              <Checkbox id="cb-dis" disabled />
              <Label htmlFor="cb-dis" className="opacity-50">Disabled</Label>
            </div>
          </Row>
          <Row label="Interactive">
            <div className="flex items-center gap-2">
              <Checkbox
                id="cb-live"
                checked={checked}
                onCheckedChange={v => setChecked(v === true)}
              />
              <Label htmlFor="cb-live">Required field {checked ? '(checked)' : ''}</Label>
            </div>
          </Row>
        </Section>

        <Separator className="mb-8" />

        {/* ── Radio ── */}
        <Section title="Radio Group" description="Single selection from a set of options.">
          <Row>
            <RadioGroup value={radioVal} onValueChange={v => v !== null && setRadioVal(String(v))} className="gap-2.5">
              {['a', 'b', 'c'].map((v, i) => (
                <div key={v} className="flex items-center gap-2">
                  <RadioGroupItem value={v} id={`r-${v}`} />
                  <Label htmlFor={`r-${v}`}>Option {['A', 'B', 'C'][i]}</Label>
                </div>
              ))}
              <div className="flex items-center gap-2">
                <RadioGroupItem value="d" id="r-d" disabled />
                <Label htmlFor="r-d" className="opacity-50">Disabled</Label>
              </div>
            </RadioGroup>
          </Row>
        </Section>

        <Separator className="mb-8" />

        {/* ── Switch ── */}
        <Section title="Switch" description="Toggle between enabled and disabled states.">
          <Row label="States">
            <div className="flex items-center gap-2">
              <Switch id="sw-off" />
              <Label htmlFor="sw-off">Off</Label>
            </div>
            <div className="flex items-center gap-2">
              <Switch id="sw-on" checked onCheckedChange={() => {}} />
              <Label htmlFor="sw-on">On</Label>
            </div>
            <div className="flex items-center gap-2">
              <Switch id="sw-dis" disabled />
              <Label htmlFor="sw-dis" className="opacity-50">Disabled</Label>
            </div>
          </Row>
          <Row label="Interactive">
            <div className="flex items-center gap-2">
              <Switch
                id="sw-live"
                checked={switchOn}
                onCheckedChange={setSwitchOn}
              />
              <Label htmlFor="sw-live" className="flex items-center gap-1.5">
                <Bell className="h-3.5 w-3.5 text-[#656574]" />
                Notifications {switchOn ? 'enabled' : 'disabled'}
              </Label>
            </div>
          </Row>
        </Section>

        <Separator className="mb-8" />

        {/* ── Badge ── */}
        <Section title="Badge" description="Compact labels for status and metadata.">
          <Row label="Generic">
            <Badge>Default</Badge>
            <Badge variant="secondary">Secondary</Badge>
            <Badge variant="outline">Outline</Badge>
            <Badge variant="destructive">Destructive</Badge>
          </Row>
          <Row label="Lifecycle">
            <Badge variant="draft">Draft</Badge>
            <Badge variant="active">Active</Badge>
            <Badge variant="deprecated">Deprecated</Badge>
          </Row>
        </Section>

        <Separator className="mb-8" />

        {/* ── Tooltip ── */}
        <Section title="Tooltip" description="Contextual hint shown on hover after a short delay.">
          <Row label="Positions">
            {(['top', 'bottom', 'left', 'right'] as const).map(side => (
              <Tooltip key={side} content={`${side} tooltip`} side={side} delayDuration={200}>
                <Button variant="outline" size="sm" className="capitalize">{side}</Button>
              </Tooltip>
            ))}
          </Row>
          <Row label="On disabled">
            <Tooltip content="Fill in required fields first." side="top" delayDuration={200}>
              <span>
                <Button disabled size="sm">Disabled action</Button>
              </span>
            </Tooltip>
          </Row>
        </Section>

        <Separator className="mb-8" />

        {/* ── Breadcrumb ── */}
        <Section title="Breadcrumb" description="Navigation path indicator showing the current location.">
          <Row label="1 level">
            <Breadcrumb items={[{ label: 'Contracts' }]} />
          </Row>
          <Row label="2 levels">
            <Breadcrumb items={[
              { label: 'Contracts', onClick: () => {} },
              { label: 'Customer orders' },
            ]} />
          </Row>
          <Row label="3 levels">
            <Breadcrumb items={[
              { label: 'Home', onClick: () => {} },
              { label: 'Contracts', onClick: () => {} },
              { label: 'Customer orders' },
            ]} />
          </Row>
        </Section>

        <Separator className="mb-8" />

        {/* ── Tabs ── */}
        <Section title="Tabs" description="Switch between related content panels.">
          <Row label="2 items">
            <Tabs defaultValue="form">
              <TabsList>
                <TabsTrigger value="form">Form</TabsTrigger>
                <TabsTrigger value="yaml">YAML</TabsTrigger>
              </TabsList>
              <TabsContent value="form">
                <p className="text-xs text-[#656574]">Form view content.</p>
              </TabsContent>
              <TabsContent value="yaml">
                <p className="text-xs text-[#656574]">YAML view content.</p>
              </TabsContent>
            </Tabs>
          </Row>
          <Row label="4 items">
            <Tabs defaultValue="overview">
              <TabsList>
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="schema">Schema</TabsTrigger>
                <TabsTrigger value="stakeholders">Stakeholders</TabsTrigger>
                <TabsTrigger value="versions" disabled>Versions</TabsTrigger>
              </TabsList>
            </Tabs>
          </Row>
        </Section>

        <Separator className="mb-8" />

        {/* ── Separator ── */}
        <Section title="Separator" description="Visual divider between content sections.">
          <Row label="Horizontal">
            <div className="w-64 space-y-2">
              <p className="text-xs text-[#3f3f4a]">Section A</p>
              <Separator />
              <p className="text-xs text-[#3f3f4a]">Section B</p>
            </div>
          </Row>
          <Row label="Vertical">
            <div className="flex items-center gap-3 h-5">
              <span className="text-xs text-[#3f3f4a]">Left</span>
              <Separator orientation="vertical" />
              <span className="text-xs text-[#3f3f4a]">Right</span>
            </div>
          </Row>
        </Section>

        <Separator className="mb-8" />

        {/* ── Dialog ── */}
        <Section title="Dialog" description="Modal overlay for focused, blocking interactions.">
          <Row>
            <Dialog>
              <DialogTrigger render={<Button variant="outline">Open dialog</Button>} />
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Confirm deletion</DialogTitle>
                  <DialogDescription>
                    This action is permanent and cannot be undone. The contract and all its version
                    history will be removed.
                  </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                  <Button variant="outline">Cancel</Button>
                  <Button variant="destructive">
                    <Trash2 className="h-4 w-4" />
                    Delete contract
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            <Dialog>
              <DialogTrigger render={<Button>Save &amp; publish</Button>} />
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Publish to Git</DialogTitle>
                  <DialogDescription>
                    A new commit will be created on the <code className="font-mono text-[#0550dc]">main</code> branch
                    with the current contract state.
                  </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                  <Button variant="outline">Cancel</Button>
                  <Button>
                    <Check className="h-4 w-4" />
                    Publish
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </Row>
        </Section>

        <Separator className="mb-8" />

        {/* ── Avatar ── */}
        <Section title="Avatar" description="User identity circle with initials.">
          <Row label="Sizes">
            <Avatar name="Florent L." size="sm" />
            <Avatar name="Florent L." size="md" />
            <Avatar name="Florent L." size="lg" />
          </Row>
          <Row label="Initials">
            <Avatar name="John Doe" />
            <Avatar name="Alice" />
            <Avatar name="X" />
          </Row>
        </Section>

        <Separator className="mb-8" />

        {/* ── EmptyState ── */}
        <Section title="Empty State" description="Placeholder for empty content areas.">
          <Row label="With action">
            <EmptyState
              icon={<Database className="h-6 w-6" />}
              title="No tables defined"
              description="Import a DDL to auto-populate, or add a table manually."
              action={{ label: 'Add first table', onClick: () => {} }}
            />
          </Row>
          <Row label="Without action">
            <EmptyState
              icon={<FileText className="h-6 w-6" />}
              title="No contracts yet"
              description="Create your first contract to get started."
            />
          </Row>
        </Section>

        <Separator className="mb-8" />

        {/* ── Toast ── */}
        <Section title="Toast" description="Ephemeral status notification, bottom-right.">
          <Row>
            <Button variant="outline" size="sm" onClick={() => toast.show({ message: 'Draft saved' })}>
              Show toast
            </Button>
            <Button variant="outline" size="sm" onClick={() => toast.show({ message: 'Changes published', durationMs: 4000 })}>
              4s toast
            </Button>
          </Row>
        </Section>

        <Separator className="mb-8" />

        {/* ── ConfirmDialog ── */}
        <Section title="Confirm Dialog" description="Modal confirmation replacing browser dialogs.">
          <Row>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => setConfirmConfig({
                title: 'Delete contract',
                description: 'Delete "Customer orders"? This cannot be undone.',
                confirmLabel: 'Delete',
                variant: 'destructive',
                onConfirm: () => toast.show({ message: 'Contract deleted' }),
              })}
            >
              <Trash2 className="h-4 w-4" />
              Delete contract
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setConfirmConfig({
                title: 'Discard changes',
                description: 'Discard all unpublished changes and revert to v1.2.0?',
                confirmLabel: 'Discard',
                variant: 'destructive',
                onConfirm: () => toast.show({ message: 'Changes discarded' }),
              })}
            >
              Discard changes
            </Button>
          </Row>
        </Section>

      </div>
      <Toast visible={toast.visible} message={toast.message} />
      <ConfirmDialog config={confirmConfig} onClose={() => setConfirmConfig(null)} />
    </div>
  )
}
