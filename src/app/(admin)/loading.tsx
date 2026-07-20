import LegoLoader from '@/components/LegoLoader';

export default function Loading() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', minHeight: '60vh' }}>
      <LegoLoader />
      <p style={{ marginTop: '32px', color: 'var(--color-text-muted)', fontWeight: '500' }}>Carregando dados...</p>
    </div>
  );
}
