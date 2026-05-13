import { Outlet, createFileRoute, redirect, useRouterState } from '@tanstack/react-router'
import { AnimatePresence, motion } from 'framer-motion'
import { AppHeader } from '@/components/layout/AppHeader'
import { useStore } from '@/store'

export const Route = createFileRoute('/app')({
  beforeLoad: () => {
    const { currentUserId } = useStore.getState()
    if (!currentUserId) {
      throw redirect({ to: '/login' })
    }
  },
  component: AppLayout,
})

function AppLayout() {
  const pathname = useRouterState({ select: (s) => s.location.pathname })
  return (
    <div className="min-h-screen flex flex-col">
      <AppHeader />
      <main className="flex-1">
        <div className="container py-6 md:py-10">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={pathname}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.22, ease: 'easeOut' }}
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  )
}
