/**
 * Syllabus Manager
 *
 * CRUD interface for managing syllabi for a realm/course.
 * Supports file upload, preview, and download.
 */

import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { FileUpload } from '@/components/ui/file-upload'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from '@/components/ui/dialog'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from '@/components/ui/alert-dialog'
import {
  Plus,
  File,
  FilePdf,
  FileDoc,
  Trash,
  DownloadSimple,
  Eye,
  Warning
} from '@phosphor-icons/react'
import { useKV } from '@github/spark/hooks'
import { useFileUpload } from '@/hooks/use-file-upload'
import { toast } from 'sonner'
import { v4 as uuid } from 'uuid'
import type { Syllabus } from '@/lib/types'

interface SyllabusManagerProps {
  realmId: string
  realmName?: string
}

export function SyllabusManager({ realmId, realmName }: SyllabusManagerProps) {
  const [allSyllabi, setAllSyllabi] = useKV<Syllabus[]>('aetheria-syllabi', [])
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)
  const [formTitle, setFormTitle] = useState('')
  const [selectedFile, setSelectedFile] = useState<File | null>(null)

  const { upload, remove, progress, state, error, reset } = useFileUpload({
    onSuccess: () => {
      toast.success('Syllabus uploaded successfully')
    },
    onError: (err) => {
      toast.error(`Upload failed: ${err.message}`)
    }
  })

  // Filter syllabi for this realm
  const syllabi = useMemo(() => {
    return (allSyllabi || []).filter(s => s.realmId === realmId)
  }, [allSyllabi, realmId])

  const handleOpenAdd = () => {
    setFormTitle('')
    setSelectedFile(null)
    reset()
    setShowAddDialog(true)
  }

  const handleFileSelect = (file: File) => {
    setSelectedFile(file)
    // Auto-fill title from filename if empty
    if (!formTitle) {
      const nameWithoutExt = file.name.replace(/\.[^/.]+$/, '')
      setFormTitle(nameWithoutExt)
    }
  }

  const handleSave = async () => {
    if (!formTitle.trim()) {
      toast.error('Please enter a title')
      return
    }

    if (!selectedFile) {
      toast.error('Please select a file')
      return
    }

    // Upload file
    const result = await upload(selectedFile, 'syllabi', realmId)

    if (result) {
      // Create syllabus record
      const newSyllabus: Syllabus = {
        id: uuid(),
        realmId,
        title: formTitle.trim(),
        fileUrl: result.downloadUrl,
        storagePath: result.storagePath,
        fileName: selectedFile.name,
        fileSize: selectedFile.size,
        createdAt: Date.now(),
        updatedAt: Date.now()
      }

      setAllSyllabi([...(allSyllabi || []), newSyllabus])
      setShowAddDialog(false)
    }
  }

  const handleDelete = async (syllabusId: string) => {
    const syllabus = syllabi.find(s => s.id === syllabusId)
    if (!syllabus) return

    // Delete file from storage if path exists
    if (syllabus.storagePath) {
      await remove(syllabus.storagePath)
    }

    // Remove from list
    setAllSyllabi((allSyllabi || []).filter(s => s.id !== syllabusId))
    setDeleteConfirm(null)
    toast.success('Syllabus deleted')
  }

  const handleDownload = (syllabus: Syllabus) => {
    if (syllabus.fileUrl) {
      window.open(syllabus.fileUrl, '_blank')
    }
  }

  const getFileIcon = (fileName?: string) => {
    if (!fileName) return <File size={24} weight="fill" />

    const ext = fileName.split('.').pop()?.toLowerCase()
    if (ext === 'pdf') {
      return <FilePdf size={24} weight="fill" className="text-red-500" />
    }
    if (ext === 'doc' || ext === 'docx') {
      return <FileDoc size={24} weight="fill" className="text-blue-500" />
    }
    return <File size={24} weight="fill" className="text-primary" />
  }

  const formatFileSize = (bytes?: number): string => {
    if (!bytes) return ''
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  const formatDate = (timestamp: number): string => {
    return new Date(timestamp).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-semibold">Syllabi</h3>
          <p className="text-sm text-muted-foreground">
            {syllabi.length} document{syllabi.length !== 1 ? 's' : ''}
          </p>
        </div>
        <Button size="sm" onClick={handleOpenAdd} className="gap-2">
          <Plus size={16} />
          Add Syllabus
        </Button>
      </div>

      {/* Syllabus List */}
      {syllabi.length === 0 ? (
        <Card className="glass-panel p-8 text-center">
          <p className="text-muted-foreground mb-4">No syllabi uploaded yet</p>
          <Button variant="outline" onClick={handleOpenAdd} className="gap-2">
            <Plus size={16} />
            Upload your first syllabus
          </Button>
        </Card>
      ) : (
        <ScrollArea className="max-h-[400px]">
          <div className="space-y-3">
            <AnimatePresence mode="popLayout">
              {syllabi.map((syllabus, index) => (
                <motion.div
                  key={syllabus.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Card className="glass-panel p-4">
                    <div className="flex items-center gap-4">
                      <div className="p-2 rounded-lg bg-muted">
                        {getFileIcon(syllabus.fileName)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium truncate">{syllabus.title}</h4>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <span>{syllabus.fileName}</span>
                          {syllabus.fileSize && (
                            <>
                              <span>•</span>
                              <span>{formatFileSize(syllabus.fileSize)}</span>
                            </>
                          )}
                          <span>•</span>
                          <span>{formatDate(syllabus.createdAt)}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {syllabus.fileUrl && (
                          <>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDownload(syllabus)}
                              title="View/Download"
                            >
                              <DownloadSimple size={18} />
                            </Button>
                          </>
                        )}
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setDeleteConfirm(syllabus.id)}
                          className="text-destructive"
                          title="Delete"
                        >
                          <Trash size={18} />
                        </Button>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </ScrollArea>
      )}

      {/* Add Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="glass-panel">
          <DialogHeader>
            <DialogTitle>Add Syllabus</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="syllabus-title">Title</Label>
              <Input
                id="syllabus-title"
                placeholder="e.g., Course Syllabus Fall 2024"
                value={formTitle}
                onChange={(e) => setFormTitle(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>File</Label>
              <FileUpload
                onFileSelect={handleFileSelect}
                accept=".pdf,.doc,.docx,.txt"
                progress={progress}
                uploadState={state}
                error={error?.message}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowAddDialog(false)}
              disabled={state === 'uploading'}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={!formTitle.trim() || !selectedFile || state === 'uploading'}
            >
              {state === 'uploading' ? 'Uploading...' : 'Upload'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteConfirm} onOpenChange={() => setDeleteConfirm(null)}>
        <AlertDialogContent className="glass-panel">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <Warning size={20} className="text-destructive" />
              Delete Syllabus
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this syllabus? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteConfirm && handleDelete(deleteConfirm)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
