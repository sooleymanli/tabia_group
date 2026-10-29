import { TabiaMark } from '@/components/brand/TabiaLogo'
import { cn } from '@/lib/utils'
import { IntroSlide } from './IntroSlide'

function formatFeatureIds(ids) {
  const ranges = []
  for (const id of ids) {
    const last = ranges.at(-1)
    if (last && id === last[1] + 1) last[1] = id
    else ranges.push([id, id])
  }
  return ranges
    .map(([start, end]) => (start === end ? `${start}` : `${start}–${end}`))
    .join(', ')
}

export function ScenarioPlaceholder({ className, children }) {
  return (
    <div
      className={cn(
        'flex h-full flex-col items-center justify-center gap-4 p-8 text-center',
        className,
      )}
    >
      <TabiaMark className="size-14 text-primary/30" label={null} />
      <p className="text-base font-medium text-foreground">
        Bu ssenari hazırlanır
      </p>
      <p className="max-w-[28ch] text-sm text-muted-foreground">{children}</p>
    </div>
  )
}

export function SlideLayout({ slide, position, total, phone, admin, aside }) {
  if (slide.layout === 'intro' || slide.layout === 'intro-feedback')
    return <IntroSlide slide={slide} />
  const hasAdmin = slide.layout === 'admin-phone'

  return (
    <div
      className={cn(
        'grid h-full min-h-0 gap-8 lg:gap-14',
        hasAdmin
          ? 'lg:grid-cols-[minmax(0,3fr)_minmax(0,9fr)]'
          : 'lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)]',
      )}
    >
      <div className="flex flex-col justify-center gap-5">
        <p className="text-sm font-medium text-muted-foreground tabular-nums">
          {position} / {total}
        </p>
        <h1 className="text-3xl leading-tight font-medium text-ink xl:text-4xl">
          {slide.title}
        </h1>
        <p className="max-w-[46ch] text-lg text-muted-foreground">
          {slide.summary}
        </p>
        {slide.featureIds.length > 0 && (
          <p className="text-sm text-muted-foreground">
            MVP funksiyaları: {formatFeatureIds(slide.featureIds)}
          </p>
        )}
        {aside && <div className="mt-2 max-w-md">{aside}</div>}
      </div>

      <div className="h-[min(78svh,720px)] min-h-0 lg:h-full">
        {hasAdmin ? (
          <div className="flex h-full min-h-0 gap-6">
            <div className="min-w-0 flex-1">{admin}</div>
            <div className="hidden w-[28%] shrink-0 md:block">{phone}</div>
          </div>
        ) : (
          phone
        )}
      </div>
    </div>
  )
}
