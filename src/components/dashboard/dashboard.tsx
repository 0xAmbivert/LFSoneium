import { useAccount } from 'wagmi'
import { useEffect, useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Activity, Coins, Sparkles, Wallet, ChevronRight, ExternalLink, Hexagon, Zap } from 'lucide-react'
import { SEASONS } from '@/contracts/addresses'
import { getEthBalance, getWethBalance, getTransactionCount, getNftBalance, checkAllBadges } from '@/lib/soneium'
import { useApp, useActions } from '@/hooks/use-store'
import type { Address as ViemAddr } from 'viem'

/* ── Stat Card ── */
function StatCard({ icon, label, value, sub, accent }: {
  icon: React.ReactNode; label: string; value: string; sub?: string; accent?: string
}) {
  return (
    <div className="glass rounded-xl p-4 group hover:bg-white/[0.05] transition-all duration-300">
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-[10px] uppercase tracking-[0.12em] text-zinc-500 font-medium">{label}</p>
          <p className="text-xl font-bold text-zinc-100">{value}</p>
          {sub && <p className="text-[10px] text-zinc-600">{sub}</p>}
        </div>
        <div className={`w-9 h-9 rounded-lg flex items-center justify-center transition-all duration-300 group-hover:scale-110 ${
          accent === 'amber'
            ? 'bg-amber-500/10 border border-amber-500/20 text-amber-400'
            : accent === 'emerald'
            ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400'
            : 'bg-white/[0.04] border border-white/[0.06] text-zinc-400'
        }`}>{icon}</div>
      </div>
    </div>
  )
}

/* ── XP Ring ── */
function XpRing({ xp, level, tier, progress }: { xp: number; level: string; tier: string; progress: number }) {
  const r = 56; const circ = 2 * Math.PI * r
  return (
    <div className="glass rounded-xl p-5 flex items-center gap-5">
      <div className="relative shrink-0">
        <svg width="128" height="128" className="xp-ring">
          <defs>
            <linearGradient id="xp-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#10b981" />
              <stop offset="50%" stopColor="#34d399" />
              <stop offset="100%" stopColor="#2dd4bf" />
            </linearGradient>
          </defs>
          <circle className="xp-ring-track" cx="64" cy="64" r={r} strokeWidth="6" />
          <circle className="xp-ring-fill" cx="64" cy="64" r={r} strokeWidth="6"
            strokeDasharray={circ} strokeDashoffset={circ - (progress / 100) * circ} />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-lg">{tier === 'Platinum' ? '👑' : tier === 'Gold' ? '🌾' : tier === 'Silver' ? '🌿' : '🌱'}</span>
          <span className="text-[8px] font-bold text-zinc-400 mt-0.5">{level}</span>
        </div>
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <h3 className="text-sm font-semibold text-zinc-100">Farmer Rank</h3>
          <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 text-[10px]">{tier}</Badge>
        </div>
        <p className="text-2xl font-bold text-zinc-100">{xp} <span className="text-xs font-normal text-zinc-500">XP</span></p>
        <div className="mt-2 h-1.5 rounded-full bg-white/[0.04] overflow-hidden">
          <div className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-500"
            style={{ width: `${Math.min(100, progress)}%` }} />
        </div>
        <div className="flex justify-between mt-1 text-[9px] text-zinc-600">
          <span>🌱 Bronze</span><span>🌿 Silver</span><span>🌾 Gold</span><span>👑 Platinum</span>
        </div>
      </div>
    </div>
  )
}

