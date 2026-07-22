import { useAccount } from 'wagmi'
import { toast } from 'sonner'
import { useState, useCallback, useRef, useEffect } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Play, Square, Loader2, Zap, Sparkles, ArrowRight, Activity, Hexagon, Droplets, Sword, Heart, ChevronRight } from 'lucide-react'
import { useApp, useActions } from '@/hooks/use-store'
import {
  pokeTx, mintTx, wrapTx, unwrapTx, swapTx, heartbeatTx,
  getGasPrice, truncate,
} from '@/lib/soneium'

interface ActionDef {
  id: string; label: string; desc: string; icon: React.ReactNode; run: () => Promise<`0x${string}`>
}

const ACTIONS: ActionDef[] = [
  { id: 'poke', label: 'Poke', desc: 'Ping ecosystem', icon: <Heart size={18} />, run: pokeTx },
  { id: 'mint', label: 'Mint NFT', desc: 'Seasonal mint', icon: <Sparkles size={18} />, run: mintTx },
  { id: 'wrap', label: 'Wrap ETH', desc: 'ETH → WETH', icon: <Droplets size={18} />, run: wrapTx },
  { id: 'unwrap', label: 'Unwrap', desc: 'WETH → ETH', icon: <Activity size={18} />, run: unwrapTx },
  { id: 'swap', label: 'Swap', desc: 'Uniswap V4', icon: <ArrowRight size={18} />, run: swapTx },
  { id: 'heartbeat', label: 'Heartbeat', desc: '0 ETH ping', icon: <Sword size={18} />, run: heartbeatTx },
]

