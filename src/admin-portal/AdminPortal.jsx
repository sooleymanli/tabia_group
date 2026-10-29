import { useEffect, useId, useState } from 'react'
import { Link } from 'react-router'
import { ACCESS, accessStore, useAccess } from '@/access/accessStore'
import { GateLayout } from '@/access/PinScreen'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { AdminDashboard } from './AdminDashboard'

const LOGIN_ERRORS = {
  invalid_credentials: 'Email və ya parol yanlışdır.',
  email_not_confirmed: 'Bu email hələ təsdiqlənməyib.',
  over_request_rate_limit:
    'Çox sayda cəhd edildi. Bir neçə dəqiqə sonra yenidən cəhd edin.',
  not_admin: 'Bu hesabın idarə panelinə icazəsi yoxdur.',
  not_configured: 'Giriş xidməti qoşulmayıb.',
}

export function AdminPortal() {
  const status = useAccess((state) => state.status)

  useEffect(() => {
    accessStore.getState().check()
  }, [])

  if (status === ACCESS.admin) return <AdminDashboard />

  return (
    <GateLayout>
      {status === ACCESS.checking ? (
        <p role="status" className="text-muted-foreground">
          Giriş yoxlanılır…
        </p>
      ) : (
        <AdminLogin />
      )}
    </GateLayout>
  )
}

function AdminLogin() {
  const [error, setError] = useState(null)
  const [pending, setPending] = useState(false)
  const emailId = useId()
  const passwordId = useId()
  const errorId = useId()

  const submit = async (event) => {
    event.preventDefault()
    if (pending) return
    const form = new FormData(event.currentTarget)
    setPending(true)
    setError(null)
    const code = await accessStore
      .getState()
      .signInAdmin(
        String(form.get('email')).trim(),
        String(form.get('password')),
      )
    setPending(false)
    if (code)
      setError(LOGIN_ERRORS[code] ?? 'Giriş alınmadı. Yenidən cəhd edin.')
  }

  return (
    <form onSubmit={submit} aria-describedby={error ? errorId : undefined}>
      <h2 className="font-heading text-2xl font-medium text-ink md:text-3xl">
        Developer Team üçün giriş
      </h2>
      <p className="mt-3 text-muted-foreground">
        Yalnız icazə verilmiş Developer Team hesabları daxil ola bilər.
      </p>

      <div className="mt-8 grid gap-5">
        <div className="grid gap-2">
          <Label htmlFor={emailId}>Email</Label>
          <Input
            id={emailId}
            name="email"
            type="email"
            autoComplete="username"
            required
            autoFocus
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor={passwordId}>Parol</Label>
          <Input
            id={passwordId}
            name="password"
            type="password"
            autoComplete="current-password"
            required
          />
        </div>
      </div>

      <p
        id={errorId}
        role="alert"
        className="mt-3 min-h-10 text-sm text-destructive"
      >
        {error}
      </p>

      <div className="mt-2 flex flex-wrap items-center gap-4">
        <Button type="submit" size="lg" disabled={pending}>
          {pending ? 'Yoxlanılır…' : 'Daxil ol'}
        </Button>
        <Link
          to="/"
          className="rounded-sm text-sm font-medium text-petrol-soft underline-offset-4 outline-none hover:underline focus-visible:ring-3 focus-visible:ring-ring/50"
        >
          PIN ilə giriş
        </Link>
      </div>
    </form>
  )
}
