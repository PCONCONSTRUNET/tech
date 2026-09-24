import { getSettings } from '@/actions/settings'
import { getTemplates } from '@/actions/whatsapp-templates'
import { getGateways } from '@/actions/gateways'
import IntegrationsClient from './IntegrationsClient'



export default async function IntegrationsPage() {
  const settings = await getSettings()
  const templatesReq = await getTemplates()
  const gatewaysReq = await getGateways()
  const templates = 'data' in templatesReq ? (templatesReq.data ?? []) : []
  const gateways = 'data' in gatewaysReq ? (gatewaysReq.data ?? []) : []
  
  return <IntegrationsClient initialSettings={settings} initialTemplates={templates} initialGateways={gateways} />
}