/* ── OG Featured ── */
function OgCard({ address, badges }: { address: ViemAddr; badges: Record<string, boolean> | null }) {
  const hasOG = badges?.OG ?? null
  const [eth, setEth] = useState('—')
  const [weth, setWeth] = useState('—')
  useEffect(() => {
    getEthBalance(address).then(b => setEth((Number(b) / 1e18).toFixed(4)))
    getWethBalance(address).then(b => setWeth((Number(b) / 1e18).toFixed(4)))
  }, [address])

  return (
    <div className={`rounded-xl p-5 transition-all duration-500 ${
      hasOG
        ? 'bg-gradient-to-br from-amber-500/8 to-transparent border border-amber-500/20 shadow-[0_0_30px_rgba(245,158,11,0.05)]'
        : 'glass'
    }`}>
      <div className="flex items-center gap-4">
        <div className={`relative w-14 h-14 shrink-0 ${hasOG ? '' : 'opacity-50 grayscale'}`}>
          <div className={`w-14 h-14 rounded-full flex items-center justify-center text-2xl ${
            hasOG
              ? 'bg-gradient-to-br from-amber-400 to-amber-600 shadow-[0_0_24px_rgba(245,158,11,0.3)]'
              : 'glass'
          }`}>⭐</div>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-sm text-zinc-100">OG Pioneer Badge</span>
            {hasOG === null ? <Skeleton className="w-16 h-4 rounded" /> : hasOG
              ? <Badge className="bg-amber-500/10 text-amber-400 border-amber-500/20 text-[9px]">✓ VERIFIED</Badge>
              : <Badge variant="outline" className="text-zinc-600 border-zinc-700 text-[9px]">Not detected</Badge>
            }
          </div>
          <p className="text-[11px] text-zinc-500 mt-0.5">ERC-1155 — Soneium Mainnet Pioneer</p>
        </div>
        <div className="text-right text-[11px] font-mono text-zinc-500 whitespace-nowrap space-y-0.5">
          <div className="text-zinc-300">Ξ {eth}</div>
          <div className="text-zinc-600">WETH {weth}</div>
        </div>
      </div>
    </div>
  )
}

