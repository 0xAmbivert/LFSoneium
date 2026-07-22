import { useAccount } from 'wagmi'
import { ConnectButton } from '@rainbow-me/rainbowkit'
import { useApp } from '@/hooks/use-store'
import { Copy, Zap, BadgeCheck, Gauge, ListTodo } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { truncate, getGasPrice } from '@/lib/soneium'
import { useEffect, useState, useCallback } from 'react'
import { toast } from 'sonner'
import { Dashboard } from '@/components/dashboard/dashboard'
import { BadgeGallery } from '@/components/dashboard/badge-gallery'
import { ActionPanel } from '@/components/dashboard/action-panel'
import { ActivityFeed } from '@/components/dashboard/activity-feed'

export function AppLayout() {
  const { address, isConnected } = useAccount()
  const { st } = useApp()
  const [gasGwei, setGas] = useState<string>('—')
  const [activeTab, setActiveTab] = useState('dashboard')

  useEffect(() => {
    updateGas()
    const int = setInterval(updateGas, 15000)
    return () => clearInterval(int)
  }, [])

  const updateGas = useCallback(async () => {
    try { setGas((parseFloat((await getGasPrice()).toString()) / 1e9).toFixed(1)) } catch (_) {}
  }, [])

  const handleCopy = () => {
    if (address) { navigator.clipboard.writeText(address); toast.success('Copied!') }
  }

  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: Gauge },
    { id: 'badges', label: 'Badges', icon: BadgeCheck },
    { id: 'actions', label: 'Actions', icon: Zap },
    { id: 'activity', label: 'Activity', icon: ListTodo },
  ]

  const gweiNum = parseFloat(gasGwei)
  const gasColor = gweiNum < 15 ? 'bg-emerald-400' : gweiNum < 40 ? 'bg-amber-400' : 'bg-red-400'

  return (
    <div className="flex min-h-screen bg-[#0a0a0f]">
      {/* Sidebar */}
      <aside className="w-60 border-r border-zinc-800/50 bg-[#0d0d14] flex flex-col shrink-0">
        <div className="px-5 py-6 border-b border-zinc-800/50">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-lg">🌾</div>
            <div>
              <div className="font-bold text-sm text-zinc-100">LFSoneium</div>
              <div className="text-[10px] uppercase tracking-widest text-emerald-400/70">Dashboard</div>
            </div>
          </div>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1">
          {tabs.map(t => {
            const Icon = t.icon
            return (
              <button key={t.id} onClick={() => setActiveTab(t.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  activeTab === t.id ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/30'
                }`}>
                <Icon size={16} /> {t.label}
                {t.id === 'badges' && <Badge variant="secondary" className="ml-auto text-[10px] h-4 px-1.5 bg-zinc-800 text-zinc-400">12</Badge>}
              </button>
            )
          })}
        </nav>

        {/* RainbowKit ConnectButton in sidebar */}
        <div className="px-3 py-4 border-t border-zinc-800/50">
          {isConnected && address ? (
            <div className="space-y-2">
              <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-emerald-500/5 border border-emerald-500/10 cursor-pointer" onClick={handleCopy}>
                <div className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.5)]" />
                <span className="text-xs font-mono text-zinc-300 flex-1 truncate">{truncate(address)}</span>
                <Copy size={14} className="text-zinc-500 hover:text-zinc-300 transition-colors" />
              </div>
              <ConnectButton.Custom>
                {({ openAccountModal, openChainModal }) => (
                  <div className="flex gap-1">
                    <button onClick={openChainModal} className="flex-1 text-[10px] py-1.5 rounded bg-zinc-800 text-zinc-400 hover:text-zinc-200 transition-colors">Network</button>
                    <button onClick={openAccountModal} className="flex-1 text-[10px] py-1.5 rounded bg-zinc-800 text-zinc-400 hover:text-zinc-200 transition-colors">Account</button>
                  </div>
                )}
              </ConnectButton.Custom>
            </div>
          ) : (
            <ConnectButton.Custom>
              {({ openConnectModal }) => (
                <button onClick={openConnectModal}
                  className="w-full py-2 px-3 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-black text-sm font-semibold transition-colors">
                  Connect Wallet
                </button>
              )}
            </ConnectButton.Custom>
          )}
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 overflow-auto">
        <header className="sticky top-0 z-10 border-b border-zinc-800/50 bg-[#0a0a0f]/80 backdrop-blur-xl">
          <div className="flex items-center justify-between px-8 py-3">
            <div>
              <h1 className="text-lg font-bold text-zinc-100 capitalize">{activeTab}</h1>
              <p className="text-xs text-zinc-500">Soneium Mainnet</p>
            </div>
            <div className="flex items-center gap-3">
              <Badge variant="outline" className="text-emerald-400 border-emerald-500/20 bg-emerald-500/5 font-mono text-xs gap-1.5">
                <span className={`w-1.5 h-1.5 rounded-full ${gasColor} shadow-[0_0_4px]`} />
                {gasGwei} gwei
              </Badge>
              <div className="w-6 h-6 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-[10px] font-bold text-black">
                {st.countTx}
              </div>
            </div>
          </div>
        </header>
        <PageContent activeTab={activeTab} />
      </main>
    </div>
  )
}

function PageContent({ activeTab }: { activeTab: string }) {
  switch (activeTab) {
    case 'dashboard': return <Dashboard />
    case 'badges': return <BadgeGallery />
    case 'actions': return <ActionPanel />
    case 'activity': return <ActivityFeed />
    default: return <Dashboard />
  }
}