function ActionCard({ act, busy, isConnected, onRun }: {
  act: ActionDef; busy: string | null; isConnected: boolean; onRun: (a: ActionDef) => void
}) {
  const isBusy = busy === act.id
  return (
    <button disabled={!isConnected || isBusy} onClick={() => onRun(act)}
      className="group relative overflow-hidden rounded-xl glass hover:bg-white/[0.05] border border-white/[0.06] hover:border-emerald-500/15 transition-all duration-300 disabled:opacity-20 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:border-white/[0.06] text-left p-4">
      {/* Hover glow */}
      <div className="absolute -inset-20 bg-emerald-500/5 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
      <div className="relative z-10 flex items-start gap-4">
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-300 group-hover:scale-110 ${
          isBusy
            ? 'bg-emerald-500/20 border border-emerald-500/30'
            : 'bg-emerald-500/8 border border-emerald-500/10 group-hover:border-emerald-500/25'
        }`}>
          {isBusy
            ? <Loader2 size={20} className="animate-spin text-emerald-400" />
            : <span className="text-emerald-400">{act.icon}</span>
          }
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-zinc-100 group-hover:text-emerald-300 transition-colors">{act.label}</span>
            <Zap size={10} className="text-emerald-500/40 group-hover:text-emerald-400/60 transition-colors" />
          </div>
          <span className="text-[10px] text-zinc-600 group-hover:text-zinc-500 transition-colors">{act.desc}</span>
        </div>
        <ChevronRight size={16} className="text-zinc-700 group-hover:text-emerald-400/50 group-hover:translate-x-0.5 transition-all" />
      </div>
    </button>
  )
}

export function ActionPanel() {
  const { isConnected } = useAccount()
  const { st } = useApp()
  const { incrTx, addTx, setLoop } = useActions()
  const [busy, setBusy] = useState<string | null>(null)
  const [gasGwei, setGas] = useState('—')
  const loopRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    const int = setInterval(async () => {
      try { setGas((parseFloat((await getGasPrice()).toString()) / 1e9).toFixed(1)) } catch (_) {}
    }, 10000)
    return () => clearInterval(int)
  }, [])

  const executeAction = useCallback(async (act: ActionDef) => {
    if (!isConnected) return toast.error('Connect wallet first')
    setBusy(act.id)
    try {
      const hash = await act.run()
      addTx(hash, act.label, 'confirmed')
      incrTx()
      toast.success(`${act.label} sent!`, { description: truncate(hash) })
    } catch (e: any) {
      if (e?.message?.includes('rejected') || e?.code === 4001) return
      toast.error(`${act.label} failed`, { description: e?.shortMessage || e?.message || 'Unknown' })
    } finally {
      setBusy(null)
    }
  }, [isConnected, incrTx, addTx])

  const toggleLoop = useCallback(() => {
    if (st.isLooping) {
      setLoop(false)
      if (loopRef.current) clearTimeout(loopRef.current)
      toast.info('Loop stopped')
      return
    }
    if (!isConnected) return toast.error('Connect wallet first')
    setLoop(true)
    toast.info('Loop started — random actions every 2-7s')
  }, [st.isLooping, isConnected, setLoop])

  const doAction = useCallback(async (id: string) => {
    const act = ACTIONS.find(a => a.id === id)
    if (act) await executeAction(act)
  }, [executeAction])

  useEffect(() => {
    if (!st.isLooping) return
    const names = ['poke', 'mint', 'wrap', 'swap', 'heartbeat']
    const tick = () => {
      if (!st.isLooping) return
      doAction(names[Math.floor(Math.random() * names.length)])
      loopRef.current = setTimeout(tick, Math.random() * 5000 + 2000)
    }
    loopRef.current = setTimeout(tick, 2000)
    return () => { if (loopRef.current) clearTimeout(loopRef.current) }
  }, [st.isLooping, doAction])

  const gweiNum = parseFloat(gasGwei)

  return (
    <div className="p-4 lg:p-8 space-y-5 max-w-6xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-zinc-100 flex items-center gap-2">
            <Zap size={18} className="text-emerald-400" />
            Actions
          </h2>
          <p className="text-xs text-zinc-600 mt-0.5">Execute on-chain operations</p>
        </div>
        <Badge variant="outline" className={`glass font-mono text-[11px] gap-1.5 px-3 py-1 ${
          gweiNum < 15 ? 'text-emerald-400 border-emerald-500/10' :
          gweiNum < 40 ? 'text-amber-400 border-amber-500/10' :
          'text-red-400 border-red-500/10'
        }`}>
          <span className={`w-1.5 h-1.5 rounded-full ${
            gweiNum < 15 ? 'bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.5)]' :
            gweiNum < 40 ? 'bg-amber-400 shadow-[0_0_6px_rgba(245,158,11,0.5)]' :
            'bg-red-400 shadow-[0_0_6px_rgba(239,68,68,0.5)]'
          }`} />
          {gasGwei} gwei
        </Badge>
      </div>

      {/* Session count */}
      <div className="glass rounded-xl p-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Activity size={14} className="text-emerald-400" />
            <span className="text-xs text-zinc-400">Session Progress</span>
          </div>
          <span className="text-xs font-mono text-zinc-500">{st.countTx} TX</span>
        </div>
        <div className="h-2 rounded-full bg-white/[0.04] overflow-hidden">
          <div className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-500"
            style={{ width: `${Math.min(100, (st.countTx % 10) * 10)}%` }} />
        </div>
      </div>

      {/* Action Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {ACTIONS.map(act => (
          <ActionCard key={act.id} act={act} busy={busy} isConnected={isConnected} onRun={executeAction} />
        ))}
      </div>

      {/* Loop Control */}
      <div className="glass rounded-xl p-5">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <Button size="lg" onClick={toggleLoop}
            className={`gap-2 min-w-[140px] transition-all duration-300 ${
              st.isLooping
                ? 'bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20'
                : 'bg-emerald-500 hover:bg-emerald-400 text-black font-semibold'
            }`}>
            {st.isLooping ? <Square size={16} /> : <Play size={16} />}
            {st.isLooping ? 'Stop Loop' : 'Start Loop'}
          </Button>
          <div className="flex flex-wrap gap-4 text-xs font-mono text-zinc-500">
            <span>TX: <span className="text-zinc-300">{st.countTx}</span></span>
            <span>Loop: <span className={st.isLooping ? 'text-emerald-400' : 'text-zinc-600'}>{st.isLooping ? '● Active' : '○ Idle'}</span></span>
          </div>
        </div>
      </div>
    </div>
  )
}
