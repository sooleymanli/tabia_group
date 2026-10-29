import { useId } from 'react'
import { MapPin } from 'lucide-react'
import { Link, useSearchParams } from 'react-router'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { CommentModeration } from '@/feedback/CommentModeration'
import {
  ANONYMOUS_NAME,
  COMMENT_KINDS,
  COMMENT_STATUS_LABELS,
  VISIBILITY_LABELS,
  isPinned,
  kindLabel,
} from '@/feedback/feedbackModel'
import { ReplyForm, ReplyList } from '@/feedback/Replies'
import { cn } from '@/lib/utils'
import { formatDateTime, slideOrder, slideTitle } from './adminFormat'

const selectClass =
  'h-8 w-full rounded-lg border border-input bg-card px-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50'

function FilterSelect({ label, value, onChange, options }) {
  const id = useId()
  return (
    <div className="grid gap-1.5">
      <Label htmlFor={id} className="text-xs text-muted-foreground">
        {label}
      </Label>
      <select
        id={id}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className={selectClass}
      >
        <option value="">Hamısı</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  )
}

export function CommentsTab({ comments, onChanged }) {
  const [searchParams, setSearchParams] = useSearchParams()
  const filters = {
    novu: searchParams.get('novu') ?? '',
    status: searchParams.get('status') ?? '',
    pin: searchParams.get('pin') ?? '',
    slayd: searchParams.get('slayd') ?? '',
    cavab: searchParams.get('cavab') ?? '',
  }
  const setFilter = (name, value) => {
    const next = new URLSearchParams(searchParams)
    if (value) next.set(name, value)
    else next.delete(name)
    setSearchParams(next, { replace: true })
  }
  const hasFilters = Object.values(filters).some(Boolean)

  const pinLabels = [...new Set(comments.map((c) => c.pin_label))].sort()
  const slideKeys = [
    ...new Map(comments.map((c) => [`${c.deck_id}/${c.slide_id}`, c])).values(),
  ].sort(
    (a, b) =>
      slideOrder(a.deck_id, a.slide_id) - slideOrder(b.deck_id, b.slide_id),
  )

  const visible = comments.filter(
    (c) =>
      (!filters.novu || c.kind === filters.novu) &&
      (!filters.status || c.status === filters.status) &&
      (!filters.pin || c.pin_label === filters.pin) &&
      (!filters.slayd || `${c.deck_id}/${c.slide_id}` === filters.slayd) &&
      (filters.cavab !== 'yox' || !c.replies?.length),
  )

  return (
    <div>
      <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
        <FilterSelect
          label="Növ"
          value={filters.novu}
          onChange={(value) => setFilter('novu', value)}
          options={COMMENT_KINDS}
        />
        <FilterSelect
          label="Status"
          value={filters.status}
          onChange={(value) => setFilter('status', value)}
          options={Object.entries(COMMENT_STATUS_LABELS).map(
            ([value, label]) => ({ value, label }),
          )}
        />
        <FilterSelect
          label="Cavab"
          value={filters.cavab}
          onChange={(value) => setFilter('cavab', value)}
          options={[{ value: 'yox', label: 'Cavabsız' }]}
        />
        <FilterSelect
          label="PIN"
          value={filters.pin}
          onChange={(value) => setFilter('pin', value)}
          options={pinLabels.map((label) => ({ value: label, label }))}
        />
        <FilterSelect
          label="Slayd"
          value={filters.slayd}
          onChange={(value) => setFilter('slayd', value)}
          options={slideKeys.map((c) => ({
            value: `${c.deck_id}/${c.slide_id}`,
            label: slideTitle(c.deck_id, c.slide_id),
          }))}
        />
      </div>

      <div className="mt-6 flex items-baseline justify-between gap-4">
        <p className="text-sm text-muted-foreground tabular-nums">
          {visible.length} / {comments.length} rəy
        </p>
        {hasFilters && (
          <Button
            variant="link"
            size="sm"
            onClick={() =>
              setSearchParams({ tab: 'reyler' }, { replace: true })
            }
          >
            Filtrləri təmizlə
          </Button>
        )}
      </div>

      {visible.length === 0 ? (
        <p className="mt-6 text-muted-foreground">
          {comments.length === 0
            ? 'Hələ rəy yoxdur.'
            : 'Bu filtrlərə uyğun rəy yoxdur.'}
        </p>
      ) : (
        <ul className="mt-3 divide-y border-y">
          {visible.map((comment) => (
            <CommentRow
              key={comment.id}
              comment={comment}
              onChanged={onChanged}
            />
          ))}
        </ul>
      )}
    </div>
  )
}

function CommentRow({ comment, onChanged }) {
  return (
    <li className={cn('grid gap-3 py-5', comment.is_hidden && 'opacity-70')}>
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 text-sm">
        <Link
          to={`/${comment.deck_id}/${comment.slide_id}?rey=${comment.id}`}
          className="rounded-sm font-medium text-petrol underline-offset-4 outline-none hover:underline focus-visible:ring-3 focus-visible:ring-ring/50"
        >
          {slideTitle(comment.deck_id, comment.slide_id)}
        </Link>
        <Badge variant="outline">{kindLabel(comment.kind)}</Badge>
        {comment.status === 'new' && <Badge>Yeni</Badge>}
        {isPinned(comment) && (
          <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
            <MapPin className="size-3.5" aria-hidden="true" />
            Slaydda işarələnib
          </span>
        )}
        <time
          dateTime={comment.created_at}
          className="ml-auto text-xs text-muted-foreground tabular-nums"
        >
          {formatDateTime(comment.created_at)}
        </time>
      </div>

      <p className="max-w-[72ch] break-words whitespace-pre-wrap text-ink">
        {comment.body}
      </p>

      <p className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
        <span>{comment.author_name || ANONYMOUS_NAME}</span>
        <span>PIN: {comment.pin_label}</span>
        <span>{VISIBILITY_LABELS[comment.visibility]}</span>
        {comment.is_hidden && <span>Gizlədilib</span>}
      </p>

      <CommentModeration comment={comment} onChanged={onChanged} />

      <div className="max-w-2xl">
        {comment.status === 'resolved' && !comment.replies?.length && (
          <p className="text-sm text-muted-foreground">
            Müştəri “Həll edildi” nişanını görür. Nəyin dəyişdiyini cavabda qısa
            yazın.
          </p>
        )}
        <ReplyList replies={comment.replies} admin onChanged={onChanged} />
        <ReplyForm
          commentId={comment.id}
          currentStatus={comment.status}
          onSent={onChanged}
          className="mt-3"
        />
      </div>
    </li>
  )
}
