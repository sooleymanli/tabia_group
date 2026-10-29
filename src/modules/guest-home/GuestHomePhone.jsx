import { AnimatePresence, motion } from 'motion/react'
import {
  Bell,
  CheckCheck,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ConciergeBell,
  Flower2,
  House,
  Languages,
  LogOut,
  MapPin,
  MessageCircle,
  ReceiptText,
  SunMoon,
  UserRound,
  Wifi,
} from 'lucide-react'
import { TabiaMark } from '@/components/brand/TabiaLogo'
import { useScenarioDispatch, useScenarioState } from '@/demo/scenarioStore'
import { getLocale, useGuestLocale, useLocalized, useT } from '@/guest-app/i18n'
import { BottomSheet } from '@/guest-app/ui/BottomSheet'
import { SettingsButton } from '@/guest-app/ui/GuestSettings'
import { Pressable } from '@/guest-app/ui/Pressable'
import { TabBar } from '@/guest-app/ui/TabBar'
import { cn } from '@/lib/utils'
import {
  DEMO_STAY,
  FUN,
  FUN_PREVIEW_COUNT,
  HOME_SERVICE_IDS,
  NOTES,
  NOTIFICATIONS,
  PROFILE_ITEMS,
  PROGRAM,
  SERVICE_GROUPS,
  SERVICES,
  SPA_NAME,
  UNREAD_NOTIFICATIONS,
  VENUES,
  WELLNESS,
} from './homeData'

const TAB_ITEMS = [
  { id: 'home', icon: House, labelKey: 'tab.home' },
  { id: 'services', icon: ConciergeBell, labelKey: 'tab.services' },
  { id: 'orders', icon: ReceiptText, labelKey: 'tab.orders' },
  { id: 'chat', icon: MessageCircle, labelKey: 'tab.chat' },
  { id: 'profile', icon: UserRound, labelKey: 'tab.profile' },
]

const groupDigits = (n) => String(n).replace(/\B(?=(\d{3})+(?!\d))/g, '\u00a0')

function TabScroll({ children, className }) {
  return (
    <div
      className={cn(
        'flex min-h-0 flex-1 flex-col gap-5 overflow-y-auto overscroll-contain px-4 pt-1 pb-6 *:shrink-0',
        className,
      )}
    >
      {children}
    </div>
  )
}

function SectionTitle({ children, action }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <h3 className="font-sans text-[15px] font-semibold">{children}</h3>
      {action}
    </div>
  )
}

function ServiceTile({ service, large = false, row = false }) {
  const t = useT()
  const dispatch = useScenarioDispatch()
  const Icon = service.icon
  return (
    <Pressable
      data-demo-target={`service-${service.id}`}
      onClick={() => dispatch({ type: 'openNote', noteId: service.id })}
      className={cn(
        'flex items-center gap-1.5',
        row
          ? 'gap-2.5 rounded-2xl bg-card p-2.5 text-start ring-1 ring-border'
          : 'flex-col text-center',
        large && 'rounded-2xl bg-card p-3 ring-1 ring-border',
      )}
    >
      <span
        className={cn(
          'grid shrink-0 place-items-center rounded-2xl text-primary',
          row || large
            ? 'size-11 bg-accent'
            : 'size-14 bg-card ring-1 ring-border',
        )}
      >
        <Icon className="size-[22px]" strokeWidth={1.9} />
      </span>
      <span
        className={cn(
          'line-clamp-2 leading-tight font-medium',
          row ? 'text-[13px]' : 'text-[11px]',
        )}
      >
        {t(`service.${service.id}`)}
      </span>
    </Pressable>
  )
}

function HomeHeader() {
  const t = useT()
  const dispatch = useScenarioDispatch()
  const read = useScenarioState((s) => s.notificationsRead)
  return (
    <header className="flex items-center gap-2.5">
      <TabiaMark className="size-7 text-primary" label={null} />
      <span className="font-heading text-sm">{t('app.name')}</span>
      <span className="rounded-full bg-warning/15 px-2 py-0.5 text-[10px] font-semibold text-warning">
        {t('app.demo')}
      </span>
      <Pressable
        aria-label={t('home.notifications')}
        data-demo-target="open-notifications"
        onClick={() => dispatch({ type: 'openNotifications' })}
        className="relative ms-auto grid size-10 place-items-center rounded-full bg-secondary text-secondary-foreground"
      >
        <Bell className="size-[18px]" />
        {!read && (
          <span className="absolute -end-0.5 -top-0.5 grid min-w-[18px] place-items-center rounded-full bg-destructive px-1 text-[10px] leading-[18px] font-semibold text-white tabular-nums ring-2 ring-background">
            {UNREAD_NOTIFICATIONS}
          </span>
        )}
      </Pressable>
      <SettingsButton />
    </header>
  )
}

