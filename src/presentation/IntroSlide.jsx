import {
  ArrowLeft,
  ArrowRight,
  FlaskConical,
  MessageSquarePlus,
  MessageSquareText,
  Play,
  Settings,
  SlidersHorizontal,
  ThumbsDown,
  ThumbsUp,
  Workflow,
  WandSparkles,
} from 'lucide-react'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'

const NOTES = [
  {
    Icon: WandSparkles,
    title: 'Dizayn sizin rəyinizlə formalaşacaq',
    text: 'Ekranlar və istifadə axını (UI/UX) dəyişdiriləcək və təkmilləşdiriləcək.',
  },
  {
    Icon: SlidersHorizontal,
    title: 'Funksiyalar dəqiqləşəcək',
    text: 'Göstərilən funksionallıqlar artırıla və ya azaldıla bilər.',
  },
  {
    Icon: Workflow,
    title: 'Sizin proseslərinizə uyğunlaşacaq',
    text: 'Ssenarilər otellərinizin iş qaydasına və verdiyiniz biznes proseslərinə uyğunlaşdırılacaq.',
  },
  {
    Icon: FlaskConical,
    title: 'Məlumatlar demodur',
    text: 'Qonaqlar, sifarişlər, ödəniş və inteqrasiyalar simulyasiyadır; real sistemə heç nə göndərilmir.',
  },
]

// Static look-alikes of the real footer controls, so the guide matches what viewers will press.
function ControlSample({ children, variant = 'outline', size = 'lg' }) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        buttonVariants({ variant, size }),
        'pointer-events-none shrink-0',
      )}
    >
      {children}
    </span>
  )
}

function Key({ children, label }) {
  return (
    <kbd
      aria-label={label}
      className="inline-grid h-7 min-w-7 place-items-center rounded-md border border-b-2 bg-card px-1.5 font-sans text-xs font-semibold text-ink"
    >
      {children}
    </kbd>
  )
}

const FEEDBACK_STEPS = [
  {
    sample: (
      <span className="flex gap-0.5">
        <ControlSample variant="ghost" size="icon-lg">
          <ThumbsUp />
        </ControlSample>
        <ControlSample variant="ghost" size="icon-lg">
          <ThumbsDown />
        </ControlSample>
      </span>
    ),
    title: 'Bəyəndim və Bəyənmədim',
    text: 'Slayd haqqında ümumi təəssüratınız. Seçimi istənilən vaxt dəyişə və ya geri götürə bilərsiniz.',
  },
  {
    sample: (
      <ControlSample>
        <MessageSquarePlus data-icon="inline-start" />
        İşarələ
      </ControlSample>
    ),
    title: 'Konkret yerə rəy',
    text: 'Basın, sonra slaydda və ya telefon ekranında istədiyiniz nöqtəyə klikləyib şərh, təklif və ya sual yazın.',
  },
  {
    sample: (
      <ControlSample>
        <MessageSquareText data-icon="inline-start" />
        Rəyləri göstər
      </ControlSample>
    ),
    title: 'Rəylər və cavablar',
    text: 'Slayddakı rəyləri, Developer Team-in cavablarını və statusu (Yeni, Baxıldı, Həll edildi) göstərir.',
  },
]

function IntroHeading({ slide }) {
  return (
    <div className="flex flex-col gap-3">
      <h1 className="text-3xl leading-tight font-medium text-ink xl:text-4xl">
        {slide.title}
      </h1>
      <p className="max-w-[48ch] text-lg text-muted-foreground">
        {slide.summary}
      </p>
    </div>
  )
}

function NotesSlide({ slide }) {
  return (
    <div className="grid h-full min-h-0 content-center gap-10 lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)] lg:items-center lg:gap-16">
      <IntroHeading slide={slide} />
      <ul className="flex flex-col divide-y divide-border rounded-3xl border bg-card px-6 xl:px-8">
        {NOTES.map(({ Icon, title, text }) => (
          <li key={title} className="flex gap-4 py-5">
            <span className="mt-0.5 grid size-10 shrink-0 place-items-center rounded-full bg-secondary text-petrol">
              <Icon className="size-5" aria-hidden="true" />
            </span>
            <div className="flex flex-col gap-1">
              <h2 className="font-sans text-base font-semibold text-ink">
                {title}
              </h2>
              <p className="text-sm text-muted-foreground">{text}</p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}

function FeedbackSlide({ slide }) {
  return (
    <div className="grid h-full min-h-0 content-center gap-10 lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)] lg:items-center lg:gap-16">
      <IntroHeading slide={slide} />
      <section
        aria-label={slide.title}
        className="flex flex-col gap-5 rounded-3xl border bg-card p-6 xl:p-8"
      >
        <ul className="flex flex-col gap-4">
          {FEEDBACK_STEPS.map(({ sample, title, text }) => (
            <li
              key={title}
              className="grid gap-x-5 gap-y-2 sm:grid-cols-[11rem_minmax(0,1fr)] sm:items-center"
            >
              <span className="flex">{sample}</span>
              <div className="flex flex-col gap-0.5">
                <h3 className="font-sans text-sm font-semibold text-ink">
                  {title}
                </h3>
                <p className="text-sm text-muted-foreground">{text}</p>
              </div>
            </li>
          ))}
        </ul>

        <div className="grid gap-4 border-t pt-5 sm:grid-cols-2">
          <div className="flex flex-col gap-2">
            <h3 className="flex items-center gap-2 font-sans text-sm font-semibold text-ink">
              <Settings className="size-4 text-petrol" aria-hidden="true" />
              Telefonda dil və görünüş
            </h3>
            <p className="text-sm text-muted-foreground">
              Tətbiqdəki dişli düyməsi ilə 15 dildən birini və işıqlı və ya
              qaranlıq rejimi seçin. Seçim bütün slaydlarda qalır.
            </p>
          </div>
          <div className="flex flex-col gap-2">
            <h3 className="flex items-center gap-2 font-sans text-sm font-semibold text-ink">
              <Play className="size-4 text-petrol" aria-hidden="true" />
              Demonu idarə etmək
            </h3>
            <p className="text-sm text-muted-foreground">
              Telefonda özünüz klikləyin və ya «Demoya bax» ilə ssenarini
              avtomatik izləyin.
            </p>
            <p className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <Key label="Sol ox">
                  <ArrowLeft className="size-3.5" aria-hidden="true" />
                </Key>
                <Key label="Sağ ox">
                  <ArrowRight className="size-3.5" aria-hidden="true" />
                </Key>
                slaydlar
              </span>
              <span className="flex items-center gap-1.5">
                <Key>F</Key>
                tam ekran
              </span>
            </p>
          </div>
        </div>
      </section>
    </div>
  )
}

export function IntroSlide({ slide }) {
  return slide.layout === 'intro-feedback' ? (
    <FeedbackSlide slide={slide} />
  ) : (
    <NotesSlide slide={slide} />
  )
}
