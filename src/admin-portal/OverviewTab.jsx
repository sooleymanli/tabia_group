import { Button } from '@/components/ui/button'
import { ANONYMOUS_NAME, kindLabel } from '@/feedback/feedbackModel'
import { formatDateTime, formatDuration, slideTitle } from './adminFormat'

// Value is read first visually, label first for screen readers (dt before dd).
function Figure({ value, label, hint, onClick }) {
  return (
    <div className="flex flex-col-reverse justify-end border-l-2 border-petrol/20 pl-4">
      <dt className="mt-1 text-sm text-muted-foreground">
        {label}
        {hint && <span className="block text-xs">{hint}</span>}
      </dt>
      <dd className="font-heading text-3xl font-medium text-ink tabular-nums">
        {onClick ? (
          <button
            type="button"
            onClick={onClick}
            title={`${label}: siyahını aç`}
            className="rounded-sm underline-offset-4 outline-none hover:text-petrol hover:underline focus-visible:ring-3 focus-visible:ring-ring/50"
          >
            {value}
          </button>
        ) : (
          value
        )}
      </dd>
    </div>
  )
}

export function OverviewTab({ summary, comments, onOpenComments }) {
  const latest = comments.slice(0, 6)

  return (
    <div className="grid gap-12">
      <section aria-labelledby="overview-feedback">
        <h2 id="overview-feedback" className="font-heading text-lg font-medium">
          Rəylər
        </h2>
        <dl className="mt-5 grid grid-cols-2 gap-x-6 gap-y-8 md:grid-cols-4">
          <Figure
            value={summary.newComments}
            label="Yeni rəy"
            onClick={() => onOpenComments({ status: 'new' })}
          />
          <Figure
            value={summary.openQuestions}
            label="Cavabsız sual"
            onClick={() => onOpenComments({ novu: 'question', cavab: 'yox' })}
          />
          <Figure value={summary.comments} label="Bütün rəylər" />
          <Figure
            value={`${summary.likes} / ${summary.dislikes}`}
            label="Bəyəndim / Bəyənmədim"
          />
        </dl>
      </section>

      <section aria-labelledby="overview-usage">
        <h2 id="overview-usage" className="font-heading text-lg font-medium">
          Baxışlar
        </h2>
        <dl className="mt-5 grid grid-cols-2 gap-x-6 gap-y-8 md:grid-cols-4">
          <Figure
            value={`${summary.activePins} / ${summary.totalPins}`}
            label="Aktiv PIN"
          />
          <Figure
            value={summary.sessions}
            label="Sessiya"
            hint="Unikal insan sayı deyil"
          />
          <Figure value={summary.views} label="Slayd baxışı" />
          <Figure
            value={formatDuration(summary.activeMs)}
            label="Ümumi aktiv vaxt"
          />
        </dl>
        <p className="mt-6 text-sm text-muted-foreground">
          Son giriş: {formatDateTime(summary.lastSeen)}. Admin önizləməsi
          statistikaya daxil deyil.
        </p>
      </section>

      <section aria-labelledby="overview-latest">
        <div className="flex items-baseline justify-between gap-4">
          <h2 id="overview-latest" className="font-heading text-lg font-medium">
            Son rəylər
          </h2>
          {comments.length > 0 && (
            <Button variant="link" onClick={() => onOpenComments({})}>
              Hamısına bax
            </Button>
          )}
        </div>
        {latest.length === 0 ? (
          <p className="mt-4 text-muted-foreground">
            Hələ rəy yoxdur. PIN paylaşıldıqdan sonra rəylər burada görünəcək.
          </p>
        ) : (
          <ul className="mt-4 divide-y border-y">
            {latest.map((comment) => (
              <li key={comment.id} className="py-3">
                <p className="text-sm text-muted-foreground">
                  {slideTitle(comment.deck_id, comment.slide_id)},{' '}
                  {kindLabel(comment.kind).toLowerCase()},{' '}
                  {comment.author_name || ANONYMOUS_NAME} ({comment.pin_label})
                </p>
                <p className="mt-1 line-clamp-2 text-ink">{comment.body}</p>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}