function StayCard() {
  const t = useT()
  return (
    <section className="relative h-56 overflow-hidden rounded-3xl text-white">
      <img
        src={DEMO_STAY.image}
        alt=""
        className="absolute inset-0 size-full object-cover"
      />
      <span className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/10 to-black/80" />
      <div className="relative flex h-full flex-col justify-between p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="text-[11px] leading-tight font-semibold tracking-[0.12em]">
              {DEMO_STAY.hotel}
            </p>
            <p className="mt-1 flex items-center gap-1 text-[11px] text-white/85">
              <MapPin className="size-3" />
              {t('home.city')}
            </p>
          </div>
          <Pressable className="flex shrink-0 items-center gap-1.5 rounded-full bg-white/20 px-2.5 py-1 text-[11px] font-semibold backdrop-blur-md">
            <Wifi className="size-3.5" />
            {t('home.wifi')}
          </Pressable>
        </div>
        <div className="flex items-end justify-between gap-3">
          <div className="min-w-0">
            <p className="text-xs font-medium text-white/85">
              {DEMO_STAY.roomType}
            </p>
            <p className="font-heading text-2xl leading-tight">
              {t('common.room', { room: DEMO_STAY.room })}
            </p>
            <p className="mt-0.5 text-xs text-white/85">
              {t('home.checkout', {
                date: DEMO_STAY.checkoutDate,
                time: DEMO_STAY.checkoutTime,
              })}
            </p>
          </div>
          <span className="shrink-0 rounded-2xl bg-white px-3 py-2 text-center text-xs font-semibold text-[#0f2224]">
            {t('home.nightsLeft', { n: DEMO_STAY.nightsLeft })}
          </span>
        </div>
      </div>
    </section>
  )
}

function HomeTab() {
  const t = useT()
  const dispatch = useScenarioDispatch()
  const shown = HOME_SERVICE_IDS.map((id) =>
    SERVICES.find((service) => service.id === id),
  )

  return (
    <TabScroll>
      <HomeHeader />
      <div>
        <h2 className="font-heading text-[22px] leading-tight">
          {t('home.greeting', { name: DEMO_STAY.guestName })}
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          {t('home.subtitle')}
        </p>
      </div>
      <StayCard />

      <section className="flex flex-col gap-3">
        <SectionTitle
          action={
            <Pressable
              data-demo-target="see-all-services"
              onClick={() => dispatch({ type: 'selectTab', tab: 'services' })}
              className="flex items-center gap-0.5 rounded-full text-[13px] font-semibold text-primary"
            >
              {t('home.seeAll')}
              <ChevronRight className="size-4 rtl:-scale-x-100" />
            </Pressable>
          }
        >
          {t('home.services')}
        </SectionTitle>
        <div className="grid grid-cols-4 gap-x-2 gap-y-3.5">
          {shown.map((service) => (
            <ServiceTile key={service.id} service={service} />
          ))}
        </div>
      </section>

      <section className="flex flex-col gap-3">
        <SectionTitle>{t('home.today')}</SectionTitle>
        <div className="-mx-4 flex snap-x scroll-px-4 [scrollbar-width:none] gap-2.5 overflow-x-auto px-4 pb-1">
          {PROGRAM.map((event) => (
            <article
              key={event.id}
              className="flex w-40 shrink-0 snap-start flex-col gap-2 rounded-2xl bg-card p-3 ring-1 ring-border"
            >
              <span className="w-fit rounded-full bg-accent px-2 py-0.5 text-[11px] font-semibold text-accent-foreground tabular-nums">
                {event.time}
              </span>
              <p className="text-sm leading-snug font-semibold">
                {t(`program.${event.id}`)}
              </p>
              <p className="text-xs text-muted-foreground">
                {t(`program.${event.id}Place`)}
              </p>
            </article>
          ))}
        </div>
      </section>

      <section className="flex flex-col gap-3">
        <SectionTitle>{t('home.forYou')}</SectionTitle>
        <article className="relative flex h-28 items-end overflow-hidden rounded-2xl text-white">
          <img
            src="/assets/demo/food/orange-juice.jpg"
            alt=""
            className="absolute inset-0 size-full object-cover"
          />
          <span className="absolute inset-0 bg-gradient-to-t from-black/80 to-black/10" />
          <div className="relative p-3.5">
            <p className="text-sm font-semibold">
              {t('offer.breakfast.title')}
            </p>
            <p className="text-xs text-white/85">{t('offer.breakfast.text')}</p>
          </div>
        </article>
        <article className="flex items-center gap-3 rounded-2xl bg-accent p-3.5 text-accent-foreground">
          <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-card text-primary">
            <Flower2 className="size-5" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold">{t('offer.spa.title')}</p>
            <p className="text-xs opacity-80">{t('offer.spa.text')}</p>
          </div>
          <span className="shrink-0 rounded-full bg-card px-2.5 py-1 text-[11px] font-semibold text-primary tabular-nums">
            {t('home.points', { n: groupDigits(DEMO_STAY.points) })}
          </span>
        </article>
      </section>
    </TabScroll>
  )
}

