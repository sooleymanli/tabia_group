import { useId, useState } from 'react'
import { accessStore } from '@/access/accessStore'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { adminModerateComment } from '@/lib/supabase/presentationApi'
import { cn } from '@/lib/utils'
import { COMMENT_STATUS_LABELS } from './feedbackModel'

// Status and hide controls shared by the /admin list and the in-slide admin preview.
export function CommentModeration({ comment, onChanged, className }) {
  const [pending, setPending] = useState(false)
  const [failed, setFailed] = useState(false)
  const statusId = useId()

  const moderate = async (patch) => {
    setPending(true)
    setFailed(false)
    try {
      await adminModerateComment({ commentId: comment.id, ...patch })
      onChanged?.()
    } catch (error) {
      setFailed(true)
      accessStore.getState().handleApiError(error)
    } finally {
      setPending(false)
    }
  }

  return (
    <div className={cn('flex flex-wrap items-center gap-2', className)}>
      <Label htmlFor={statusId} className="text-xs text-muted-foreground">
        Status
      </Label>
      <select
        id={statusId}
        value={comment.status}
        disabled={pending}
        onChange={(event) => moderate({ status: event.target.value })}
        className="h-8 rounded-lg border border-input bg-card px-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:opacity-50"
      >
        {Object.entries(COMMENT_STATUS_LABELS).map(([value, label]) => (
          <option key={value} value={value}>
            {label}
          </option>
        ))}
      </select>
      {comment.visibility === 'public' && (
        <Button
          variant="outline"
          size="sm"
          disabled={pending}
          onClick={() => moderate({ hidden: !comment.is_hidden })}
        >
          {comment.is_hidden ? 'Yenidən göstər' : 'Başqalarından gizlət'}
        </Button>
      )}
      {failed && (
        <span role="alert" className="text-sm text-destructive">
          Saxlanmadı. Yenidən cəhd edin.
        </span>
      )}
    </div>
  )
}
