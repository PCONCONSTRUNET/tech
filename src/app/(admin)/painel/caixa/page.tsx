export const dynamic = 'force-dynamic';
import { getOpenSession, getClosedSessions } from '@/actions/caixa'
import CaixaClient from './CaixaClient'

export default async function CaixaPage() {
  const [openSession, closedSessions] = await Promise.all([
    getOpenSession(),
    getClosedSessions(),
  ])
  return <CaixaClient openSession={openSession} closedSessions={closedSessions} />
}