function TabHeader({ title }) {
  return (
    <header className="flex items-center gap-3">
      <h2 className="min-w-0 flex-1 truncate font-heading text-xl">{title}</h2>
      <SettingsButton />
    </header>
  )
}

function ServiceGroup({ group, rows = false }) {
  const t = useT()
  return (
    <section className="flex flex-col gap-2.5">
      <SectionTitle>{t(`services.group.${group}`)}</SectionTitle>
      <div className={cn('grid gap-2.5', rows ? 'grid-cols-2' : 'grid-cols-3')}>
        {SERVICES.filter((service) => service.group === group).map(
          (service) => (
            <ServiceTile
              key={service.id}
              service={service}
              large={!rows}
              row={rows}
            />
          ),
        )}
      </div>
    </section>
  )
}

function PhotoShade({ className }) {
  return (
    <span
      aria-hidden="true"
      className={cn('absolute inset-0 bg-gradient-to-t', className)}
    />
  )
}

function Venues() {
  const t = useT()
  const dispatch = useScenarioDispatch()
  return (
    <section className="flex flex-col gap-2.5">
      <SectionTitle>{t('services.group.restaurants')}</SectionTitle>
      <div className="-mx-4 flex snap-x scroll-px-4 [scrollbar-width:none] gap-2.5 overflow-x-auto px-4 pb-1">
        {VENUES.map((venue) => (
          <Pressable
            key={venue.id}
            data-demo-target={`venue-${venue.id}`}
            onClick={() => dispatch({ type: 'openNote', noteId: venue.id })}
            className="relative flex h-40 w-56 shrink-0 snap-start items-end overflow-hidden rounded-2xl text-start text-white"
          >
            <img
              src={venue.image}
              alt=""
              className="absolute inset-0 size-full object-cover"
            />
            <PhotoShade className="from-black/85 via-black/25 to-transparent" />
            <span className="relative flex flex-col gap-0.5 p-3">
              <span className="text-sm leading-tight font-semibold">
                {venue.name}
              </span>
              <span className="text-[11px] text-white/85">
                {t(venue.metaKey)}
              </span>
            </span>
          </Pressable>
        ))}
      </div>
    </section>
  )
}

function Wellness() {
  const t = useT()
  const dispatch = useScenarioDispatch()
  return (
    <section className="flex flex-col gap-2.5">
      <SectionTitle
        action={
          <span className="text-xs font-medium text-muted-foreground">
            {SPA_NAME}
          </span>
        }
      >
        {t('services.group.wellness')}
      </SectionTitle>
      <div className="grid grid-cols-3 gap-2.5">
        {WELLNESS.map((item) => (
          <Pressable
            key={item.id}
            data-demo-target={`wellness-${item.id}`}
            onClick={() => dispatch({ type: 'openNote', noteId: item.id })}
            className="flex flex-col gap-1.5 text-start"
          >
            <img
              src={item.image}
              alt=""
              className="aspect-[4/5] w-full rounded-2xl object-cover"
            />
            <span className="text-[13px] leading-tight font-semibold">
              {t(item.labelKey)}
            </span>
            {(item.meta || item.metaKey) && (
              <span className="-mt-1 text-[11px] text-muted-foreground">
                {item.meta ?? t(item.metaKey)}
              </span>
            )}
          </Pressable>
        ))}
      </div>
    </section>
  )
}

