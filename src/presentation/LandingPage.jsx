import { ChevronRight } from 'lucide-react'
import { Link } from 'react-router'
import { AccessStatus } from '@/access/AccessStatus'
import { Badge } from '@/components/ui/badge'
import { BRAND } from '@/config/brand'
import { BrandPanel } from './BrandPanel'
import { DECKS, isDeckReady, slideHref } from './decks'

const rowClass =
  'group flex items-start gap-4 px-6 py-6 outline-none md:px-10 lg:px-14'

function DeckEntry({ deck }) {
  const ready = isDeckReady(deck)

  const content = (
    <>
      <div className="min-w-0 flex-1">
        <h2
          className={`text-lg font-medium md:text-xl ${ready ? 'text-ink' : 'text-ink/55'}`}
        >
          {deck.title}
        </h2>
        <p className="mt-1.5 max-w-[56ch] text-muted-foreground">
          {deck.description}
        </p>
      </div>
      {ready ? (
        <ChevronRight
          aria-hidden="true"
          className="mt-1 size-6 shrink-0 text-petrol transition-transform group-hover:translate-x-0.5"
        />
      ) : (
        <Badge variant="outline" className="mt-1 text-muted-foreground">
          Hazırlanır
        </Badge>
      )}
    </>
  )

  if (!ready) {
    return (
      <li className="border-b border-border/80">
        <div aria-disabled="true" className={rowClass}>
          {content}
        </div>
      </li>
    )
  }

  return (
    <li className="border-b border-border/80 bg-card">
      <Link
        to={slideHref(deck.id, deck.slides[0].id)}
        className={`${rowClass} transition-colors hover:bg-secondary/60 focus-visible:bg-secondary/60 focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:ring-inset`}
      >
        {content}
      </Link>
    </li>
  )
}

export function LandingPage() {
  return (
    <div className="grid min-h-svh lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
      <title>{BRAND.productName}</title>

      <BrandPanel className="min-h-[52svh]" />

      <main className="relative flex flex-col justify-center py-16 lg:py-14">
        <AccessStatus className="absolute top-4 right-4 md:right-6" />
        <p className="px-6 pb-4 text-sm text-muted-foreground md:px-10 lg:px-14">
          Baxmaq istədiyiniz bölməni seçin.
        </p>
        <nav aria-label="Təqdimat bölmələri">
          <ul className="border-t border-border/80">
            {DECKS.map((deck) => (
              <DeckEntry key={deck.id} deck={deck} />
            ))}
          </ul>
        </nav>
      </main>
    </div>
  )
}
