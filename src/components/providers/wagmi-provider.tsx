'use client'

import '@rainbow-me/rainbowkit/styles.css'
import { WagmiProvider as WagmiBase, createConfig, http } from 'wagmi'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { RainbowKitProvider, darkTheme } from '@rainbow-me/rainbowkit'
import type { ReactNode } from 'react'
import { CHAIN } from '@/contracts/addresses'

const config = createConfig({
  chains: [CHAIN],
  transports: { [CHAIN.id]: http() },
})

const qc = new QueryClient()

export function WagmiProvider({ children }: { children: ReactNode }) {
  return (
    <WagmiBase config={config}>
      <QueryClientProvider client={qc}>
        <RainbowKitProvider
          coolMode
          theme={darkTheme({
            accentColor: '#10b981',
            accentColorForeground: '#022c22',
            borderRadius: 'medium',
            fontStack: 'system',
          })}
        >
          {children}
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiBase>
  )
}

export { config }