function Entertainment() {
  const t = useT()
  const dispatch = useScenarioDispatch()
  const allShown = useScenarioState((s) => s.allFunShown)
  const items = allShown ? FUN : FUN.slice(0, FUN_PREVIEW_COUNT)
  return (
    <section className="flex flex-col gap-2.5">
      <SectionTitle>{t('services.group.fun')}</SectionTitle>
      <div className="grid grid-cols-3 gap-2">
        {items.map((item, index) => (
          <motion.div
            key={item.id}
            initial={index < FUN_PREVIEW_COUNT ? false : { opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.22,
              delay: Math.max(0, index - FUN_PREVIEW_COUNT) * 0.03,
            }}
          >
            <Pressable
              data-demo-target={`fun-${item.id}`}
              onClick={() => dispatch({ type: 'openNote', noteId: item.id })}
              className="relative grid aspect-square w-full place-items-center overflow-hidden rounded-2xl p-2 text-center text-white"
            >
              <img
                src={item.image}
                alt=""
                className="absolute inset-0 size-full object-cover"
              />
              <PhotoShade className="from-black/70 to-black/35" />
              <span className="relative text-[11px] leading-tight font-semibold">
                {t(item.labelKey)}
              </span>
            </Pressable>
          </motion.div>
        ))}
      </div>
      <Pressable
        data-demo-target="fun-toggle"
        aria-expanded={allShown}
        onClick={() => dispatch({ type: 'toggleAllFun' })}
        className="flex h-11 items-center justify-center gap-1.5 rounded-2xl bg-secondary text-[13px] font-semibold text-secondary-foreground"
      >
        {t(allShown ? 'action.showLess' : 'action.showMore')}
        {!allShown && (
          <span className="text-muted-foreground tabular-nums">
            +{FUN.length - FUN_PREVIEW_COUNT}
          </span>
        )}
        <ChevronDown
          className={cn(
            'size-4 transition-transform',
            allShown && 'rotate-180',
          )}
        />
      </Pressable>
    </section>
  )
}

function ServicesTab() {
  const t = useT()
  return (
    <TabScroll>
      <TabHeader title={t('tab.services')} />
      <ServiceGroup group="stay" rows />
      <Venues />
      <Wellness />
      <Entertainment />
      {SERVICE_GROUPS.filter((group) => group !== 'stay').map((group) => (
        <ServiceGroup key={group} group={group} />
      ))}
    </TabScroll>
  )
}

function EmptyTab({ titleKey, icon: Icon, heading, hint }) {
  const t = useT()
  return (
    <TabScroll>
      <TabHeader title={t(titleKey)} />
      <div className="flex flex-1 flex-col items-center justify-center gap-3 px-6 pb-16 text-center">
        <span className="grid size-16 place-items-center rounded-full bg-accent text-primary">
          <Icon className="size-7" strokeWidth={1.8} />
        </span>
        <p className="text-base font-semibold">{heading}</p>
        <p className="max-w-[26ch] text-sm text-muted-foreground">{hint}</p>
      </div>
    </TabScroll>
  )
}

function ListRow({ icon: Icon, label, value, target, onClick, danger }) {
  return (
    <button
      type="button"
      data-demo-target={target}
      onClick={onClick}
      className={cn(
        'flex h-14 w-full items-center gap-3 border-b border-border px-4 text-start outline-none last:border-b-0 focus-visible:bg-secondary active:bg-secondary',
        danger && 'text-destructive',
      )}
    >
      <Icon
        className={cn(
          'size-[18px]',
          danger ? 'text-destructive' : 'text-primary',
        )}
      />
      <span className="flex-1 text-[15px]">{label}</span>
      {value && <span className="text-sm text-muted-foreground">{value}</span>}
      {!danger && (
        <ChevronRight className="size-4 text-muted-foreground rtl:-scale-x-100" />
      )}
    </button>
  )
}

function ListCard({ children }) {
  return (
    <div className="overflow-hidden rounded-2xl bg-card ring-1 ring-border">
      {children}
    </div>
  )
}

