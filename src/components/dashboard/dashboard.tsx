import { useAccount } from 'wagmi'
import { useEffect, useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Skeleton } from '@/components/ui/skeleton'
import { WalletIcon, Coins, Sparkles, Activity, ArrowRight } from 'lucide-react'
import { SEASONS, ADDRESS } from '@/contracts/addresses'
import { checkOGBadge, checkSeasonBadge, getEthBalance, getWethBalance, getTransactionCount, getNftBalance, checkAllBadges } from '@/lib/soneium'
import { useApp, useActions } from '@/hooks/use-store'
import type { Address as ViemAddr } from 'viem'

function StatsCard({ icon, label, value, sub }: { icon: React.ReactNode; label: string; value: string; sub?: string }) {
  return (
    <Card className="bg-zinc-900/50 border-zinc-800/50 hover:border-emerald-500/20 transition-colors">
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-[11px] uppercase tracking-wider text-zinc-500 font-medium">{label}</p>
            <p className="text-2xl font-bold text-zinc-100 mt-1">{value}</p>
            {sub && <p className="text-xs text-zinc-500 mt-0.5">{sub}</p>}
          </div>
          <div className="w-9 h-9 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">{icon}</div>
        </div>
      </CardContent>
    </Card>
  )
}

function OGFeatured({ address, badges }: { address: ViemAddr; badges: Record<string, boolean> | null }) {
  const hasOG = badges?.OG ?? null
  const [eth, setEth] = useState('—')
  const [weth, setWeth] = useState('—')
  useEffect(() => {
    getEthBalance(address).then(b => setEth((Number(b) / 1e18).toFixed(4)))
    getWethBalance(address).then(b => setWeth((Number(b) / 1e18).toFixed(4)))
  }, [address])

  return (
    <Card className={`border transition-all duration-500 ${
      hasOG ? 'border-amber-500/30 bg-gradient-to-br from-amber-500/5 to-transparent' : 'border-zinc-800/50'
    }`}>
      <CardContent className="p-5 flex items-center gap-4">
        <div className={`w-12 h-12 rounded-full flex items-center justify-center text-xl transition-all ${
          hasOG
            ? 'bg-gradient-to-br from-amber-400 to-amber-600 shadow-[0_0_20px_rgba(245,158,11,0.3)]'
            : 'bg-zinc-800 border border-zinc-700'
        }`}>⭐</div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-sm text-zinc-100">OG Badge</span>
            {hasOG === null ? <Skeleton className="w-14 h-4 rounded" /> : hasOG
              ? <Badge variant="secondary" className="bg-amber-500/10 text-amber-400 border-amber-500/20 text-[10px]">VERIFIED</Badge>
              : <Badge variant="outline" className="text-zinc-500 text-[10px]">Not detected</Badge>
            }
          </div>
          <p className="text-xs text-zinc-500 mt-0.5">Soneium Mainnet Pioneer</p>
        </div>
        <div className="text-right text-xs font-mono text-zinc-400 whitespace-nowrap">
          <div>Ξ {eth}</div>
          <div className="text-zinc-600">WETH {weth}</div>
        </div>
      </CardContent>
    </Card>
  )
}

