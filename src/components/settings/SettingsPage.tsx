import { useRef, useState } from 'react'
import { toast } from 'sonner'
import { Download, Trash2, Upload, User as UserIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { useStore, getSnapshot } from '@/store'
import { useCurrentUser } from '@/hooks/useCurrentUser'
import { CURRENCIES } from '@/lib/currency'
import { downloadSnapshot, readSnapshotFromFile } from '@/lib/export'

export function SettingsPage() {
  const current = useCurrentUser()
  const preferences = useStore((s) => s.preferences)
  const setCurrency = useStore((s) => s.setCurrency)
  const updateProfile = useStore((s) => s.updateProfile)
  const importSnapshot = useStore((s) => s.importSnapshot)
  const resetAll = useStore((s) => s.resetAll)
  const [resetOpen, setResetOpen] = useState(false)
  const importInputRef = useRef<HTMLInputElement>(null)

  const [name, setName] = useState(current?.name ?? '')
  const [email, setEmail] = useState(current?.email ?? '')

  if (!current) return null

  function handleSaveProfile() {
    if (!name.trim()) {
      toast.error('Name cannot be empty')
      return
    }
    updateProfile(current!.id, { name: name.trim(), email: email.trim() })
    toast.success('Profile updated')
  }

  function handleExport() {
    const snapshot = getSnapshot()
    downloadSnapshot(snapshot, `pie-data-${new Date().toISOString().slice(0, 10)}.json`)
    toast.success('Snapshot downloaded')
  }

  async function handleImport(file: File) {
    try {
      const data = await readSnapshotFromFile(file)
      importSnapshot(data)
      toast.success('Snapshot imported')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to import')
    }
  }

  function confirmReset() {
    resetAll()
    setResetOpen(false)
    toast.info('All data cleared')
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="font-serif text-3xl font-semibold">Settings</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Tailor Pie to your taste and manage your local data.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserIcon className="h-4 w-4 text-accent" /> Your profile
          </CardTitle>
          <CardDescription>Only used to identify you on this device.</CardDescription>
        </CardHeader>
        <CardContent className="grid sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="profile-name">Display name</Label>
            <Input
              id="profile-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="profile-email">Email</Label>
            <Input
              id="profile-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="sm:col-span-2">
            <Button onClick={handleSaveProfile}>Save profile</Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Currency</CardTitle>
          <CardDescription>
            Used for displaying amounts across the app. Stored as the global default.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Select value={preferences.currency} onValueChange={setCurrency}>
            <SelectTrigger className="max-w-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {CURRENCIES.map((c) => (
                <SelectItem key={c.code} value={c.code}>
                  {c.code} — {c.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Data</CardTitle>
          <CardDescription>
            Pie keeps everything in your browser. Export to back up or seed a demo.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={handleExport}>
            <Download className="h-4 w-4" /> Export JSON
          </Button>
          <Button
            variant="outline"
            onClick={() => importInputRef.current?.click()}
          >
            <Upload className="h-4 w-4" /> Import JSON
          </Button>
          <input
            ref={importInputRef}
            type="file"
            accept="application/json"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0]
              if (file) handleImport(file)
              e.target.value = ''
            }}
          />
          <Button
            variant="outline"
            className="text-destructive border-destructive/50 hover:bg-destructive/10"
            onClick={() => setResetOpen(true)}
          >
            <Trash2 className="h-4 w-4" /> Reset all data
          </Button>
        </CardContent>
      </Card>

      <Dialog open={resetOpen} onOpenChange={setResetOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reset everything?</DialogTitle>
            <DialogDescription>
              This deletes all users, groups, expenses, and settlements stored on this device. You
              can’t undo this. Consider exporting a snapshot first.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setResetOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmReset}>
              Yes, wipe all data
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
