import { ChevronLeft } from 'lucide-react'
import { useT } from '@/guest-app/i18n'
import { Pressable } from './Pressable'

export function ScreenHeader({ title, onBack, trailing }) {
  const t = useT()

  return (
    <header className="flex shrink-0 items-center gap-3 px-4 pt-1 pb-3">
      {onBack && (
        <Pressable
          data-demo-target="back"
          onClick={onBack}
          aria-label={t('action.back')}
          className="grid size-10 place-items-center rounded-full bg-secondary text-secondary-foreground"
        >
          <ChevronLeft className="size-5 rtl:-scale-x-100" />
        </Pressable>
      )}
      <h2 className="min-w-0 flex-1 truncate font-heading text-lg">{title}</h2>
      {trailing}
    </header>
  )
}
