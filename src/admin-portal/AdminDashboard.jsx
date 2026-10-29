import { useState } from 'react'
import { ExternalLink, LogOut, RefreshCw } from 'lucide-react'
import { Link, useSearchParams } from 'react-router'
import { accessStore } from '@/access/accessStore'
import { TabiaMark } from '@/components/brand/TabiaLogo'
import { Button } from '@/components/ui/button'
import { BRAND } from '@/config/brand'
import { cn } from '@/lib/utils'
import { formatDateTime, summarize } from './adminFormat'
import { CommentsTab } from './CommentsTab'
import { OverviewTab } from './OverviewTab'
import { PinsTab } from './PinsTab'
import { SlidesTab } from './SlidesTab'
import { useAdminData } from './useAdminData'

const TABS = [
  { id: 'icmal', label: 'İcmal' },
  { id: 'reyler', label: 'Rəylər' },
  { id: 'pinler', label: 'PIN-lər' },
  { id: 'slaydlar', label: 'Slaydlar' },
]

export function AdminDashboard() {
  const [searchParams, setSearchParams] = useSearchParams()
  const tab = TABS.some((item) => item.id === searchParams.get('tab'))
    ? searchParams.get('tab')
    : TABS[0].id
  const data = useAdminData()
  const summary = summarize(data)
  const [signingOut, setSigningOut] = useState(false)

  const openTab = (id, extra = {}) =>
    setSearchParams({ tab: id, ...extra }, { replace: true })

  return (
    <div className="min-h-svh bg-background">
      <title>{`Developer Team paneli – ${BRAND.productName}`}</title>
      <header className="sticky top-0 z-10 border-b bg-background/95 backdrop-blur">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-x-6 gap-y-3 px-4 py-3 md:px-8">
          <div className="flex items-center gap-2.5">
            <TabiaMark className="size-6 text-petrol" label={null} />
            <span className="font-heading text-sm font-medium text-ink">
              Developer Team paneli
            </span>
          </div>
          <nav
            aria-label="Panel bölmələri"
            className="order-last w-full md:order-none md:w-auto"
          >
            <ul className="flex gap-1 overflow-x-auto">
              {TABS.map((item) => (
                <li key={item.id}>
                  <button
                    type="button"
                    onClick={() => openTab(item.id)}
                    aria-current={tab === item.id ? 'page' : undefined}
                    className={cn(
                      'rounded-lg px-3 py-1.5 text-sm whitespace-nowrap outline-none focus-visible:ring-3 focus-visible:ring-ring/50',
                      tab === item.id
                        ? 'bg-petrol text-mist'
                        : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                    )}
                  >
                    {item.label}
                    {item.id === 'reyler' && summary.newComments > 0 && (
                      <span className="ml-1.5 tabular-nums opacity-80">
                        {summary.newComments}
                      </span>
                    )}
                  </button>
                </li>
              ))}
            </ul>
          </nav>
          <div className="ml-auto flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={data.reload}
              disabled={data.status === 'loading'}
              title={
                data.loadedAt
                  ? `Son yenilənmə: ${formatDateTime(data.loadedAt.toISOString())}`
                  : undefined
              }
            >
              <RefreshCw
                data-icon="inline-start"
                className={cn(
                  data.status === 'loading' && 'motion-safe:animate-spin',
                )}
              />
              Yenilə
            </Button>
            <Button variant="ghost" size="sm" asChild>
              <Link to="/">
                <ExternalLink data-icon="inline-start" />
                Təqdimata bax
              </Link>
            </Button>
            <Button
              variant="ghost"
              size="icon"
              aria-label="Çıxış"
              title="Çıxış"
              disabled={signingOut}
              onClick={async () => {
                setSigningOut(true)
                await accessStore.getState().signOut()
              }}
            >
              <LogOut />
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-8 md:px-8">
        {data.status === 'error' ? (
          <div className="grid justify-items-start gap-3">
            <p className="text-muted-foreground">
              Məlumat yüklənmədi. Bağlantını yoxlayıb yenidən cəhd edin.
            </p>
            <Button variant="outline" onClick={data.reload}>
              Yenidən yüklə
            </Button>
          </div>
        ) : data.status === 'loading' && !data.loadedAt ? (
          <p role="status" className="text-muted-foreground">
            Yüklənir…
          </p>
        ) : tab === 'reyler' ? (
          <CommentsTab comments={data.comments} onChanged={data.reload} />
        ) : tab === 'pinler' ? (
          <PinsTab pins={data.pins} onChanged={data.reload} />
        ) : tab === 'slaydlar' ? (
          <SlidesTab slides={data.slides} />
        ) : (
          <OverviewTab
            summary={summary}
            comments={data.comments}
            onOpenComments={(filter) => openTab('reyler', filter)}
          />
        )}
      </main>
    </div>
  )
}
