import { useConnect, useDisconnect } from 'wagmi'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { useState, type ReactNode } from 'react'
import { Wallet, Plug } from 'lucide-react'

const WALLET_INFO: Record<string, { name: string; icon: string }> = {
  metaMask: { name: 'MetaMask', icon: '🦊' },
  rabby: { name: 'Rabby', icon: '🐰' },
  okxWallet: { name: 'OKX Wallet', icon: '◎' },
  trustWallet: { name: 'Trust Wallet', icon: '🛡️' },
  coinbaseWallet: { name: 'Coinbase Wallet', icon: '🔵' },
  injected: { name: 'Browser Wallet', icon: '🔗' },
}

export function ConnectDialog({ children, onDone }: { children: ReactNode; onDone?: () => void }) {
  const { connect, connectors, isPending } = useConnect()
  const [open, setOpen] = useState(false)

  const handleConnect = (connector: (typeof connectors)[number]) => {
    connect({ connector }, {
      onSuccess() {
        setOpen(false)
        onDone?.()
      },
    })
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-sm bg-zinc-900 border-zinc-800">
        <DialogHeader>
          <DialogTitle className="text-zinc-100 flex items-center gap-2">
            <Wallet size={18} /> Connect Wallet
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-2 py-2">
          {connectors
            .filter(c => c.name !== 'Injected' || !connectors.find(o => o.name !== 'Injected' && o.type === 'injected'))
            .map(c => {
              const info = WALLET_INFO[c.id] || WALLET_INFO[c.type] || { name: c.name, icon: '🔗' }
              return (
                <Button
                  key={c.id}
                  variant="outline"
                  disabled={!c.ready || isPending}
                  onClick={() => handleConnect(c)}
                  className="w-full justify-start gap-3 h-12 text-zinc-200 border-zinc-700 hover:bg-zinc-800 hover:text-zinc-100"
                >
                  <span className="text-xl">{info.icon}</span>
                  <span className="flex-1 text-left">{info.name}</span>
                  {!c.ready && <span className="text-[10px] text-zinc-600">not detected</span>}
                  {c.name === 'Injected' && <span className="text-[10px] text-zinc-500">other</span>}
                </Button>
              )
            })}
        </div>
        <p className="text-[10px] text-zinc-600 text-center">
          Multiple wallet extensions detected? Pick one.
        </p>
      </DialogContent>
    </Dialog>
  )
}
