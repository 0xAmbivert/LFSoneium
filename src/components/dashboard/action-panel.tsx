import { useAccount } from 'wagmi'
import { toast } from 'sonner'
import { useState, useCallback, useRef, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Play, Square, Loader2 } from 'lucide-react'
import { useApp, useActions } from '@/hooks/use-store'
import {
  pokeTx, mintTx, wrapTx, unwrapTx, swapTx, heartbeatTx,
  getGasPrice, truncate,
} from '@/lib/soneium'

interface ActionDef {
  id: string; label: string; desc: string; icon: string; run: () => Promise<`0x${string}`>
}

const ACTIONS: ActionDef[] = [
  { id: 'poke', label: 'Poke', desc: 'Ping ecosystem', icon: '🧪', run: pokeTx },
  { id: 'mint', label: 'Mint NFT', desc: 'Seasonal mint', icon: '✨', run: mintTx },
  { id: 'wrap', label: 'Wrap', desc: 'ETH → WETH', icon: '📥', run: wrapTx },
  { id: 'unwrap', label: 'Unwrap', desc: 'WETH → ETH', icon: '📤', run: unwrapTx },
  { id: 'swap', label: 'Swap', desc: 'Uniswap V4', icon: '🦄', run: swapTx },
  { id: 'heartbeat', label: 'Heartbeat', desc: '0 ETH ping', icon: '💓', run: heartbeatTx },
]

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
    toast.info('Loop started')
  }, [st.isLooping, isConnected, setLoop])

  const doAction = useCallback(async (id: string) => {
    const act = ACTIONS.find(a => a.id === id)
    if (act) await executeAction(act)
  }, [executeAction])

  // Loop runner
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
    <div className="p-6 lg:p-8 space-y-6 max-w-6xl">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-zinc-100">Actions</h2>
          <p className="text-xs text-zinc-500 mt-1">Execute on-chain operations</p>
        </div>
        <Badge variant="outline" className="font-mono text-emerald-400 border-emerald-500/20 text-xs gap-1.5">
          <span className={`w-1.5 h-1.5 rounded-full ${gweiNum < 15 ? 'bg-emerald-400' : gweiNum < 40 ? 'bg-amber-400' : 'bg-red-400'}`} />
          {gasGwei} gwei
        </Badge>
      </div>

      <Card className="bg-zinc-900/50 border-zinc-800/50">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs text-zinc-400">Session Count</span>
            <span className="text-xs font-mono text-zinc-500">{st.countTx} TX</span>
          </div>
          <Progress value={Math.min(100, (st.countTx % 10) * 10)} className="h-1.5 bg-zinc-800 [&>div]:bg-emerald-500" />
        </CardContent>
      </Card>

      {/* Action Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-2">
        {ACTIONS.map(act => (
          <button key={act.id} disabled={!isConnected || busy === act.id}
            onClick={() => executeAction(act)}
            className="flex items-center gap-3 p-4 rounded-xl bg-zinc-900/50 border border-zinc-800/50 hover:border-emerald-500/20 hover:bg-zinc-900 transition-all disabled:opacity-30 disabled:cursor-not-allowed text-left group">
            <div className="w-10 h-10 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-lg group-hover:scale-110 transition-transform">
              {busy === act.id ? <Loader2 size={18} className="animate-spin text-emerald-400" /> : act.icon}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium text-zinc-200">{act.label}</div>
              <div className="text-[10px] text-zinc-500">{act.desc}</div>
            </div>
          </button>
        ))}
      </div>

      {/* Loop */}
      <Card className="bg-zinc-900/50 border-zinc-800/50">
        <CardContent className="p-5">
          <div className="flex items-center gap-4">
            <Button size="lg" onClick={toggleLoop}
              className={`gap-2 min-w-[140px] ${
                st.isLooping
                  ? 'bg-red-500/20 text-red-400 border border-red-500/30 hover:bg-red-500/30'
                  : 'bg-emerald-500 hover:bg-emerald-600 text-black font-semibold'
              }`}>
              {st.isLooping ? <Square size={16} /> : <Play size={16} />}
              {st.isLooping ? 'Stop Loop' : 'Start Loop'}
            </Button>
            <div className="flex gap-4 text-xs font-mono text-zinc-500">
              <span>TX: <span className="text-zinc-300">{st.countTx}</span></span>
              <span>Loop: <span className={st.isLooping ? 'text-emerald-400' : 'text-zinc-600'}>{st.isLooping ? 'Active' : 'Idle'}</span></span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