/* ── Season Badges Mini ── */
function SeasonBadgesMini({ address, badges }: { address: ViemAddr; badges: Record<string, boolean> | null }) {
  const owned = badges ? Object.entries(badges).filter(([, v]) => v).filter(([k]) => k !== 'OG').length : 0
  const allOwned = owned === SEASONS.length

  return (
    <div className="glass rounded-xl p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-semibold text-zinc-100">Season Badges</h3>
          <Badge variant="secondary" className="bg-white/[0.04] text-zinc-400 text-[9px] border-0">{owned} / {SEASONS.length}</Badge>
        </div>
        {allOwned && (
          <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 text-[9px]">🏆 COMPLETE</Badge>
        )}
      </div>
      <div className="flex gap-2 overflow-x-auto pb-1">
        {SEASONS.map(s => {
          const has = badges?.[s.id] ?? null
          return (
            <div key={s.id} className={`flex flex-col items-center gap-1.5 min-w-[68px] py-2 px-2 rounded-xl transition-all ${
              has ? 'bg-amber-500/5 border border-amber-500/10' : 'opacity-30 grayscale'
            }`}>
              <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg ${
                has ? 'bg-gradient-to-br from-amber-400/20 to-amber-600/10 border border-amber-400/30' : 'glass'
              }`}>{s.emoji}</div>
              <span className={`text-[9px] font-medium ${has ? 'text-amber-400' : 'text-zinc-600'}`}>{s.id}</span>
              <span className={`text-[8px] ${has === null ? 'text-zinc-700' : has ? 'text-emerald-400' : 'text-zinc-700'}`}>
                {has === null ? '...' : has ? 'OWNED' : ''}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

/* ── Recent Activity Mini ── */
function RecentActivity({ history }: { history: Array<{ hash: string; type: string; time: number; status: string }> }) {
  if (!history.length) return null
  return (
    <div className="glass rounded-xl p-5">
      <h3 className="text-sm font-semibold text-zinc-100 mb-3">Recent Activity</h3>
      <div className="space-y-0.5">
        {history.slice(0, 5).map((tx, i) => (
          <div key={i} className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-white/[0.03] transition-colors text-xs group">
            <span className={`w-1.5 h-1.5 rounded-full ${
              tx.status === 'confirmed' ? 'bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.4)]'
              : tx.status === 'pending' ? 'bg-amber-400'
              : 'bg-red-400'
            }`} />
            <span className="font-medium text-zinc-300 w-14 text-[11px]">{tx.type}</span>
            <a href={`https://soneium.blockscout.com/tx/${tx.hash}`} target="_blank" rel="noopener noreferrer"
              className="font-mono text-[10px] text-zinc-600 hover:text-emerald-400 transition-colors flex items-center gap-1 flex-1">
              <span>{tx.hash.slice(0, 8)}...{tx.hash.slice(-4)}</span>
              <ExternalLink size={10} className="opacity-0 group-hover:opacity-100 transition-opacity" />
            </a>
            <span className="text-[9px] text-zinc-700">{new Date(tx.time).toLocaleTimeString()}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

/* ── Dashboard ── */
export function Dashboard() {
  const { address, isConnected } = useAccount()
  const { st } = useApp()
  const { setNft } = useActions()
  const [inputAddr, setInputAddr] = useState('')
  const [viewAddr, setViewAddr] = useState<ViemAddr | null>(null)
  const [badges, setBadges] = useState<Record<string, boolean> | null>(null)
  const [totalTx, setTotalTx] = useState(0)

  const targetAddr = address || viewAddr

  useEffect(() => {
    if (!targetAddr) { setBadges(null); return }
    let dead = false
    checkAllBadges(targetAddr).then(r => { if (!dead) setBadges(r) })
    getNftBalance(targetAddr).then(n => { if (!dead) setNft(n) })
    getTransactionCount(targetAddr).then(t => { if (!dead) setTotalTx(t) })
    return () => { dead = true }
  }, [targetAddr, setNft])

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
  const badgeCount = badges ? Object.values(badges).filter(Boolean).length : 0

  return (
    <div className="p-4 lg:p-8 space-y-5 max-w-6xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-zinc-100 flex items-center gap-2">
            <Hexagon size={18} className="text-emerald-400" />
            Overview
          </h2>
          <p className="text-xs text-zinc-600 mt-0.5">Your farming dashboard</p>
        </div>
        {address && (
          <Badge variant="outline" className="glass text-zinc-400 border-white/[0.06] text-[10px] gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.5)]" />
            Connected
          </Badge>
        )}
      </div>

      {/* View mode */}
      {!isConnected && (
        <div className="flex gap-2">
          <input type="text" placeholder="0x... or ENS"
            value={inputAddr} onChange={e => setInputAddr(e.target.value)}
            className="flex-1 h-9 px-3 rounded-xl glass text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-emerald-500/30 font-mono" />
          <button onClick={() => inputAddr.length >= 42 && setViewAddr(inputAddr.toLowerCase() as ViemAddr)}
            className="h-9 px-4 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-medium hover:bg-emerald-500/20 transition-all">Inspect</button>
        </div>
      )}

      {/* XP Ring */}
      {targetAddr && <XpRing xp={xp} level={level} tier={currentTier.name} progress={progress} />}

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard icon={<Activity size={16} />} label="Session TX" value={String(st.countTx)} sub="this session" />
        <StatCard icon={<Coins size={16} />} label="Rank XP" value={String(xp)} sub={`toward ${nextTier.name}`} />
        <StatCard icon={<Sparkles size={16} />} label="Badges" value={badges ? `${badgeCount}/7` : '...'} sub="S1-S6 + OG" accent="amber" />
        <StatCard icon={<Wallet size={16} />} label="Wallet TX" value={String(totalTx)} sub="lifetime" />
      </div>

      {targetAddr && (
        <>
          <OgCard address={targetAddr} badges={badges} />
          <SeasonBadgesMini address={targetAddr} badges={badges} />
        </>
      )}

      {!targetAddr && (
        <div className="glass rounded-xl py-16 text-center border border-dashed border-white/[0.06]">
          <div className="text-4xl mb-3">🌾</div>
          <p className="text-zinc-500 text-sm">Connect a wallet or enter an address</p>
        </div>
      )}

      <RecentActivity history={st.txHistory} />
    </div>
  )
}
