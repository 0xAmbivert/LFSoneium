import { useAccount } from 'wagmi'
import { ConnectButton } from '@rainbow-me/rainbowkit'
import { useApp } from '@/hooks/use-store'
import { Copy, Zap, BadgeCheck, Gauge, ListTodo, Menu, X, ChevronRight, Hexagon } from 'lucide-react'
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
  const [mobileOpen, setMobileOpen] = useState(false)

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

  return (
    <div className="flex min-h-screen bg-[#020205] relative">
      {/* Ambient glow orbs */}
      <div className="glow-orb glow-orb--1" />
      <div className="glow-orb glow-orb--2" />
      <div className="glow-orb glow-orb--3" />

      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden" onClick={() => setMobileOpen(false)} />
      )}

      {/* ── Sidebar ── */}
      <aside className={`
        fixed lg:sticky top-0 left-0 z-50 h-screen
        w-64 lg:w-56 xl:w-60
        bg-[#020208]/95 backdrop-blur-2xl
        border-r border-white/[0.04]
        flex flex-col shrink-0
        transition-transform duration-300
        ${mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        {/* Brand */}
        <div className="px-5 py-6 border-b border-white/[0.04]">
          <div className="flex items-center gap-3">
            <div className="relative w-9 h-9">
              <div className="absolute inset-0 rounded-xl bg-emerald-500/10 border border-emerald-500/20" />
              <div className="relative w-full h-full flex items-center justify-center">
                <Hexagon size={20} className="text-emerald-400" />
              </div>
            </div>
            <div>
              <div className="font-bold text-sm text-zinc-100">LFSoneium</div>
              <div className="text-[10px] uppercase tracking-[0.15em] text-emerald-400/60 font-medium">Dashboard</div>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-5 space-y-1">
          {tabs.map(t => {
            const Icon = t.icon
            const isActive = activeTab === t.id
            return (
              <button key={t.id} onClick={() => { setActiveTab(t.id); setMobileOpen(false) }}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group relative ${
                  isActive
                    ? 'text-emerald-300 bg-emerald-500/[0.07] border border-emerald-500/10'
                    : 'text-zinc-500 hover:text-zinc-200 hover:bg-white/[0.03]'
                }`}>
                {isActive && (
                  <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.5)]" />
                )}
                <Icon size={16} className={isActive ? 'text-emerald-400' : ''} />
                <span>{t.label}</span>
                {t.id === 'badges' && (
                  <Badge variant="secondary" className="ml-auto text-[9px] h-4 px-1.5 bg-white/[0.04] text-zinc-500 border-0">12</Badge>
                )}
                <ChevronRight size={14} className={`ml-auto transition-all duration-200 ${
                  isActive ? 'opacity-100 text-emerald-400/40' : 'opacity-0 group-hover:opacity-40 text-zinc-600'
                }`} />
              </button>
            )
          })}
        </nav>

        {/* Wallet section */}
        <div className="px-3 py-4 border-t border-white/[0.04]">
          {isConnected && address ? (
            <div className="space-y-2">
              <div onClick={handleCopy}
                className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl glass glass-hover cursor-pointer transition-all duration-200">
                <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.6)]" />
                <span className="text-xs font-mono text-zinc-300 flex-1 truncate">{truncate(address)}</span>
                <Copy size={13} className="text-zinc-600 hover:text-zinc-300 transition-colors shrink-0" />
              </div>
              <ConnectButton.Custom>
                {({ openAccountModal, openChainModal }) => (
                  <div className="flex gap-1.5">
                    <button onClick={openChainModal}
                      className="flex-1 text-[10px] py-1.5 rounded-lg bg-white/[0.03] text-zinc-500 hover:text-zinc-300 hover:bg-white/[0.06] transition-all border border-white/[0.04]">
                      Network
                    </button>
                    <button onClick={openAccountModal}
                      className="flex-1 text-[10px] py-1.5 rounded-lg bg-white/[0.03] text-zinc-500 hover:text-zinc-300 hover:bg-white/[0.06] transition-all border border-white/[0.04]">
                      Account
                    </button>
                  </div>
                )}
              </ConnectButton.Custom>
            </div>
          ) : (
            <ConnectButton.Custom>
              {({ openConnectModal }) => (
                <button onClick={openConnectModal}
                  className="group relative w-full overflow-hidden rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black text-sm font-semibold transition-all duration-200 py-2.5 px-3">
                  <span className="relative z-10">Connect Wallet</span>
                  <div className="absolute inset-0 bg-gradient-to-r from-emerald-400 to-emerald-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </button>
              )}
            </ConnectButton.Custom>
          )}
        </div>
      </aside>

      {/* ── Main ── */}
      <main className="flex-1 overflow-auto relative z-10 min-h-screen">
        {/* Top bar */}
        <header className="sticky top-0 z-30 border-b border-white/[0.04] bg-[#020205]/80 backdrop-blur-2xl">
          <div className="flex items-center justify-between px-4 lg:px-8 py-3">
            <div className="flex items-center gap-3">
              {/* Mobile hamburger */}
              <button onClick={() => setMobileOpen(true)}
                className="lg:hidden w-8 h-8 rounded-lg glass flex items-center justify-center text-zinc-400 hover:text-zinc-200">
                <Menu size={16} />
              </button>
              <div>
                <h1 className="text-sm lg:text-base font-bold text-zinc-100 capitalize">{activeTab}</h1>
                <p className="text-[10px] text-zinc-600 font-medium tracking-wide">Soneium Mainnet</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Badge variant="outline" className="glass text-emerald-400 border-emerald-500/10 font-mono text-[11px] gap-1.5 px-3 py-1">
                <span className={`w-1.5 h-1.5 rounded-full ${
                  gweiNum < 15 ? 'bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.5)]' :
                  gweiNum < 40 ? 'bg-amber-400 shadow-[0_0_6px_rgba(245,158,11,0.5)]' :
                  'bg-red-400 shadow-[0_0_6px_rgba(239,68,68,0.5)]'
                }`} />
                {gasGwei}
              </Badge>
              <div className="w-7 h-7 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                <span className="text-[10px] font-bold text-emerald-400">{st.countTx}</span>
              </div>
            </div>
          </div>
        </header>

        <PageContent activeTab={activeTab} />

        {/* Footer */}
        <footer className="px-4 lg:px-8 py-6 border-t border-white/[0.04] mt-8">
          <div className="flex items-center justify-between text-[10px] text-zinc-600">
            <span>LFSoneium — Soneium Farming Dashboard</span>
            <span>Chain ID: 1868</span>
          </div>
        </footer>
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
