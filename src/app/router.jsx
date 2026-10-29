import { Navigate, createBrowserRouter } from 'react-router'
import { AccessGate } from '@/access/AccessGate'
import { AdminPortal } from '@/admin-portal/AdminPortal'
import { LandingPage } from '@/presentation/LandingPage'
import { PresentationRoute } from '@/presentation/PresentationShell'

const devRoutes = import.meta.env.DEV
  ? [
      {
        path: '/_dev/guest-kit',
        lazy: async () => ({
          Component: (await import('@/dev/GuestKitPreview')).GuestKitPreview,
        }),
      },
    ]
  : []

// The gate keeps the URL, so a direct slide link opens that slide right after the PIN.
export const router = createBrowserRouter([
  { path: '/admin', element: <AdminPortal /> },
  ...devRoutes,
  {
    element: <AccessGate />,
    children: [
      { path: '/', element: <LandingPage /> },
      { path: '/:deckId/:slideId?', element: <PresentationRoute /> },
    ],
  },
  { path: '*', element: <Navigate to="/" replace /> },
])
