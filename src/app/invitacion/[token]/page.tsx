import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getInvitationByToken } from '@/actions/invitations.actions'
import AcceptClient from './AcceptClient'

export default async function InvitationPage({
  params,
}: {
  params: Promise<{ token: string }>
}) {
  const { token } = await params
  const [result, session] = await Promise.all([
    getInvitationByToken(token),
    getServerSession(authOptions),
  ])

  return (
    <AcceptClient
      token={token}
      state={result.state}
      invitation={result.invitation ?? null}
      hasSession={!!session?.user}
    />
  )
}
