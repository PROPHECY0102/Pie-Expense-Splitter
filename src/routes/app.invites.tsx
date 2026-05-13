import { createFileRoute } from '@tanstack/react-router'
import { InvitesPage } from '@/components/invites/InvitesPage'

export const Route = createFileRoute('/app/invites')({
  component: InvitesPage,
})
