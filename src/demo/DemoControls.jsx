import { Pause, Play, RotateCcw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { PLAYER_STATUS } from './createDemoPlayer'

const STATUS_TEXT = {
  [PLAYER_STATUS.idle]: '',
  [PLAYER_STATUS.playing]: 'Avtomatik demo oynayır',
  [PLAYER_STATUS.paused]: 'Avtomatik demo dayandırılıb',
  [PLAYER_STATUS.finished]: 'Avtomatik demo bitdi',
}

export function DemoControls({ runtime }) {
  const { player, status, reset } = runtime
  if (!player.hasSteps) return null

  return (
    <div className="flex items-center gap-1.5">
      {status === PLAYER_STATUS.playing ? (
        <Button variant="secondary" size="lg" onClick={player.pause}>
          <Pause data-icon="inline-start" />
          Pauza
        </Button>
      ) : status === PLAYER_STATUS.paused ? (
        <Button variant="secondary" size="lg" onClick={player.resume}>
          <Play data-icon="inline-start" />
          Davam et
        </Button>
      ) : (
        <Button variant="secondary" size="lg" onClick={player.play}>
          <Play data-icon="inline-start" />
          Demoya bax
        </Button>
      )}
      <Button
        variant="ghost"
        size="icon-lg"
        onClick={reset}
        aria-label="Demonu yenidən başlat"
        title="Demonu yenidən başlat"
      >
        <RotateCcw />
      </Button>
      <span className="sr-only" aria-live="polite">
        {STATUS_TEXT[status]}
      </span>
    </div>
  )
}
