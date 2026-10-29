import { useId, useRef, useState } from 'react'
import { Trash2 } from 'lucide-react'
import { accessStore } from '@/access/accessStore'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  adminDeleteReply,
  adminModerateComment,
  adminReply,
} from '@/lib/supabase/presentationApi'
import { cn } from '@/lib/utils'
import {
  COMMENT_MAX_LENGTH,
  COMMENT_STATUS_LABELS,
  REPLY_VISIBILITY_LABELS,
  formatCommentTime,
} from './feedbackModel'

// `admin` adds visibility labels and delete; viewers see "only you" on PIN-scoped replies.
export function ReplyList({ replies, admin = false, onChanged }) {
  if (!replies?.length) return null
  return (
    <ul className="mt-2 grid gap-2 border-l-2 border-petrol/30 pl-3">
      {replies.map((reply) => (
        <ReplyItem
          key={reply.id}
          reply={reply}
          admin={admin}
          onChanged={onChanged}
        />
      ))}
    </ul>
  )
}

function ReplyItem({ reply, admin, onChanged }) {
  const [pending, setPending] = useState(false)
  const [failed, setFailed] = useState(false)
  const scope = admin
    ? REPLY_VISIBILITY_LABELS[reply.visibility]
    : reply.private
      ? 'Yalnız sizə görünür'
      : null

  const remove = async () => {
    setPending(true)
    setFailed(false)
    try {
      await adminDeleteReply(reply.id)
      onChanged?.()
    } catch (error) {
      setFailed(true)
      setPending(false)
      accessStore.getState().handleApiError(error)
    }
  }

  return (
    <li className="text-sm">
      <div className="flex flex-wrap items-center gap-2">
        <span className="font-medium text-petrol">Developer Team</span>
        {scope && (
          <span className="text-xs text-muted-foreground">{scope}</span>
        )}
        <time
          dateTime={reply.created_at}
          className="ml-auto text-xs text-muted-foreground tabular-nums"
        >
          {formatCommentTime(reply.created_at)}
        </time>
        {admin && (
          <Button
            variant="ghost"
            size="icon-xs"
            onClick={remove}
            disabled={pending}
            aria-label="Cavabı sil"
            title="Cavabı sil"
          >
            <Trash2 />
          </Button>
        )}
      </div>
      <p className="mt-0.5 break-words whitespace-pre-wrap text-foreground">
        {reply.body}
      </p>
      {failed && (
        <p role="alert" className="text-xs text-destructive">
          Silinmədi. Yenidən cəhd edin.
        </p>
      )}
    </li>
  )
}

// `currentStatus` seeds the status picker; the server already moves "new" to "reviewed" on reply.
export function ReplyForm({ commentId, currentStatus, onSent, className }) {
  const [body, setBody] = useState('')
  const [visibility, setVisibility] = useState('public')
  const [nextStatus, setNextStatus] = useState(
    currentStatus === 'resolved' ? 'resolved' : 'reviewed',
  )
  const [status, setStatus] = useState('idle')
  // Same id for an unchanged retry, so a lost response cannot double-post.
  const attemptRef = useRef(null)
  const bodyId = useId()
  const visibilityId = useId()
  const statusId = useId()

  const submit = async (event) => {
    event.preventDefault()
    const text = body.trim()
    if (status === 'sending') return
    if (!text) {
      setStatus('empty')
      return
    }
    const signature = JSON.stringify([text, visibility])
    if (attemptRef.current?.signature !== signature) {
      attemptRef.current = { id: crypto.randomUUID(), signature }
    }
    setStatus('sending')
    try {
      await adminReply({
        id: attemptRef.current.id,
        commentId,
        body: text,
        visibility,
      })
      attemptRef.current = null
      setBody('')
    } catch (error) {
      setStatus('failed')
      accessStore.getState().handleApiError(error)
      return
    }
    try {
      if (nextStatus === 'resolved' || currentStatus === 'resolved') {
        await adminModerateComment({ commentId, status: nextStatus })
      }
      setStatus('idle')
    } catch (error) {
      setStatus('status_failed')
      accessStore.getState().handleApiError(error)
    }
    onSent?.()
  }

  return (
    <form onSubmit={submit} className={cn('grid gap-2', className)} noValidate>
      <Label htmlFor={bodyId} className="sr-only">
        Cavab
      </Label>
      <Textarea
        id={bodyId}
        value={body}
        onChange={(event) => {
          setBody(event.target.value)
          if (status !== 'sending') setStatus('idle')
        }}
        rows={2}
        maxLength={COMMENT_MAX_LENGTH}
        placeholder="Cavab yazın"
        aria-invalid={status === 'empty' || undefined}
        className="min-h-14 resize-none"
      />
      <div className="flex flex-wrap items-center gap-2">
        <Label htmlFor={visibilityId} className="sr-only">
          Cavab kimə görünsün
        </Label>
        <select
          id={visibilityId}
          value={visibility}
          onChange={(event) => setVisibility(event.target.value)}
          className="h-8 min-w-0 flex-1 rounded-lg border border-input bg-transparent px-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
        >
          {Object.entries(REPLY_VISIBILITY_LABELS).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
        <Label htmlFor={statusId} className="sr-only">
          Cavabdan sonra status
        </Label>
        <select
          id={statusId}
          value={nextStatus}
          onChange={(event) => setNextStatus(event.target.value)}
          className="h-8 rounded-lg border border-input bg-transparent px-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
        >
          <option value="reviewed">{COMMENT_STATUS_LABELS.reviewed}</option>
          <option value="resolved">{COMMENT_STATUS_LABELS.resolved}</option>
        </select>
        <Button type="submit" size="sm" disabled={status === 'sending'}>
          {status === 'sending'
            ? 'Göndərilir…'
            : status === 'failed'
              ? 'Yenidən cəhd et'
              : 'Cavab ver'}
        </Button>
      </div>
      {(status === 'empty' ||
        status === 'failed' ||
        status === 'status_failed') && (
        <p role="alert" className="text-xs text-destructive">
          {status === 'empty'
            ? 'Cavab mətnini yazın.'
            : status === 'status_failed'
              ? 'Cavab göndərildi, amma status saxlanmadı. Statusu yuxarıdan dəyişin.'
              : 'Göndərilmədi. Bağlantını yoxlayıb yenidən cəhd edin.'}
        </p>
      )}
    </form>
  )
}
