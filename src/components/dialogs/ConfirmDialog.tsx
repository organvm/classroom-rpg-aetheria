import { memo } from 'react'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Warning, Trash, CheckCircle } from '@phosphor-icons/react'

export type ConfirmDialogVariant = 'danger' | 'warning' | 'info'

interface ConfirmDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description: string
  confirmLabel?: string
  cancelLabel?: string
  variant?: ConfirmDialogVariant
  onConfirm: () => void
  onCancel?: () => void
}

const variantConfig = {
  danger: {
    icon: Trash,
    iconColor: 'text-destructive',
    confirmClass: 'bg-destructive text-destructive-foreground hover:bg-destructive/90'
  },
  warning: {
    icon: Warning,
    iconColor: 'text-yellow-500',
    confirmClass: 'bg-yellow-500 text-white hover:bg-yellow-600'
  },
  info: {
    icon: CheckCircle,
    iconColor: 'text-primary',
    confirmClass: ''
  }
}

export const ConfirmDialog = memo(function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  variant = 'warning',
  onConfirm,
  onCancel
}: ConfirmDialogProps) {
  const config = variantConfig[variant]
  const Icon = config.icon

  const handleConfirm = () => {
    onConfirm()
    onOpenChange(false)
  }

  const handleCancel = () => {
    onCancel?.()
    onOpenChange(false)
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="glass-panel">
        <AlertDialogHeader>
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg bg-card ${config.iconColor}`}>
              <Icon size={24} weight="fill" />
            </div>
            <AlertDialogTitle>{title}</AlertDialogTitle>
          </div>
          <AlertDialogDescription className="pt-2">
            {description}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={handleCancel}>
            {cancelLabel}
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirm}
            className={config.confirmClass}
          >
            {confirmLabel}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
})

/**
 * Hook for managing confirm dialog state
 */
import { useState, useCallback } from 'react'

interface UseConfirmDialogOptions {
  title: string
  description: string
  confirmLabel?: string
  variant?: ConfirmDialogVariant
}

export function useConfirmDialog() {
  const [isOpen, setIsOpen] = useState(false)
  const [options, setOptions] = useState<UseConfirmDialogOptions>({
    title: '',
    description: ''
  })
  const [resolveCallback, setResolveCallback] = useState<((value: boolean) => void) | null>(null)

  const confirm = useCallback((opts: UseConfirmDialogOptions): Promise<boolean> => {
    return new Promise((resolve) => {
      setOptions(opts)
      setResolveCallback(() => resolve)
      setIsOpen(true)
    })
  }, [])

  const handleConfirm = useCallback(() => {
    resolveCallback?.(true)
    setIsOpen(false)
  }, [resolveCallback])

  const handleCancel = useCallback(() => {
    resolveCallback?.(false)
    setIsOpen(false)
  }, [resolveCallback])

  const dialogProps = {
    open: isOpen,
    onOpenChange: setIsOpen,
    title: options.title,
    description: options.description,
    confirmLabel: options.confirmLabel,
    variant: options.variant,
    onConfirm: handleConfirm,
    onCancel: handleCancel
  }

  return {
    confirm,
    dialogProps,
    ConfirmDialogComponent: () => <ConfirmDialog {...dialogProps} />
  }
}
