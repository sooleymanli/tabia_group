import {
  MessageSquarePlus,
  MessageSquareText,
  ThumbsDown,
  ThumbsUp,
} from 'lucide-react'
import { motion } from 'motion/react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

const REACTIONS = [
  { value: 'like', label: 'Bəyəndim', Icon: ThumbsUp, active: 'text-petrol' },
  {
    value: 'dislike',
    label: 'Bəyənmədim',
    Icon: ThumbsDown,
    active: 'text-pomegranate',
  },
]

export function FeedbackBar({
  slideId,
  reactions,
  panelId,
  panelOpen,
  onTogglePanel,
  commentCount,
  placing,
  onTogglePlacing,
  readOnly = false,
}) {
  const current = reactions?.values[slideId] ?? null
  const pending = Boolean(reactions?.pending[slideId])

  return (
    <div className="flex items-center gap-1">
      {!readOnly && reactions.failed === slideId && (
        <span role="alert" className="mr-2 text-sm text-destructive">
          Seçim göndərilmədi
        </span>
      )}
      {!readOnly &&
        REACTIONS.map(({ value, label, Icon, active }) => {
          const pressed = current === value
          return (
            <Button
              key={value}
              variant="ghost"
              size="icon-lg"
              aria-pressed={pressed}
              aria-label={label}
              title={label}
              disabled={pending}
              onClick={() => reactions.toggle(slideId, value)}
              className={cn(pressed && `bg-secondary ${active}`)}
            >
              <motion.span
                key={String(pressed)}
                initial={pressed ? { scale: 0.6 } : false}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 500, damping: 18 }}
                className="inline-flex"
              >
                <Icon fill={pressed ? 'currentColor' : 'none'} />
              </motion.span>
            </Button>
          )
        })}
      {!readOnly && (
        <Button
          variant={placing ? 'secondary' : 'outline'}
          size="lg"
          className="ml-2"
          aria-pressed={placing}
          title="Slaydda yer seçib rəy yazın"
          onClick={onTogglePlacing}
        >
          <MessageSquarePlus data-icon="inline-start" />
          <span className="hidden sm:inline">İşarələ</span>
          <span className="sr-only sm:hidden">Slaydda yer seçib rəy yazın</span>
        </Button>
      )}
      <Button
        variant={panelOpen ? 'secondary' : 'outline'}
        size="lg"
        aria-expanded={panelOpen}
        aria-controls={panelId}
        onClick={onTogglePanel}
      >
        <MessageSquareText data-icon="inline-start" />
        <span className="hidden sm:inline">
          {panelOpen ? 'Rəyləri gizlət' : 'Rəyləri göstər'}
        </span>
        <span className="sr-only sm:hidden">Rəylər</span>
        {commentCount > 0 && (
          <span
            aria-label={`${commentCount} rəy`}
            className="-mr-0.5 min-w-5 rounded-full bg-petrol px-1.5 text-center text-xs leading-5 font-semibold text-mist tabular-nums"
          >
            {commentCount}
          </span>
        )}
      </Button>
    </div>
  )
}
