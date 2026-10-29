import { TabiaLogo, TabiaMark } from '@/components/brand/TabiaLogo'
import { BRAND } from '@/config/brand'
import { cn } from '@/lib/utils'

export function BrandPanel({ className }) {
  return (
    <section
      className={cn(
        'relative isolate flex flex-col overflow-hidden bg-petrol p-6 text-mist md:p-10 lg:min-h-svh lg:p-14',
        className,
      )}
    >
      <TabiaLogo className="w-12 md:w-14" />
      <TabiaMark
        label={null}
        className="pointer-events-none absolute -right-[18%] -bottom-[14%] -z-10 w-[78%] text-petrol-soft/35 lg:w-[92%]"
      />
      <div className="mt-16 md:mt-24">
        <h1 className="text-4xl leading-tight font-medium md:text-6xl">
          {BRAND.productName}
        </h1>
        <p className="mt-5 max-w-[38ch] text-lg text-mist/80">
          Otel qonaqları üçün mobil tətbiq və idarəetmə panelinin interaktiv
          təqdimatı.
        </p>
      </div>
    </section>
  )
}