function SeasonBadges({ address, badges }: { address: ViemAddr; badges: Record<string, boolean> | null }) {
  const owned = badges ? Object.entries(badges).filter(([, v]) => v).filter(([k]) => k !== 'OG').length : 0
  const [totalTx, setTotalTx] = useState(0)

  useEffect(() => { getTransactionCount(address).then(setTotalTx) }, [address])

  return (
    <Card className="bg-zinc-900/50 border-zinc-800/50">
      <CardContent className="p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-zinc-100">Seasonal Badges</h3>
          <Badge variant="secondary" className="bg-zinc-800 text-zinc-400 text-[10px]">
            {owned} / {SEASONS.length} owned
          </Badge>
        </div>
        <div className="flex gap-2 overflow-x-auto pb-2">
          {SEASONS.map(s => {
            const has = badges?.[s.id] ?? null
            return (
              <div key={s.id} className="flex flex-col items-center gap-1.5 min-w-[80px]">
                <div className={`w-14 h-14 rounded-full flex items-center justify-center text-xl transition-all ${
                  has ? 'bg-gradient-to-br from-amber-500/20 to-amber-600/10 border-2 border-amber-500/40 shadow-[0_0_12px_rgba(245,158,11,0.15)]'
                    : 'bg-zinc-800/50 border border-zinc-700/50 opacity-40 grayscale'
                }`}>{s.emoji}</div>
                <span className={`text-[10px] font-medium ${has ? 'text-amber-400' : 'text-zinc-600'}`}>{s.id}</span>
                <span className={`text-[9px] ${has === null ? 'text-zinc-700' : has ? 'text-emerald-400' : 'text-zinc-700'}`}>
                  {has === null ? '...' : has ? 'OWNED' : 'MISSING'}
                </span>
              </div>
            )
          })}
          {SEASONS.filter(s => badges?.[s.id]).length === SEASONS.length && (
            <div className="flex items-center justify-center min-w-[80px]">
              <div className="text-center">
                <div className="text-lg">🏆</div>
                <span className="text-[8px] text-emerald-400">COMPLETE</span>
              </div>
            </div>
          )}
        </div>
        <div className="mt-4 grid grid-cols-2 gap-3 text-xs">
          <div className="bg-zinc-800/30 rounded-lg p-3">
            <span className="text-zinc-500">Wallet TXs</span>
            <p className="text-lg font-bold text-zinc-100">{totalTx}</p>
          </div>
          <div className="bg-zinc-800/30 rounded-lg p-3">
            <span className="text-zinc-500">NFTs Minted</span>
            <p className="text-lg font-bold text-zinc-100">—</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export function Dashboard() {
  const { address, isConnected } = useAccount()
  const { st } = useApp()
  const { setNft } = useActions()
  const [inputAddr, setInputAddr] = useState('')
  const [viewAddr, setViewAddr] = useState<ViemAddr | null>(null)
  const [badges, setBadges] = useState<Record<string, boolean> | null>(null)

  const targetAddr = address || viewAddr

  useEffect(() => {
    if (!targetAddr) { setBadges(null); return }
    let cancelled = false
    checkAllBadges(targetAddr).then(r => { if (!cancelled) setBadges(r) })
    getNftBalance(targetAddr).then(n => { if (!cancelled) setNft(n) })
    return () => { cancelled = true }
  }, [targetAddr, setNft])

  // XP
  const xp = st.countTx * 10
  const tiers = [
    { name: 'Bronze', min: 0, next: 100, cap: '🌱' },
    { name: 'Silver', min: 100, next: 300, cap: '🌿' },
    { name: 'Gold', min: 300, next: 600, cap: '🌾' },
    { name: 'Platinum', min: 600, next: Infinity, cap: '👑' },
  ]
  let currentTier = tiers[0], nextTier = tiers[1]
  for (let i = 0; i < tiers.length; i++) {
    if (xp >= tiers[i].min) currentTier = tiers[i]
    if (xp < (tiers[i].next || Infinity)) { nextTier = tiers[i]; break }
  }
  const progress = Math.min(100, ((xp - currentTier.min) / ((nextTier.next || Infinity) - currentTier.min)) * 100)
  const levelNames = ['Bronze III','Bronze II','Bronze I','Silver III','Silver II','Silver I','Gold III','Gold II','Gold I','Platinum']
  const level = levelNames[Math.min(levelNames.length - 1, Math.floor(xp / 60))]

  return (
    <div className="p-6 lg:p-8 space-y-6 max-w-6xl">
      {/* XP Bar */}
      <Card className="bg-zinc-900/50 border-zinc-800/50">
        <CardContent className="p-5">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-zinc-100">Farmer Rank</span>
              <Badge variant="secondary" className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 text-[10px]">
                {currentTier.cap} {level}
              </Badge>
            </div>
            <span className="text-xs font-mono text-zinc-500">{xp} XP</span>
          </div>
          <Progress value={progress} className="h-2 bg-zinc-800 [&>div]:bg-gradient-to-r [&>div]:from-emerald-500 [&>div]:to-teal-400" />
          <div className="flex justify-between mt-1.5 text-[10px] text-zinc-600">
            {tiers.map(t => <span key={t.name} className={xp >= t.min ? 'text-emerald-400' : ''}>{t.cap} {t.name}</span>)}
          </div>
        </CardContent>
      </Card>

      {/* View mode */}
      {!isConnected && (
        <div className="flex gap-2">
          <input type="text" placeholder="0x... or ENS" value={inputAddr} onChange={e => setInputAddr(e.target.value)}
            className="flex-1 h-9 px-3 rounded-lg bg-zinc-900 border border-zinc-800 text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-emerald-500/50 font-mono" />
          <button onClick={() => inputAddr.length >= 42 && setViewAddr(inputAddr.toLowerCase() as ViemAddr)}
            className="h-9 px-4 rounded-lg bg-zinc-800 text-xs font-medium text-zinc-300 hover:bg-zinc-700 transition-colors">Inspect</button>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatsCard icon={<Activity size={18} />} label="Session TX" value={String(st.countTx)} sub="this session" />
        <StatsCard icon={<Coins size={18} />} label="Rank XP" value={String(xp)} sub={`toward ${nextTier.name}`} />
        <StatsCard icon={<Sparkles size={18} />} label="Badges" value={badges ? `${Object.values(badges).filter(Boolean).length}/7` : '...'} sub="S1-S6 + OG" />
        <StatsCard icon={<WalletIcon size={18} />} label="Connected" value={isConnected ? 'Yes' : 'No'} sub={targetAddr ? 'active' : '—'} />
      </div>

      {targetAddr && (
        <>
          <OGFeatured address={targetAddr} badges={badges} />
          <SeasonBadges address={targetAddr} badges={badges} />
        </>
      )}
      {!targetAddr && (
        <Card className="bg-zinc-900/30 border-dashed border-zinc-800">
          <CardContent className="p-12 text-center">
            <div className="text-4xl mb-3">🌾</div>
            <p className="text-zinc-400 text-sm">Connect a wallet or enter an address to view badge data</p>
          </CardContent>
        </Card>
      )}

      {/* Recent activity */}
      {st.txHistory.length > 0 && (
        <Card className="bg-zinc-900/50 border-zinc-800/50">
          <CardContent className="p-5">
            <h3 className="text-sm font-semibold text-zinc-100 mb-3">Recent Activity</h3>
            <div className="space-y-1">
              {st.txHistory.slice(0, 5).map((tx, i) => (
                <div key={i} className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-zinc-800/30 transition-colors text-xs">
                  <span className={`w-1.5 h-1.5 rounded-full ${tx.status === 'confirmed' ? 'bg-emerald-400' : tx.status === 'pending' ? 'bg-amber-400' : 'bg-red-400'}`} />
                  <span className="font-medium text-zinc-300 w-16">{tx.type}</span>
                  <a href={`https://soneium.blockscout.com/tx/${tx.hash}`} target="_blank" rel="noopener noreferrer"
                    className="font-mono text-zinc-500 hover:text-emerald-400 transition-colors">
                    {tx.hash.slice(0, 8)}...{tx.hash.slice(-4)}
                  </a>
                  <span className="text-zinc-600 ml-auto">{new Date(tx.time).toLocaleTimeString()}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
