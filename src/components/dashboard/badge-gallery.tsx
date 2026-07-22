import { useAccount } from 'wagmi'
import { useEffect, useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Hexagon, Sparkles, Lock, Star } from 'lucide-react'
import { SEASONS } from '@/contracts/addresses'
import { checkAllBadges } from '@/lib/soneium'

const FUTURE = [
  { id: 'S7', emoji: '⚡', name: 'Thunder' },
  { id: 'S8', emoji: '💫', name: 'Nova' },
  { id: 'S9', emoji: '🌀', name: 'Vortex' },
  { id: 'S10', emoji: '🌊', name: 'Tide' },
  { id: 'S11', emoji: '❄️', name: 'Frost' },
  { id: 'S12', emoji: '☄️', name: 'Comet' },
]

function BadgeCard({ emoji, id, name, owned, locked }: {
  emoji: string; id: string; name: string; owned: boolean | null; locked?: boolean
}) {
  if (locked) {
    return (
      <div className="glass rounded-xl py-5 px-3 flex flex-col items-center gap-2.5 border border-dashed border-white/[0.04] opacity-40">
        <div className="w-12 h-12 rounded-full bg-white/[0.02] border border-white/[0.04] flex items-center justify-center text-xl">
          {emoji}
        </div>
        <span className="text-xs font-medium text-zinc-600">{id}</span>
        <span className="text-[10px] text-zinc-500">{name}</span>
        <Lock size={12} className="text-zinc-700" />
      </div>
    )
  }
  const loading = owned === null
  return (
    <div className={`relative rounded-xl py-5 px-3 flex flex-col items-center gap-2.5 transition-all duration-500 group ${
      owned
        ? 'bg-gradient-to-br from-amber-500/8 via-amber-500/3 to-transparent border border-amber-500/20 shadow-[0_0_20px_rgba(245,158,11,0.06)]'
        : loading
        ? 'glass border border-white/[0.04]'
        : 'glass border border-white/[0.04] opacity-50 grayscale'
    }`}>
      {/* Shimmer overlay on owned */}
      {owned && <div className="absolute inset-0 rounded-xl shimmer pointer-events-none" />}
      <div className={`relative w-14 h-14 rounded-full flex items-center justify-center text-2xl transition-all duration-300 group-hover:scale-110 ${
        owned
          ? 'bg-gradient-to-br from-amber-400/20 to-amber-600/10 border-2 border-amber-400/30 shadow-[0_0_20px_rgba(245,158,11,0.15)]'
          : 'bg-white/[0.03] border border-white/[0.06]'
      }`}>{emoji}</div>
      <span className={`relative text-xs font-semibold ${owned ? 'text-amber-300' : 'text-zinc-600'}`}>{id}</span>
      <span className={`relative text-[10px] ${owned ? 'text-amber-400/70' : 'text-zinc-600'}`}>{name}</span>
      {loading ? (
        <Skeleton className="w-12 h-3 rounded" />
      ) : (
        <span className={`relative text-[10px] font-semibold ${owned ? 'text-emerald-400' : 'text-zinc-700'}`}>
          {owned ? '✓ OWNED' : '✗ MISSING'}
        </span>
      )}
      {owned && (
        <div className="absolute -top-1 -right-1">
          <Star size={12} className="text-amber-400 fill-amber-400" />
        </div>
      )}
    </div>
  )
}

