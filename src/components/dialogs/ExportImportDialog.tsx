import { useState } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Checkbox } from '@/components/ui/checkbox'
import { 
  Download, 
  Upload, 
  Copy, 
  CheckCircle,
  Package,
  Target,
  MapPin
} from '@phosphor-icons/react'
import { toast } from 'sonner'
import { motion } from 'framer-motion'
import type { Realm, Quest, Theme } from '@/lib/types'
import { THEME_CONFIGS } from '@/lib/types'
import { generateId } from '@/lib/game-utils'
import { ExportPackageSchema } from '@/lib/schemas'
import { sanitizePlainText } from '@/lib/sanitize'
import { IMPORT_FILE_MAX_SIZE } from '@/lib/constants'
import { getImportErrorMessage } from '@/lib/error-messages'
import { z } from 'zod'

interface ExportImportDialogProps {
  open: boolean
  realms: Realm[]
  quests: Quest[]
  theme: Theme
  onClose: () => void
  onImportRealms: (realms: Realm[]) => void
  onImportQuests: (quests: Quest[]) => void
}

type ExportPackage = z.infer<typeof ExportPackageSchema>

export function ExportImportDialog({
  open,
  realms,
  quests,
  theme,
  onClose,
  onImportRealms,
  onImportQuests
}: ExportImportDialogProps) {
  const themeConfig = THEME_CONFIGS[theme]
  const [importText, setImportText] = useState('')
  const [selectedRealms, setSelectedRealms] = useState<Set<string>>(new Set())
  const [exportText, setExportText] = useState('')
  const [copied, setCopied] = useState(false)

  const handleSelectRealm = (realmId: string) => {
    const newSelected = new Set(selectedRealms)
    if (newSelected.has(realmId)) {
      newSelected.delete(realmId)
    } else {
      newSelected.add(realmId)
    }
    setSelectedRealms(newSelected)
  }

  const handleSelectAll = () => {
    if (selectedRealms.size === realms.length) {
      setSelectedRealms(new Set())
    } else {
      setSelectedRealms(new Set(realms.map(r => r.id)))
    }
  }

  const handleExport = () => {
    const selectedRealmsList = realms.filter(r => selectedRealms.has(r.id))
    const selectedQuestsList = quests.filter(q => selectedRealms.has(q.realmId))

    const exportPackage: ExportPackage = {
      version: '1.0',
      exportedAt: Date.now(),
      realms: selectedRealmsList,
      quests: selectedQuestsList,
      theme
    }

    const jsonString = JSON.stringify(exportPackage, null, 2)
    setExportText(jsonString)
    toast.success('Export ready!', {
      description: `${selectedRealmsList.length} ${themeConfig.realmLabel.toLowerCase()}(s) with ${selectedQuestsList.length} ${themeConfig.questLabel.toLowerCase()}(s)`
    })
  }

  const handleCopyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(exportText)
      setCopied(true)
      toast.success('Copied to clipboard!')
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      toast.error('Failed to copy to clipboard')
    }
  }

  const handleImport = () => {
    try {
      // Validate file size (using byte length of the text)
      const textSize = new Blob([importText]).size
      if (textSize > IMPORT_FILE_MAX_SIZE) {
        throw new Error(`Import data exceeds maximum size of ${Math.round(IMPORT_FILE_MAX_SIZE / 1024)}KB`)
      }

      if (!importText.trim()) {
        throw new Error('Please paste import data')
      }

      let parsedJson: unknown
      try {
        parsedJson = JSON.parse(importText)
      } catch {
        throw new Error('Invalid JSON format')
      }

      const validationResult = ExportPackageSchema.safeParse(parsedJson)

      if (!validationResult.success) {
        console.error('Validation errors:', validationResult.error.format())
        throw new Error('Invalid package structure')
      }

      const importPackage = validationResult.data

      const newRealms = importPackage.realms.map(realm => ({
        ...realm,
        id: generateId(),
        name: sanitizePlainText(realm.name),
        description: sanitizePlainText(realm.description),
        createdAt: Date.now()
      }))

      const realmIdMap = new Map(
        importPackage.realms.map((oldRealm, index) => [oldRealm.id, newRealms[index].id])
      )

      const newQuests = importPackage.quests.map(quest => ({
        ...quest,
        id: generateId(),
        realmId: realmIdMap.get(quest.realmId) || quest.realmId,
        name: sanitizePlainText(quest.name),
        description: sanitizePlainText(quest.description),
        status: 'available' as const,
        createdAt: Date.now()
      }))

      onImportRealms(newRealms)
      onImportQuests(newQuests)

      toast.success('Import successful!', {
        description: `Imported ${newRealms.length} ${themeConfig.realmLabel.toLowerCase()}(s) with ${newQuests.length} ${themeConfig.questLabel.toLowerCase()}(s)`
      })

      setImportText('')
      onClose()
    } catch (err) {
      const errorDetails = getImportErrorMessage(err)
      toast.error(errorDetails.title, {
        description: errorDetails.description
      })
    }
  }

  const handleDownloadFile = () => {
    const blob = new Blob([exportText], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `aetheria-export-${Date.now()}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    toast.success('Downloaded export file!')
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="glass-panel max-w-3xl max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Package size={24} className="text-primary" />
            Export & Import
          </DialogTitle>
          <DialogDescription>
            Share {themeConfig.realmLabel.toLowerCase()}s and {themeConfig.questLabel.toLowerCase()}s with other teachers
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="export" className="flex-1 flex flex-col">
          <TabsList className="glass-panel w-full">
            <TabsTrigger value="export" className="flex-1 gap-2">
              <Download size={18} />
              Export
            </TabsTrigger>
            <TabsTrigger value="import" className="flex-1 gap-2">
              <Upload size={18} />
              Import
            </TabsTrigger>
          </TabsList>

          <TabsContent value="export" className="flex-1 space-y-4">
            <Card className="glass-panel">
              <CardHeader>
                <CardTitle className="text-lg">Select {themeConfig.realmLabel}s to Export</CardTitle>
                <CardDescription>
                  Choose which {themeConfig.realmLabel.toLowerCase()}s and their {themeConfig.questLabel.toLowerCase()}s to export
                </CardDescription>
              </CardHeader>
              <CardContent>
                {realms.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">
                    No {themeConfig.realmLabel.toLowerCase()}s available to export
                  </p>
                ) : (
                  <ScrollArea className="h-[200px] pr-4">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 p-2 rounded-lg border border-border">
                        <Checkbox
                          id="select-all"
                          checked={selectedRealms.size === realms.length && realms.length > 0}
                          onCheckedChange={handleSelectAll}
                        />
                        <Label htmlFor="select-all" className="font-semibold cursor-pointer">
                          Select All
                        </Label>
                      </div>
                      {realms.map((realm) => {
                        const realmQuestCount = quests.filter(q => q.realmId === realm.id).length
                        return (
                          <motion.div
                            key={realm.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="flex items-center gap-3 p-3 rounded-lg border border-border bg-card/30"
                          >
                            <Checkbox
                              id={realm.id}
                              checked={selectedRealms.has(realm.id)}
                              onCheckedChange={() => handleSelectRealm(realm.id)}
                            />
                            <div className="flex-1">
                              <Label htmlFor={realm.id} className="cursor-pointer flex items-center gap-2">
                                <MapPin size={16} style={{ color: realm.color }} />
                                {realm.name}
                              </Label>
                              <p className="text-xs text-muted-foreground mt-1">
                                {realmQuestCount} {themeConfig.questLabel.toLowerCase()}
                                {realmQuestCount !== 1 ? 's' : ''}
                              </p>
                            </div>
                          </motion.div>
                        )
                      })}
                    </div>
                  </ScrollArea>
                )}
              </CardContent>
            </Card>

            <div className="flex gap-2">
              <Button
                onClick={handleExport}
                disabled={selectedRealms.size === 0}
                className="gap-2"
              >
                <Download size={18} />
                Generate Export
              </Button>
            </div>

            {exportText && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-2"
              >
                <Label>Export Data</Label>
                <Textarea
                  value={exportText}
                  readOnly
                  className="font-mono text-xs h-[150px]"
                />
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={handleCopyToClipboard}
                    className="gap-2"
                  >
                    {copied ? (
                      <>
                        <CheckCircle size={18} />
                        Copied!
                      </>
                    ) : (
                      <>
                        <Copy size={18} />
                        Copy to Clipboard
                      </>
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={handleDownloadFile}
                    className="gap-2"
                  >
                    <Download size={18} />
                    Download File
                  </Button>
                </div>
              </motion.div>
            )}
          </TabsContent>

          <TabsContent value="import" className="flex-1 space-y-4">
            <Card className="glass-panel">
              <CardHeader>
                <CardTitle className="text-lg">Import Data</CardTitle>
                <CardDescription>
                  Paste the exported JSON data to import {themeConfig.realmLabel.toLowerCase()}s and {themeConfig.questLabel.toLowerCase()}s
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="import-text">Export Package JSON</Label>
                  <Textarea
                    id="import-text"
                    value={importText}
                    onChange={(e) => setImportText(e.target.value)}
                    placeholder={`Paste exported JSON here...`}
                    className="font-mono text-xs h-[300px]"
                  />
                </div>

                <div className="p-4 rounded-lg bg-muted/50 border border-border space-y-2">
                  <p className="text-sm font-medium flex items-center gap-2">
                    <Target size={16} className="text-primary" />
                    Import Notes
                  </p>
                  <ul className="text-xs text-muted-foreground space-y-1 ml-6 list-disc">
                    <li>All imported content will get new IDs</li>
                    <li>{themeConfig.questLabel}s will be set to "available" status</li>
                    <li>Existing content will not be affected</li>
                    <li>You can safely import the same package multiple times</li>
                  </ul>
                </div>

                <Button
                  onClick={handleImport}
                  disabled={!importText.trim()}
                  className="w-full gap-2"
                >
                  <Upload size={18} />
                  Import Content
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
