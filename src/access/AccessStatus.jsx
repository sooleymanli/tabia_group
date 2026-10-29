import { useState } from 'react'
import { LogOut } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { ACCESS, accessStore, useAccess } from './accessStore'

export function AccessStatus({ className }) {
  const status = useAccess((state) => state.status)
  const [pending, setPending] = useState(false)

  if (status !== ACCESS.viewer && status !== ACCESS.admin) return null

  const signOut = async () => {
    setPending(true)
    await accessStore.getState().signOut()
  }

  return (
    <div className={cn('flex items-center gap-1', className)}>
      {status === ACCESS.admin && (
        <Badge
          variant="secondary"
          className="mr-1"
          title="Bu baxış statistikaya daxil edilmir"
        >
          Admin önizləməsi
        </Badge>
      )}
      <Button
        variant="ghost"
        size="icon"
        onClick={signOut}
        disabled={pending}
        aria-label="Çıxış"
        title="Çıxış"
      >
        <LogOut />
      </Button>
    </div>
  )
}
