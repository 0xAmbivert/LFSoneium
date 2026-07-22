import { AppProvider } from '@/hooks/use-store'
import { WagmiProvider } from '@/components/providers/wagmi-provider'
import { AppLayout } from '@/components/layout/app-layout'
import { Toaster } from 'sonner'

export default function App() {
  return (
    <WagmiProvider>
      <AppProvider>
        <AppLayout />
        <Toaster position="bottom-right" richColors closeButton />
      </AppProvider>
    </WagmiProvider>
  )
}
