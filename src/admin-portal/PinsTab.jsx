import { useId, useState } from 'react'
import { Check, Copy } from 'lucide-react'
import { accessStore } from '@/access/accessStore'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  adminCreatePin,
  adminSetPinActive,
} from '@/lib/supabase/presentationApi'
import { cn } from '@/lib/utils'
import { PIN_STATE_LABELS, formatDateTime, pinState } from './adminFormat'

const CREATE_ERRORS = {
  expires_in_past: 'Bitmə vaxtı gələcəkdə olmalıdır.',
  no_free_pin: 'Boş PIN tapılmadı. Köhnə PIN-ləri deaktiv edin.',
}

export function PinsTab({ pins, onChanged }) {
  const [created, setCreated] = useState(null)

  return (
    <div className="grid gap-12">
      <section aria-labelledby="pin-create">
        <h2 id="pin-create" className="font-heading text-lg font-medium">
          Yeni PIN
        </h2>
        <p className="mt-1 max-w-[60ch] text-sm text-muted-foreground">
          Hər nümayəndəyə ayrıca PIN verin ki, rəylərin kimdən gəldiyi görünsün.
          PIN yalnız yaradılanda bir dəfə göstərilir.
        </p>
        <CreatePinForm
          onCreated={(result) => {
            setCreated(result)
            onChanged()
          }}
        />
        {created && (
          <CreatedPin result={created} onDismiss={() => setCreated(null)} />
        )}
      </section>

      <section aria-labelledby="pin-list">
        <h2 id="pin-list" className="font-heading text-lg font-medium">
          PIN-lər
        </h2>
        {pins.length === 0 ? (
          <p className="mt-4 text-muted-foreground">Hələ PIN yoxdur.</p>
        ) : (
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead className="border-b text-xs text-muted-foreground">
                <tr>
                  <th className="py-2 pr-4 font-medium">Etiket</th>
                  <th className="py-2 pr-4 font-medium">Status</th>
                  <th className="py-2 pr-4 text-right font-medium">Sessiya</th>
                  <th className="py-2 pr-4 text-right font-medium">Baxış</th>
                  <th className="py-2 pr-4 text-right font-medium">Rəy</th>
                  <th className="py-2 pr-4 font-medium">Son giriş</th>
                  <th className="py-2 pr-4 font-medium">Bitmə</th>
                  <th className="py-2 font-medium">
                    <span className="sr-only">Əməliyyat</span>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {pins.map((pin) => (
                  <PinRow key={pin.id} pin={pin} onChanged={onChanged} />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  )
}

function CreatePinForm({ onCreated }) {
  const [error, setError] = useState(null)
  const [pending, setPending] = useState(false)
  const labelId = useId()
  const noteId = useId()
  const expiresId = useId()

  const submit = async (event) => {
    event.preventDefault()
    const form = event.currentTarget
    const values = new FormData(form)
    const label = String(values.get('label')).trim()
    if (!label) {
      setError('Etiket yazın, məsələn nümayəndənin adı.')
      return
    }
    const expires = String(values.get('expires'))
    setPending(true)
    setError(null)
    try {
      const result = await adminCreatePin({
        label,
        note: String(values.get('note')).trim() || null,
        // End of the chosen day in local time.
        expiresAt: expires
          ? new Date(`${expires}T23:59:59`).toISOString()
          : null,
      })
      form.reset()
      onCreated({ ...result, label })
    } catch (failure) {
      setError(
        CREATE_ERRORS[failure?.code] ?? 'PIN yaradılmadı. Yenidən cəhd edin.',
      )
      accessStore.getState().handleApiError(failure)
    } finally {
      setPending(false)
    }
  }

  return (
    <form
      onSubmit={submit}
      noValidate
      className="mt-5 grid max-w-3xl gap-4 md:grid-cols-[2fr_2fr_1fr_auto] md:items-end"
    >
      <div className="grid gap-1.5">
        <Label htmlFor={labelId}>Etiket</Label>
        <Input
          id={labelId}
          name="label"
          maxLength={120}
          placeholder="Məsələn, Tabia — Elvin bəy"
          required
        />
      </div>
      <div className="grid gap-1.5">
        <Label htmlFor={noteId}>Qeyd (istəyə bağlı)</Label>
        <Input id={noteId} name="note" maxLength={500} />
      </div>
      <div className="grid gap-1.5">
        <Label htmlFor={expiresId}>Bitmə tarixi</Label>
        <Input id={expiresId} name="expires" type="date" />
      </div>
      <Button type="submit" disabled={pending}>
        {pending ? 'Yaradılır…' : 'PIN yarat'}
      </Button>
      {error && (
        <p role="alert" className="text-sm text-destructive md:col-span-4">
          {error}
        </p>
      )}
    </form>
  )
}

function CreatedPin({ result, onDismiss }) {
  const [copied, setCopied] = useState(false)

  return (
    <div
      role="status"
      className="mt-6 flex max-w-3xl flex-wrap items-center gap-x-6 gap-y-3 rounded-xl border border-petrol/30 bg-secondary px-5 py-4"
    >
      <div>
        <p className="text-sm text-muted-foreground">{result.label}</p>
        <p className="font-heading text-4xl font-medium tracking-[0.3em] text-petrol tabular-nums">
          {result.pin}
        </p>
      </div>
      <p className="max-w-[36ch] text-sm text-muted-foreground">
        Bu PIN-i indi kopyalayın: səhifə yeniləndikdən sonra yenidən
        göstərilmir.
      </p>
      <div className="ml-auto flex gap-2">
        <Button
          variant="outline"
          onClick={async () => {
            try {
              await navigator.clipboard.writeText(result.pin)
              setCopied(true)
            } catch {
              setCopied(false)
            }
          }}
        >
          {copied ? (
            <Check data-icon="inline-start" />
          ) : (
            <Copy data-icon="inline-start" />
          )}
          {copied ? 'Kopyalandı' : 'Kopyala'}
        </Button>
        <Button variant="ghost" onClick={onDismiss}>
          Bağla
        </Button>
      </div>
    </div>
  )
}

function PinRow({ pin, onChanged }) {
  const [pending, setPending] = useState(false)
  const [failed, setFailed] = useState(false)
  const state = pinState(pin)

  const toggle = async () => {
    setPending(true)
    setFailed(false)
    try {
      await adminSetPinActive(pin.id, !pin.is_active)
      onChanged()
    } catch (error) {
      setFailed(true)
      accessStore.getState().handleApiError(error)
    } finally {
      setPending(false)
    }
  }

  return (
    <tr className={cn(state !== 'active' && 'text-muted-foreground')}>
      <td className="py-3 pr-4 font-medium text-ink">{pin.label}</td>
      <td className="py-3 pr-4">
        <Badge variant={state === 'active' ? 'secondary' : 'outline'}>
          {PIN_STATE_LABELS[state]}
        </Badge>
      </td>
      <td className="py-3 pr-4 text-right tabular-nums">{pin.sessions}</td>
      <td className="py-3 pr-4 text-right tabular-nums">{pin.slide_views}</td>
      <td className="py-3 pr-4 text-right tabular-nums">{pin.comments}</td>
      <td className="py-3 pr-4 tabular-nums">
        {formatDateTime(pin.last_seen_at)}
      </td>
      <td className="py-3 pr-4 tabular-nums">
        {pin.expires_at ? formatDateTime(pin.expires_at) : 'Müddətsiz'}
      </td>
      <td className="py-3 text-right">
        <Button
          variant={pin.is_active ? 'outline' : 'secondary'}
          size="sm"
          disabled={pending}
          onClick={toggle}
        >
          {pin.is_active ? 'Deaktiv et' : 'Aktiv et'}
        </Button>
        {failed && (
          <p role="alert" className="mt-1 text-xs text-destructive">
            {pin.is_active
              ? 'Saxlanmadı.'
              : 'Aktiv edilmədi: eyni kodlu başqa aktiv PIN ola bilər.'}
          </p>
        )}
      </td>
    </tr>
  )
}