function ProfileTab() {
  const t = useT()
  const dispatch = useScenarioDispatch()
  const locale = useGuestLocale((state) => state.locale)
  const theme = useGuestLocale((state) => state.theme)
  const openSettings = useGuestLocale((state) => state.openSettings)
  const openNote = (noteId) => dispatch({ type: 'openNote', noteId })

  return (
    <TabScroll>
      <TabHeader title={t('tab.profile')} />
      <section className="flex items-center gap-3.5 rounded-2xl bg-card p-4 ring-1 ring-border">
        <span className="grid size-14 place-items-center rounded-full bg-primary font-heading text-xl text-primary-foreground">
          {DEMO_STAY.guestName[0]}
        </span>
        <div className="min-w-0">
          <p className="text-xs text-muted-foreground">
            {t('profile.guestLabel')}
          </p>
          <p className="text-lg font-semibold">{DEMO_STAY.guestName}</p>
        </div>
      </section>
      <section className="flex flex-col gap-2">
        <SectionTitle>{t('profile.stay')}</SectionTitle>
        <div className="rounded-2xl bg-card p-4 text-sm ring-1 ring-border">
          <p className="font-semibold">
            {t('common.room', { room: DEMO_STAY.room })}, {DEMO_STAY.roomType}
          </p>
          <p className="mt-1 text-muted-foreground">
            {DEMO_STAY.hotel}, {t('home.city')}
          </p>
          <p className="mt-1 text-muted-foreground">
            {t('home.checkout', {
              date: DEMO_STAY.checkoutDate,
              time: DEMO_STAY.checkoutTime,
            })}
          </p>
        </div>
      </section>
      <ListCard>
        {PROFILE_ITEMS.map((item) => (
          <ListRow
            key={item.id}
            icon={item.icon}
            label={t(`profile.${item.id}`)}
            target={`profile-${item.id}`}
            onClick={() => openNote(item.id)}
          />
        ))}
      </ListCard>
      <section className="flex flex-col gap-2">
        <SectionTitle>{t('settings.title')}</SectionTitle>
        <ListCard>
          <ListRow
            icon={Languages}
            label={t('language.label')}
            value={getLocale(locale).name}
            target="profile-language"
            onClick={openSettings}
          />
          <ListRow
            icon={SunMoon}
            label={t('settings.appearance')}
            value={t(`settings.theme.${theme}`)}
            target="profile-appearance"
            onClick={openSettings}
          />
        </ListCard>
      </section>
      <ListCard>
        <ListRow
          icon={LogOut}
          label={t('profile.logout')}
          target="profile-logout"
          onClick={() => openNote('logout')}
          danger
        />
      </ListCard>
    </TabScroll>
  )
}

function TabContent({ tab }) {
  const t = useT()
  switch (tab) {
    case 'services':
      return <ServicesTab />
    case 'orders':
      return (
        <EmptyTab
          titleKey="tab.orders"
          icon={ReceiptText}
          heading={t('orders.empty')}
          hint={t('orders.emptyHint')}
        />
      )
    case 'chat':
      return (
        <EmptyTab
          titleKey="tab.chat"
          icon={MessageCircle}
          heading={t('chat.title')}
          hint={t('chat.hint')}
        />
      )
    case 'profile':
      return <ProfileTab />
    default:
      return <HomeTab />
  }
}

function NoteSheet() {
  const t = useT()
  const dispatch = useScenarioDispatch()
  const noteId = useScenarioState((s) => s.noteId)
  const note = noteId ? NOTES[noteId] : null
  const close = () => dispatch({ type: 'closeNote' })
  const Icon = note?.icon

  return (
    <BottomSheet
      open={Boolean(note)}
      onClose={close}
      title={note ? (note.label ?? t(note.labelKey)) : ''}
    >
      {note && (
        <div className="flex flex-col items-center gap-4 pt-2 text-center">
          {note.image ? (
            <img
              src={note.image}
              alt=""
              className="h-40 w-full rounded-2xl object-cover"
            />
          ) : (
            <span className="grid size-16 place-items-center rounded-3xl bg-accent text-primary">
              <Icon className="size-7" strokeWidth={1.8} />
            </span>
          )}
          <span className="rounded-full bg-warning/15 px-2.5 py-0.5 text-[11px] font-semibold text-warning">
            {t('app.demo')}
          </span>
          <p className="max-w-[30ch] text-[15px] leading-relaxed">
            {t(note.textKey ?? 'note.moreOnSlides')}
          </p>
          <Pressable
            data-demo-target="note-close"
            onClick={close}
            className="mt-1 h-12 w-full rounded-2xl bg-primary text-[15px] font-semibold text-primary-foreground"
          >
            {t('action.close')}
          </Pressable>
        </div>
      )}
    </BottomSheet>
  )
}

