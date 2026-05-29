/**
 * Student Link Approval Component
 *
 * Component for students to view and approve/reject parent link requests.
 * Can be used as a standalone component or embedded in a student dashboard.
 */

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import type { LinkRequest } from '@/hooks/use-parent-linking'
import {
  Link,
  Check,
  X,
  Clock,
  Users,
  UserCircle,
  Trash
} from '@phosphor-icons/react'
import { toast } from 'sonner'

interface ParentInfo {
  id: string
  name: string
  email?: string
}

interface StudentLinkApprovalProps {
  studentId: string
  pendingRequests: LinkRequest[]
  linkedParents: ParentInfo[]
  onApprove: (requestId: string) => void
  onReject: (requestId: string) => void
  onRemoveLink: (parentId: string) => void
  getParentInfo?: (parentId: string) => ParentInfo | undefined
}

export function StudentLinkApproval({
  studentId,
  pendingRequests,
  linkedParents,
  onApprove,
  onReject,
  onRemoveLink,
  getParentInfo
}: StudentLinkApprovalProps) {
  // Filter pending requests for this student
  const myPendingRequests = pendingRequests.filter(
    r => r.studentId === studentId && r.status === 'pending'
  )

  const handleApprove = (request: LinkRequest) => {
    onApprove(request.id)
    const parentInfo = getParentInfo?.(request.parentId)
    toast.success(`Link approved for ${parentInfo?.name || 'parent'}`)
  }

  const handleReject = (request: LinkRequest) => {
    onReject(request.id)
    const parentInfo = getParentInfo?.(request.parentId)
    toast.success(`Link request from ${parentInfo?.name || 'parent'} rejected`)
  }

  const handleRemoveLink = (parent: ParentInfo) => {
    onRemoveLink(parent.id)
    toast.success(`Link to ${parent.name} removed`)
  }

  return (
    <Card className="glass-panel">
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <Link size={20} className="text-accent" />
          Parent Account Links
        </CardTitle>
        <CardDescription>
          Manage which parents can view your progress
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Pending Requests */}
        {myPendingRequests.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm font-medium">
              <Clock size={16} className="text-amber-500" />
              Pending Requests
              <Badge variant="destructive" className="text-xs">
                {myPendingRequests.length}
              </Badge>
            </div>
            <ScrollArea className="max-h-48">
              <div className="space-y-2">
                {myPendingRequests.map(request => {
                  const parentInfo = getParentInfo?.(request.parentId) || {
                    id: request.parentId,
                    name: `Parent ${request.parentId.slice(-4)}`
                  }
                  return (
                    <Card key={request.id} className="p-3 border-amber-500/30">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-amber-500/20 flex items-center justify-center">
                            <UserCircle size={24} className="text-amber-500" />
                          </div>
                          <div>
                            <p className="font-medium">{parentInfo.name}</p>
                            {parentInfo.email && (
                              <p className="text-xs text-muted-foreground">
                                {parentInfo.email}
                              </p>
                            )}
                            <p className="text-xs text-muted-foreground">
                              Requested {new Date(request.requestedAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleApprove(request)}
                            className="gap-1 text-green-600 hover:text-green-600 hover:bg-green-50 dark:hover:bg-green-950"
                          >
                            <Check size={14} />
                            Approve
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleReject(request)}
                            className="gap-1 text-destructive hover:text-destructive hover:bg-destructive/10"
                          >
                            <X size={14} />
                            Reject
                          </Button>
                        </div>
                      </div>
                    </Card>
                  )
                })}
              </div>
            </ScrollArea>
          </div>
        )}

        {myPendingRequests.length > 0 && linkedParents.length > 0 && (
          <Separator />
        )}

        {/* Linked Parents */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm font-medium">
            <Check size={16} className="text-green-500" />
            Linked Parents ({linkedParents.length})
          </div>
          {linkedParents.length === 0 ? (
            <div className="text-center py-6 text-muted-foreground">
              <Users size={32} className="mx-auto mb-2 opacity-50" />
              <p className="text-sm">No linked parents</p>
              <p className="text-xs mt-1">
                When a parent requests to link, you'll see it here
              </p>
            </div>
          ) : (
            <ScrollArea className="max-h-48">
              <div className="space-y-2">
                {linkedParents.map(parent => (
                  <Card key={parent.id} className="p-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center">
                          <UserCircle size={24} className="text-green-500" />
                        </div>
                        <div>
                          <p className="font-medium">{parent.name}</p>
                          {parent.email && (
                            <p className="text-xs text-muted-foreground">
                              {parent.email}
                            </p>
                          )}
                        </div>
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleRemoveLink(parent)}
                        className="text-destructive hover:text-destructive hover:bg-destructive/10"
                      >
                        <Trash size={16} />
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            </ScrollArea>
          )}
        </div>

        {/* Info Note */}
        <div className="text-xs text-muted-foreground bg-muted/50 p-3 rounded-lg">
          <p>
            <strong>Note:</strong> Linked parents can view your progress, achievements,
            and participate in personalization voting. You can remove a link at any time.
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
