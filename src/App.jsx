import { TabiaLogo, TabiaMark } from '@/components/brand/TabiaLogo'
import { BRAND } from '@/config/brand'

// Temporary brand check screen; replaced by the landing page in phase 2.
function App() {
  return (
    <main className="grid min-h-svh md:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
      <section className="flex items-center justify-center bg-petrol p-12 text-mist">
        <TabiaLogo className="w-28 md:w-40" />
      </section>
      <section className="flex flex-col justify-center gap-6 p-8 md:p-16">
        <TabiaMark className="size-10 text-petrol" />
        <h1 className="max-w-xl text-4xl leading-tight font-medium text-ink md:text-5xl">
          {BRAND.productName}
        </h1>
        <p className="max-w-[60ch] text-lg text-muted-foreground">
          Otel qonaqları üçün mobil tətbiq və idarəetmə paneli. Təqdimat
          hazırlanır.
        </p>
      </section>
    </main>
  )
}

export default App
