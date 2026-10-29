import { TabiaMark } from '@/components/brand/TabiaLogo'
import { Badge } from '@/components/ui/badge'
import { BRAND } from '@/config/brand'
import { cn } from '@/lib/utils'

export function HotelAdminFrame({
  children,
  overlay,
  className,
  title = 'Otel idarə paneli',
}) {
  return (
    <section
      aria-label={title}
      data-keyboard-isolated
      data-comment-area="admin"
      className={cn(
        'relative flex size-full min-h-0 min-w-0 flex-col overflow-hidden rounded-2xl border bg-card shadow-[0_24px_60px_-32px_rgb(15_61_62/0.45)]',
        className,
      )}
    >
      <header className="flex shrink-0 items-center gap-2.5 border-b px-4 py-3">
        <TabiaMark className="size-5 text-petrol" label={null} />
        <span className="text-sm font-medium">{title}</span>
        <Badge variant="secondary" className="ml-auto">
          {BRAND.demoLabel}
        </Badge>
      </header>
      <div className="min-h-0 flex-1 overflow-auto">{children}</div>
      {overlay}
    </section>
  )
}