export function BadgeGallery() {
  const { address } = useAccount()
  const [badges, setBadges] = useState<Record<string, boolean> | null>(null)
  const [inputAddr, setInputAddr] = useState('')
  const [viewAddr, setViewAddr] = useState<string | null>(null)
  const targetAddr = address || viewAddr

  useEffect(() => {
    if (!targetAddr) { setBadges(null); return }
    let dead = false
    checkAllBadges(targetAddr.toLowerCase() as `0x${string}`).then(r => { if (!dead) setBadges(r) })
    return () => { dead = true }
  }, [targetAddr])

  const ownedCount = badges ? Object.entries(badges).filter(([, v]) => v).length : 0
  const allOwned = badges && ownedCount === 7

  return (
    <div className="p-4 lg:p-8 space-y-5 max-w-6xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-zinc-100 flex items-center gap-2">
            <Hexagon size={18} className="text-emerald-400" />
            Badge Collection
          </h2>
          <p className="text-xs text-zinc-600 mt-0.5">Soneium Score SBT badges — on-chain verified</p>
        </div>
        {badges && (
          <Badge variant="outline" className={`text-[10px] gap-1.5 ${
            allOwned
              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
              : 'glass text-zinc-400 border-white/[0.06]'
          }`}>
            <Sparkles size={12} />
            {ownedCount}/7
          </Badge>
        )}
      </div>

      {/* View mode */}
      {!address && (
        <div className="flex gap-2">
          <input type="text" placeholder="0x... or ENS"
            value={inputAddr} onChange={e => setInputAddr(e.target.value)}
            className="flex-1 h-9 px-3 rounded-xl glass text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-emerald-500/30 font-mono" />
          <button onClick={() => inputAddr.length >= 42 && setViewAddr(inputAddr)}
            className="h-9 px-4 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-medium hover:bg-emerald-500/20 transition-all">Inspect</button>
        </div>
      )}

      {/* OG Badge */}
      <div className={`rounded-xl p-5 transition-all duration-500 ${
        badges?.OG
          ? 'bg-gradient-to-br from-amber-500/8 to-transparent border border-amber-500/20 shadow-[0_0_30px_rgba(245,158,11,0.05)]'
          : 'glass border border-white/[0.06]'
      }`}>
        <div className="flex items-center gap-4">
          <div className={`relative w-16 h-16 shrink-0 ${badges?.OG ? '' : 'opacity-50 grayscale'}`}>
            <div className={`w-16 h-16 rounded-full flex items-center justify-center text-3xl transition-all ${
              badges?.OG
                ? 'bg-gradient-to-br from-amber-400 to-amber-600 shadow-[0_0_30px_rgba(245,158,11,0.3)]'
                : 'glass'
            }`}>⭐</div>
            {badges?.OG && <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 border-2 border-[#020205] flex items-center justify-center"><span className="text-[8px]">✓</span></div>}
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-zinc-100">OG Pioneer Badge</span>
              {badges?.OG === undefined ? null : badges?.OG
                ? <Badge className="bg-amber-500/10 text-amber-400 border-amber-500/20 text-[9px]">✓ VERIFIED</Badge>
                : <Badge variant="outline" className="text-zinc-600 border-zinc-700 text-[9px]">Not detected</Badge>
              }
            </div>
            <p className="text-[11px] text-zinc-500 mt-0.5">ERC-1155 — The original Soneium Score pioneer badge</p>
          </div>
        </div>
      </div>

      {/* Seasons S1-S6 */}
      <div className="glass rounded-xl p-5 border border-white/[0.06]">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-semibold text-zinc-100">Seasonal Badges</h3>
            <Badge variant="secondary" className="bg-white/[0.04] text-zinc-400 text-[9px] border-0">S1–S6</Badge>
          </div>
          {allOwned && (
            <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 text-[9px]">🏆 COLLECTION COMPLETE</Badge>
          )}
        </div>
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
          {SEASONS.map(s => (
            <BadgeCard key={s.id} emoji={s.emoji} id={s.id} name={s.name} owned={badges?.[s.id] ?? null} />
          ))}
        </div>
      </div>

      {/* Future seasons */}
      <div className="glass rounded-xl p-5 border border-dashed border-white/[0.04]">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-semibold text-zinc-500">Upcoming Seasons</h3>
            <Badge variant="outline" className="text-zinc-600 border-zinc-700 text-[9px]">S7+</Badge>
          </div>
        </div>
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
          {FUTURE.map(s => (
            <BadgeCard key={s.id} emoji={s.emoji} id={s.id} name={s.name} owned={null} locked />
          ))}
        </div>
      </div>
    </div>
  )
}
