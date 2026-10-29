import { useId, useRef, useState } from 'react'
import { accessStore, useAccess } from '@/access/accessStore'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { submitComment } from '@/lib/supabase/presentationApi'
import { cn } from '@/lib/utils'
import {
  ANONYMOUS_NAME,
  COMMENT_KINDS,
  COMMENT_MAX_LENGTH,
  NAME_MAX_LENGTH,
  VISIBILITY_LABELS,
  validateComment,
} from './feedbackModel'
import { readReviewerName, rememberReviewerName } from './reviewerName'

const FORM_MESSAGES = {
  empty: 'Rəy mətnini yazın.',
  too_long: `Rəy ${COMMENT_MAX_LENGTH} simvoldan uzun ola bilməz.`,
  name_too_long: `Ad ${NAME_MAX_LENGTH} simvoldan uzun ola bilməz.`,
  failed: 'Göndərilmədi. Bağlantını yoxlayıb yenidən cəhd edin.',
}

// `compact` is the pinned-comment composer: visibility is shown, not edited, and it can be cancelled.
export function CommentForm({
  deckId,
  slideId,
  anchor = null,
  compact = false,
  onSent,
  onCancel,
}) {
  const visibility = useAccess((state) => state.session?.visibility)
  const [kind, setKind] = useState('comment')
  const [body, setBody] = useState('')
  const [name, setName] = useState(readReviewerName)
  const [status, setStatus] = useState('idle')
  // Reusing the id for an unchanged retry lets the server drop a duplicate.
  const attemptRef = useRef(null)
  const bodyId = useId()
  const nameId = useId()
  const messageId = useId()

  const edit = (setter) => (event) => {
    setter(event.target.value)
    if (status !== 'sending') setStatus('idle')
  }

  const submit = async (event) => {
    event.preventDefault()
    if (status === 'sending') return
    const invalid = validateComment({ body, name })
    if (invalid) {
      setStatus(invalid)
      return
    }
    const text = body.trim()
    const author = name.trim()
    const signature = JSON.stringify([kind, text, author, anchor])
    if (attemptRef.current?.signature !== signature) {
      attemptRef.current = { id: crypto.randomUUID(), signature }
    }

    setStatus('sending')
    try {
      const { id } = attemptRef.current
      await submitComment({
        id,
        deckId,
        slideId,
        kind,
        body: text,
        authorName: author || null,
        anchor,
      })
      attemptRef.current = null
      rememberReviewerName(author)
      setBody('')
      setStatus('sent')
      onSent(id)
    } catch (error) {
      setStatus('failed')
      accessStore.getState().handleApiError(error)
    }
  }

  const message = FORM_MESSAGES[status]

  return (
    <form
      onSubmit={submit}
      className="grid gap-3"
      noValidate
      onKeyDown={(event) => {
        if (event.key === 'Escape' && onCancel) {
          event.stopPropagation()
          onCancel()
        }
      }}
    >
      <fieldset className="flex flex-wrap gap-1.5">
        <legend className="sr-only">Rəyin növü</legend>
        {COMMENT_KINDS.map((option) => (
          <label
            key={option.value}
            className={cn(
              'cursor-pointer rounded-full border px-3 py-1 text-sm transition-colors has-focus-visible:ring-3 has-focus-visible:ring-ring/50',
              kind === option.value
                ? 'border-petrol bg-petrol text-mist'
                : 'hover:bg-muted',
            )}
          >
            <input
              type="radio"
              name={`${messageId}-kind`}
              value={option.value}
              checked={kind === option.value}
              onChange={() => setKind(option.value)}
              className="sr-only"
            />
            {option.label}
          </label>
        ))}
      </fieldset>

      <div className="grid gap-1.5">
        <Label htmlFor={bodyId} className="sr-only">
          Rəy mətni
        </Label>
        <Textarea
          id={bodyId}
          value={body}
          onChange={edit(setBody)}
          rows={3}
          maxLength={COMMENT_MAX_LENGTH}
          placeholder={
            anchor ? 'Bu yer haqqında fikrinizi yazın' : 'Fikrinizi yazın'
          }
          autoFocus={compact}
          aria-invalid={
            status === 'empty' || status === 'too_long' || undefined
          }
          aria-describedby={message ? messageId : undefined}
          className="max-h-40 resize-none"
        />
        {body.length > COMMENT_MAX_LENGTH - 200 && (
          <p className="text-right text-xs text-muted-foreground tabular-nums">
            {body.length} / {COMMENT_MAX_LENGTH}
          </p>
        )}
      </div>

      <div className="grid gap-1.5">
        <Label htmlFor={nameId}>Adınız (istəyə bağlı)</Label>
        <Input
          id={nameId}
          value={name}
          onChange={edit(setName)}
          maxLength={NAME_MAX_LENGTH}
          autoComplete="name"
          placeholder={ANONYMOUS_NAME}
          aria-invalid={status === 'name_too_long' || undefined}
        />
      </div>

      {compact ? (
        <p className="text-xs text-muted-foreground">
          Görünür: {VISIBILITY_LABELS[visibility ?? 'vendor']}
        </p>
      ) : (
        <VisibilityControl />
      )}
      {visibility === 'public' && (
        <p className="text-xs text-muted-foreground">
          Bu rəy PIN ilə daxil olan hər kəsə görünəcək. Mətnə şəxsi məlumat
          yazmayın.
        </p>
      )}

      <div
        className={cn(
          'flex items-center gap-2',
          compact && 'flex-wrap justify-end',
        )}
      >
        <p
          id={messageId}
          role={status === 'sent' ? 'status' : 'alert'}
          className={cn(
            'min-w-0 flex-1 text-sm',
            compact && 'basis-full empty:hidden',
            status === 'sent' ? 'text-success' : 'text-destructive',
          )}
        >
          {status === 'sent' ? 'Rəyiniz göndərildi.' : message}
        </p>
        {onCancel && (
          <Button type="button" variant="ghost" onClick={onCancel}>
            Ləğv et
          </Button>
        )}
        <Button type="submit" disabled={status === 'sending'}>
          {status === 'sending'
            ? 'Göndərilir…'
            : status === 'failed'
              ? 'Yenidən cəhd et'
              : 'Göndər'}
        </Button>
      </div>
    </form>
  )
}

function VisibilityControl() {
  const visibility = useAccess((state) => state.session?.visibility ?? 'vendor')
  const [pending, setPending] = useState(false)
  const [failed, setFailed] = useState(false)
  const selectId = useId()

  const change = async (event) => {
    setPending(true)
    setFailed(false)
    const code = await accessStore
      .getState()
      .updateVisibility(event.target.value)
    setPending(false)
    if (code) setFailed(true)
  }

  return (
    <div className="grid gap-1.5">
      <Label htmlFor={selectId}>Yeni rəylərim kimə görünsün</Label>
      <select
        id={selectId}
        value={visibility}
        onChange={change}
        disabled={pending}
        className="h-8 w-full rounded-lg border border-input bg-transparent px-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:opacity-50"
      >
        {Object.entries(VISIBILITY_LABELS).map(([value, label]) => (
          <option key={value} value={value}>
            {label}
          </option>
        ))}
      </select>
      {failed && (
        <p role="alert" className="text-sm text-destructive">
          Seçim saxlanmadı. Yenidən cəhd edin.
        </p>
      )}
    </div>
  )
}
