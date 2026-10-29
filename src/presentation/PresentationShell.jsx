import { useEffect, useEffectEvent, useId, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import {
  ChevronLeft,
  ChevronRight,
  House,
  ListOrdered,
  Maximize,
  Minimize,
} from 'lucide-react'
import {
  Link,
  Navigate,
  useNavigate,
  useParams,
  useSearchParams,
} from 'react-router'
import { AccessStatus } from '@/access/AccessStatus'
import { TabiaMark } from '@/components/brand/TabiaLogo'
import { Button } from '@/components/ui/button'
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { BRAND } from '@/config/brand'
import { DemoControls } from '@/demo/DemoControls'
import { createDemoSession } from '@/demo/demoSession'
import {
  ScenarioAdmin,
  ScenarioAside,
  ScenarioPhone,
} from '@/demo/ScenarioDevices'
import { getScenario } from '@/demo/scenarios'
import { useScenarioRuntime } from '@/demo/useScenarioRuntime'
import { CommentLayer } from '@/feedback/CommentLayer'
import { FeedbackBar } from '@/feedback/FeedbackBar'
import { FeedbackPanel } from '@/feedback/FeedbackPanel'
import { useSlideFeedback } from '@/feedback/useSlideFeedback'
import { cn } from '@/lib/utils'
import {
  TOURS,
  countNumbered,
  getDeck,
  getTourSlides,
  isDeckReady,
  readTour,
  slideHref,
  slideNumber,
  tourHref,
} from './decks'
import { SlideLayout } from './SlideLayout'
import { useFullscreen } from './useFullscreen'
import { useSlideKeyboard } from './useSlideKeyboard'

export function PresentationRoute() {
  const { deckId, slideId } = useParams()
  const [searchParams] = useSearchParams()
  const deck = getDeck(deckId)

  if (!deck || !isDeckReady(deck)) return <Navigate to="/" replace />

  const tour = readTour(searchParams)
  const slides = getTourSlides(deck, tour)
  const index = slides.findIndex((slide) => slide.id === slideId)

  if (index === -1) {
    return (
      <Navigate to={slideHref(deck.id, slides[0].id, searchParams)} replace />
    )
  }

  return (
    <DeckPresentation
      key={deck.id}
      deck={deck}
      slides={slides}
      index={index}
      tour={tour}
      searchParams={searchParams}
    />
  )
}

function DeckPresentation({ deck, slides, index, tour, searchParams }) {
  const navigate = useNavigate()
  const fullscreen = useFullscreen()
  const [demoSession] = useState(createDemoSession)
  const slide = slides[index]
  const runtime = useScenarioRuntime(demoSession, getScenario(slide.id))
  const feedback = useSlideFeedback({
    deckId: deck.id,
    slideId: slide.id,
    runtime,
  })
  const feedbackPanelId = useId()
  const isFirst = index === 0
  const isLast = index === slides.length - 1
  const number = slideNumber(slides, index)
  const total = countNumbered(slides)
  const feedbackMode = slide.feedback === false ? null : feedback.mode
  // The last intro page leads into the first numbered product slide.
  const startsProduct = !number && !isLast && slideNumber(slides, index + 1)
  const hrefAt = (i) => slideHref(deck.id, slides[i].id, searchParams)

  // `?rey=<id>` (links from the admin panel) opens that comment, then leaves the URL clean.
  const focusId = searchParams.get('rey')
  const commentsStatus = feedback.comments.status
  const focusComment = useEffectEvent(() => {
    if (feedback.comments.items.some((comment) => comment.id === focusId)) {
      feedback.select(focusId)
    }
    const next = new URLSearchParams(searchParams)
    next.delete('rey')
    navigate({ search: next.toString() }, { replace: true })
  })
  useEffect(() => {
    if (focusId && commentsStatus === 'ready') focusComment()
  }, [focusId, commentsStatus])

  const goTo = (i) => {
    if (i < 0 || i >= slides.length || i === index) return
    navigate(hrefAt(i))
  }

  useSlideKeyboard({
    onNext: () => goTo(index + 1),
    onPrev: () => goTo(index - 1),
    onFirst: () => goTo(0),
    onLast: () => goTo(slides.length - 1),
    onFullscreen: fullscreen.isSupported ? fullscreen.toggle : undefined,
  })

  return (
    <div className="grid h-svh grid-rows-[auto_minmax(0,1fr)_auto] bg-background">
      <title>{`${slide.title} – ${BRAND.productName}`}</title>

      <header className="flex items-center gap-3 border-b px-4 py-3 md:px-8">
        <Link
          to="/"
          className="flex items-center gap-2.5 rounded-md text-ink outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
        >
          <TabiaMark className="size-6 text-petrol" label={null} />
          <span className="font-heading text-sm font-medium">
            {BRAND.productName}
          </span>
        </Link>
        <span className="hidden text-sm text-muted-foreground sm:inline">
          {deck.title}
          {tour === TOURS.short && ', qısa tur'}
        </span>

        <div className="ml-auto flex items-center gap-1">
          <SlideTopics
            deck={deck}
            slides={slides}
            currentId={slide.id}
            tour={tour}
            searchParams={searchParams}
          />
          {fullscreen.isSupported && (
            <Button
              variant="ghost"
              size="icon"
              onClick={fullscreen.toggle}
              aria-label={
                fullscreen.isFullscreen ? 'Tam ekrandan çıx' : 'Tam ekran'
              }
              title={
                fullscreen.isFullscreen
                  ? 'Tam ekrandan çıx (F)'
                  : 'Tam ekran (F)'
              }
            >
              {fullscreen.isFullscreen ? <Minimize /> : <Maximize />}
            </Button>
          )}
          <Button variant="ghost" size="icon" asChild>
            <Link to="/" aria-label="Ana səhifə" title="Ana səhifə">
              <House />
            </Link>
          </Button>
          <AccessStatus />
        </div>
      </header>

      <div className="relative flex min-h-0">
        <main className="min-h-0 min-w-0 flex-1 overflow-y-auto px-4 py-6 md:px-8 lg:overflow-hidden lg:px-14 lg:py-8">
          <p className="sr-only" aria-live="polite">
            {number
              ? `Slayd ${number} / ${total}: ${slide.title}`
              : slide.title}
          </p>
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={slide.id}
              data-comment-area="content"
              className="relative mx-auto h-full max-w-[1440px]"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.22, ease: 'easeOut' }}
            >
              <SlideLayout
                slide={slide}
                position={number}
                total={total}
                phone={<ScenarioPhone runtime={runtime} />}
                admin={<ScenarioAdmin runtime={runtime} />}
                aside={
                  runtime.scenario?.Aside && <ScenarioAside runtime={runtime} />
                }
              />
              {feedbackMode && (
                <CommentLayer
                  deckId={deck.id}
                  slideId={slide.id}
                  comments={feedback.visiblePins}
                  pinNumbers={feedback.pinNumbers}
                  visible={feedback.pinsVisible}
                  placing={feedback.pins.placing}
                  draft={feedback.pins.draft}
                  activeId={feedback.pins.activeId}
                  onPlace={feedback.place}
                  onSelect={feedback.select}
                  onCancelDraft={feedback.cancelDraft}
                  onSent={feedback.sent}
                />
              )}
            </motion.div>
          </AnimatePresence>
        </main>

        <AnimatePresence initial={false}>
          {feedbackMode && feedback.panelOpen && (
            <motion.aside
              key="feedback"
              aria-label="Rəy paneli"
              className="absolute inset-0 z-20 bg-card lg:static lg:w-[400px] lg:shrink-0 lg:border-l"
              initial={{ opacity: 0, x: 24 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 24 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
            >
              <FeedbackPanel
                id={feedbackPanelId}
                deckId={deck.id}
                slide={slide}
                comments={feedback.comments}
                pinNumbers={feedback.pinNumbers}
                activeId={feedback.pins.activeId}
                onSelect={feedback.select}
                onClose={feedback.closePanel}
                admin={feedback.mode === 'admin'}
              />
            </motion.aside>
          )}
        </AnimatePresence>
      </div>

      <footer className="flex items-center gap-2 border-t px-4 py-3 md:px-8">
        <Button
          variant="outline"
          size="lg"
          disabled={isFirst}
          onClick={() => goTo(index - 1)}
        >
          <ChevronLeft data-icon="inline-start" />
          Əvvəlki
        </Button>
        <Button size="lg" disabled={isLast} onClick={() => goTo(index + 1)}>
          {startsProduct ? 'Başla' : 'Növbəti'}
          <ChevronRight data-icon="inline-end" />
        </Button>
        <div className="ml-3 border-l pl-3 empty:hidden">
          <DemoControls runtime={runtime} />
        </div>
        {/* Feedback lives outside the demo state, so a demo reset never touches it. */}
        <div className="ml-auto">
          {feedbackMode && (
            <FeedbackBar
              slideId={slide.id}
              reactions={feedback.reactions}
              panelId={feedbackPanelId}
              panelOpen={feedback.panelOpen}
              onTogglePanel={feedback.togglePanel}
              commentCount={feedback.comments.items.length}
              placing={feedback.pins.placing}
              onTogglePlacing={feedback.togglePlacing}
              readOnly={feedback.mode === 'admin'}
            />
          )}
        </div>
      </footer>
    </div>
  )
}

function SlideTopics({ deck, slides, currentId, tour, searchParams }) {
  const otherTour = tour === TOURS.short ? TOURS.full : TOURS.short

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          aria-label="Mövzular"
          title="Mövzular"
        >
          <ListOrdered />
        </Button>
      </SheetTrigger>
      <SheetContent className="gap-0">
        <SheetHeader className="border-b">
          <SheetTitle>{deck.title}</SheetTitle>
          <SheetDescription>
            {tour === TOURS.short ? 'Qısa tur' : 'Tam tur'},{' '}
            {countNumbered(slides)} slayd
          </SheetDescription>
        </SheetHeader>
        <nav
          aria-label="Slaydlar"
          className="min-h-0 flex-1 overflow-y-auto p-2"
        >
          <ol>
            {slides.map((item, i) => {
              const isCurrent = item.id === currentId
              return (
                <li key={item.id}>
                  <SheetClose asChild>
                    <Link
                      to={slideHref(deck.id, item.id, searchParams)}
                      aria-current={isCurrent ? 'page' : undefined}
                      className={cn(
                        'flex gap-3 rounded-lg px-3 py-2.5 text-sm outline-none hover:bg-muted focus-visible:ring-3 focus-visible:ring-ring/50',
                        isCurrent && 'bg-secondary font-medium text-petrol',
                      )}
                    >
                      <span className="w-5 shrink-0 text-right text-muted-foreground tabular-nums">
                        {slideNumber(slides, i)}
                      </span>
                      {item.title}
                    </Link>
                  </SheetClose>
                </li>
              )
            })}
          </ol>
        </nav>
        <SheetFooter className="border-t">
          <SheetClose asChild>
            <Button variant="outline" asChild>
              <Link to={tourHref(deck, otherTour, currentId, searchParams)}>
                {otherTour === TOURS.short ? 'Qısa tura keç' : 'Tam tura keç'}
              </Link>
            </Button>
          </SheetClose>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
