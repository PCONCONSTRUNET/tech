import { getSettings } from '@/actions/settings'
import { getTemplates } from '@/actions/whatsapp-templates'
import IntegrationsClient from './IntegrationsClient'

export const dynamic = 'force-dynamic'

export default async function IntegrationsPage() {
  const settings = await getSettings()
  const templatesReq = await getTemplates()
  const templates = templatesReq.data || []
  
  return <IntegrationsClient initialSettings={settings?.data} initialTemplates={templates} />
}
