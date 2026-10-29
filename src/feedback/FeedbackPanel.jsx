import { useEffect, useId, useRef } from 'react'
import { Check, X } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { CommentForm } from './CommentForm'
import { CommentModeration } from './CommentModeration'
import {
  ANONYMOUS_NAME,
  COMMENT_STATUS_LABELS,
  VISIBILITY_LABELS,
  formatCommentTime,
  kindLabel,
} from './feedbackModel'
import { PinBadge } from './PinMarker'
import { ReplyForm, ReplyList } from './Replies'

// `admin`: the Developer Team preview lists every comment and can reply, but never writes feedback.
export function FeedbackPanel({
  id,
  deckId,
  slide,
  comments,
  pinNumbers,
  activeId,
  onSelect,
  onClose,
  admin = false,
}) {
  const titleId = useId()

  return (
    <section
      id={id}
      aria-labelledby={titleId}
      className="flex h-full min-h-0 flex-col"
      onKeyDown={(event) => {
        if (event.key === 'Escape') onClose()
      }}
    >
      <header className="flex items-start gap-3 border-b px-5 py-4">
        <div className="min-w-0 flex-1">
          <h2 id={titleId} className="font-heading text-base font-medium">
            Rəylər
            {comments.items.length > 0 && (
              <span className="ml-2 text-sm font-normal text-muted-foreground tabular-nums">
                {comments.items.length}
              </span>
            )}
          </h2>
          <p className="truncate text-sm text-muted-foreground">
            {slide.title}
          </p>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          aria-label="Rəyləri gizlət"
          title="Rəyləri gizlət"
        >
          <X />
        </Button>
      </header>

      <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">
        <CommentList
          comments={comments}
          pinNumbers={pinNumbers}
          activeId={activeId}
          onSelect={onSelect}
          admin={admin}
        />
      </div>

      {admin ? (
        <p className="border-t px-5 py-3 text-xs text-muted-foreground">
          Admin önizləməsi: rəy yazılmır, cavablar müştəriyə rəy panelində
          görünür.
        </p>
      ) : (
        <div className="border-t px-5 py-4">
          <CommentForm
            key={slide.id}
            deckId={deckId}
            slideId={slide.id}
            onSent={comments.reload}
          />
        </div>
      )}
    </section>
  )
}

function CommentList({ comments, pinNumbers, activeId, onSelect, admin }) {
  const { status, items, reload } = comments

  if (status === 'loading') {
    return (
      <p role="status" className="text-sm text-muted-foreground">
        Rəylər yüklənir…
      </p>
    )
  }
  if (status === 'error') {
    return (
      <div className="grid justify-items-start gap-3">
        <p className="text-sm text-muted-foreground">Rəylər yüklənmədi.</p>
        <Button variant="outline" size="sm" onClick={reload}>
          Yenidən yüklə
        </Button>
      </div>
    )
  }
  if (items.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        {admin
          ? 'Bu slayd üçün hələ rəy yoxdur.'
          : 'Bu slayd üçün hələ rəy yoxdur. Fikrinizi aşağıda yazın və ya “İşarələ” ilə slaydda konkret yer seçin.'}
      </p>
    )
  }
  return (
    <ol className="-mx-2 grid gap-1">
      {items.map((item) => (
        <CommentItem
          key={item.id}
          item={item}
          number={pinNumbers.get(item.id)}
          active={item.id === activeId}
          onSelect={onSelect}
          admin={admin}
          onChanged={reload}
        />
      ))}
    </ol>
  )
}

function StatusBadge({ status }) {
  if (status === 'resolved') {
    return (
      <Badge className="bg-success text-white">
        <Check data-icon="inline-start" aria-hidden="true" />
        {COMMENT_STATUS_LABELS.resolved}
      </Badge>
    )
  }
  if (status === 'reviewed') {
    return <Badge variant="secondary">{COMMENT_STATUS_LABELS.reviewed}</Badge>
  }
  return null
}

function CommentItem({ item, number, active, onSelect, admin, onChanged }) {
  const ref = useRef(null)

  useEffect(() => {
    if (active) ref.current?.scrollIntoView({ block: 'nearest' })
  }, [active])

  return (
    <li
      ref={ref}
      className={cn(
        'rounded-lg px-2 py-2.5 transition-colors',
        active && 'bg-secondary',
      )}
    >
      <div className="flex flex-wrap items-center gap-2 text-sm">
        {number && (
          <PinBadge
            number={number}
            own={item.is_own}
            resolved={item.status === 'resolved'}
            active={active}
            onClick={() => onSelect(item.id)}
            label={`Slayddakı ${number} nömrəli işarəni göstər`}
          />
        )}
        <span className="font-medium text-ink">
          {item.author_name || ANONYMOUS_NAME}
        </span>
        {item.is_own && <Badge variant="secondary">Siz</Badge>}
        <Badge variant="outline">{kindLabel(item.kind)}</Badge>
        <StatusBadge status={item.status} />
        <time
          dateTime={item.created_at}
          className="ml-auto text-xs text-muted-foreground tabular-nums"
        >
          {formatCommentTime(item.created_at)}
        </time>
      </div>
      <p className="mt-1.5 text-sm break-words whitespace-pre-wrap text-foreground">
        {item.body}
      </p>
      {item.is_own && item.visibility && (
        <p className="mt-1 text-xs text-muted-foreground">
          Görünür: {VISIBILITY_LABELS[item.visibility]}
        </p>
      )}
      {admin && (
        <p className="mt-1 flex flex-wrap gap-x-3 text-xs text-muted-foreground">
          <span>PIN: {item.pin_label}</span>
          <span>{VISIBILITY_LABELS[item.visibility]}</span>
          {item.is_hidden && <span>Gizlədilib</span>}
        </p>
      )}
      <ReplyList replies={item.replies} admin={admin} onChanged={onChanged} />
      {admin && (
        <>
          <CommentModeration
            comment={item}
            onChanged={onChanged}
            className="mt-2"
          />
          <ReplyForm
            commentId={item.id}
            currentStatus={item.status}
            onSent={onChanged}
            className="mt-2"
          />
        </>
      )}
    </li>
  )
}
