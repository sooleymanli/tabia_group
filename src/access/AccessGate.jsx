import { useEffect } from 'react'
import { motion } from 'motion/react'
import { Outlet } from 'react-router'
import { TabiaMark } from '@/components/brand/TabiaLogo'
import { Button } from '@/components/ui/button'
import { BRAND } from '@/config/brand'
import { ACCESS, accessStore, useAccess } from './accessStore'
import { GateLayout, PinScreen } from './PinScreen'

const REVALIDATE_MS = 3 * 60 * 1000
const MAX_TIMEOUT_MS = 2 ** 31 - 1

// Brings the UI in line with the server when a PIN is revoked or expires mid-presentation.
function useAccessRevalidation(status, expiresAt) {
  useEffect(() => {
    if (status !== ACCESS.viewer && status !== ACCESS.admin) return
    const revalidate = () => {
      if (document.visibilityState === 'visible') {
        accessStore.getState().revalidate()
      }
    }
    const interval = setInterval(revalidate, REVALIDATE_MS)
    const untilExpiry = expiresAt ? Date.parse(expiresAt) - Date.now() : NaN
    const expiryTimer = Number.isFinite(untilExpiry)
      ? setTimeout(
          revalidate,
          Math.min(Math.max(untilExpiry, 0) + 1000, MAX_TIMEOUT_MS),
        )
      : null
    document.addEventListener('visibilitychange', revalidate)
    return () => {
      clearInterval(interval)
      clearTimeout(expiryTimer)
      document.removeEventListener('visibilitychange', revalidate)
    }
  }, [status, expiresAt])
}

export function AccessGate() {
  const status = useAccess((state) => state.status)
  const expiresAt = useAccess((state) => state.session?.expiresAt)

  useEffect(() => {
    accessStore.getState().check()
  }, [])
  useAccessRevalidation(status, expiresAt)

  switch (status) {
    case ACCESS.viewer:
    case ACCESS.admin:
      return <Outlet />
    case ACCESS.locked:
    case ACCESS.chooseVisibility:
      return <PinScreen />
    case ACCESS.unavailable:
      return (
        <GateMessage title="Təqdimat hazırda açılmır">
          {import.meta.env.DEV
            ? '.env.local faylında VITE_SUPABASE_URL və VITE_SUPABASE_PUBLISHABLE_KEY dəyərlərini yazın və dev serveri yenidən başladın.'
            : 'Giriş xidməti qoşulmayıb. Developer Team ilə əlaqə saxlayın.'}
        </GateMessage>
      )
    case ACCESS.error:
      return (
        <GateMessage
          title="Giriş yoxlanmadı"
          action={
            <Button size="lg" onClick={() => accessStore.getState().check()}>
              Yenidən yoxla
            </Button>
          }
        >
          Serverə qoşulmaq alınmadı. İnternet bağlantısını yoxlayıb yenidən cəhd
          edin.
        </GateMessage>
      )
    default:
      return <GateChecking />
  }
}

function GateChecking() {
  return (
    <div className="grid min-h-svh place-items-center bg-background">
      <title>{BRAND.productName}</title>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.3 }}
        className="text-petrol"
      >
        <TabiaMark label={null} className="size-12 motion-safe:animate-pulse" />
      </motion.div>
      <p className="sr-only" role="status">
        Giriş yoxlanılır
      </p>
    </div>
  )
}

function GateMessage({ title, action, children }) {
  return (
    <GateLayout>
      <h2 className="font-heading text-2xl font-medium text-ink">{title}</h2>
      <p className="mt-3 text-muted-foreground">{children}</p>
      {action && <div className="mt-8">{action}</div>}
    </GateLayout>
  )
}