function NotificationItem({ item, unread }) {
  const t = useT()
  const Icon = item.icon
  const [timeKey, n] = item.time
  return (
    <li
      className={cn(
        'flex gap-3 rounded-2xl p-3',
        unread ? 'bg-accent/60' : 'bg-card ring-1 ring-border',
      )}
    >
      <span className="grid size-10 shrink-0 place-items-center rounded-full bg-card text-primary ring-1 ring-border">
        <Icon className="size-[18px]" />
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex items-start gap-2">
          <p className="flex-1 text-sm leading-snug font-semibold">
            {t(`notif.${item.id}.title`)}
          </p>
          <span className="shrink-0 pt-0.5 text-[11px] text-muted-foreground tabular-nums">
            {t(`notif.${timeKey}`, { n })}
          </span>
        </div>
        <p className="mt-0.5 text-[13px] text-muted-foreground">
          {t(`notif.${item.id}.text`)}
        </p>
      </div>
      {unread && (
        <span className="mt-1.5 size-2 shrink-0 rounded-full bg-primary" />
      )}
    </li>
  )
}

function NotificationsScreen() {
  const t = useT()
  const { dir } = useLocalized()
  const dispatch = useScenarioDispatch()
  const open = useScenarioState((s) => s.notificationsOpen)
  const read = useScenarioState((s) => s.notificationsRead)
  const side = dir === 'rtl' ? -1 : 1

  return (
    <AnimatePresence>
      {open && (
        <motion.section
          aria-label={t('home.notifications')}
          className="absolute inset-0 z-30 flex flex-col bg-background"
          initial={{ x: `${100 * side}%` }}
          animate={{ x: 0 }}
          exit={{ x: `${100 * side}%` }}
          transition={{ type: 'spring', stiffness: 380, damping: 38 }}
        >
          <header className="flex shrink-0 items-center gap-3 px-4 pt-1 pb-3">
            <Pressable
              data-demo-target="notifications-back"
              onClick={() => dispatch({ type: 'closeNotifications' })}
              aria-label={t('action.back')}
              className="grid size-10 place-items-center rounded-full bg-secondary text-secondary-foreground"
            >
              <ChevronLeft className="size-5 rtl:-scale-x-100" />
            </Pressable>
            <h2 className="min-w-0 flex-1 truncate font-heading text-lg">
              {t('home.notifications')}
            </h2>
            <Pressable
              data-demo-target="notifications-read"
              disabled={read}
              onClick={() => dispatch({ type: 'readNotifications' })}
              className="flex items-center gap-1 rounded-full px-2 py-1 text-[13px] font-semibold text-primary"
            >
              <CheckCheck className="size-4" />
              {t('notif.markAll')}
            </Pressable>
          </header>
          <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto overscroll-contain px-4 pb-6">
            {['today', 'earlier'].map((day) => (
              <section key={day} className="flex flex-col gap-2">
                <SectionTitle>{t(`notif.${day}`)}</SectionTitle>
                <ul className="flex flex-col gap-2">
                  {NOTIFICATIONS.map((item, index) =>
                    item.day === day ? (
                      <NotificationItem
                        key={item.id}
                        item={item}
                        unread={!read && index < UNREAD_NOTIFICATIONS}
                      />
                    ) : null,
                  )}
                </ul>
              </section>
            ))}
          </div>
        </motion.section>
      )}
    </AnimatePresence>
  )
}

export function GuestHomePhone() {
  const tab = useScenarioState((s) => s.tab)
  const dispatch = useScenarioDispatch()

  return (
    <div className="relative flex h-full flex-col">
      <div className="relative min-h-0 flex-1">
        <AnimatePresence initial={false} mode="popLayout">
          <motion.div
            key={tab}
            className="absolute inset-0 flex flex-col bg-background"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.22, ease: 'easeOut' }}
          >
            <TabContent tab={tab} />
          </motion.div>
        </AnimatePresence>
      </div>
      <TabBar
        items={TAB_ITEMS}
        value={tab}
        onChange={(next) => dispatch({ type: 'selectTab', tab: next })}
      />
      <NotificationsScreen />
      <NoteSheet />
    </div>
  )
}
