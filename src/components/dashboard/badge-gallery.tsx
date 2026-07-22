import { useAccount } from 'wagmi'
import { useEffect, useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { SEASONS } from '@/contracts/addresses'
import { checkAllBadges } from '@/lib/soneium'
import { Skeleton } from '@/components/ui/skeleton'

const FUTURE = [
  { id: 'S7', emoji: '⚡', name: 'Thunder' },
  { id: 'S8', emoji: '💫', name: 'Nova' },
  { id: 'S9', emoji: '🌀', name: 'Vortex' },
  { id: 'S10', emoji: '🌊', name: 'Tide' },
  { id: 'S11', emoji: '❄️', name: 'Frost' },
  { id: 'S12', emoji: '☄️', name: 'Comet' },
]

function BadgeCard({ emoji, id, name, owned, locked }: { emoji: string; id: string; name: string; owned: boolean | null; locked?: boolean }) {
  if (locked) {
    return (
      <div className="flex flex-col items-center gap-2 py-4 px-2 rounded-xl bg-zinc-800/20 border border-dashed border-zinc-800 opacity-40">
        <div className="text-2xl">{emoji}</div>
        <span className="text-[10px] font-medium text-zinc-600">{id}</span>
        <span className="text-[9px] font-medium text-zinc-500">{name}</span>
        <span className="text-[9px] text-zinc-700">🔒</span>
      </div>
    )
  }
  return (
    <div className={`flex flex-col items-center gap-2 py-4 px-2 rounded-xl transition-all ${
      owned ? 'bg-amber-500/5 border border-amber-500/20 shadow-[0_0_12px_rgba(245,158,11,0.08)]' :
      owned === false ? 'bg-zinc-800/20 border border-zinc-800/50 opacity-50 grayscale' :
      'bg-zinc-800/20 border border-zinc-800/50'
    }`}>
      <div className={`w-14 h-14 rounded-full flex items-center justify-center text-xl transition-all ${
        owned ? 'bg-gradient-to-br from-amber-500/20 to-amber-600/10 border-2 border-amber-500/30 shadow-[0_0_16px_rgba(245,158,11,0.15)]' :
        'bg-zinc-800 border border-zinc-700'
      }`}>{emoji}</div>
      <span className={`text-xs font-semibold ${owned ? 'text-amber-400' : 'text-zinc-600'}`}>{id}</span>
      <span className={`text-[9px] ${owned ? 'text-amber-300/80' : 'text-zinc-600'}`}>{name}</span>
      {owned === null ? <Skeleton className="w-12 h-3 rounded" /> : (
        <span className={`text-[9px] font-semibold ${owned ? 'text-emerald-400' : 'text-zinc-700'}`}>
          {owned ? '✓ OWNED' : '✗ MISSING'}
        </span>
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

  return (
    <div className="p-6 lg:p-8 space-y-6 max-w-6xl">
      <div>
        <h2 className="text-lg font-bold text-zinc-100">Badge Collection</h2>
        <p className="text-xs text-zinc-500 mt-1">Soneium Score SBT badges tracked on-chain</p>
      </div>

      {/* View mode */}
      {!address && (
        <div className="flex gap-2">
          <input type="text" placeholder="0x... or ENS" value={inputAddr} onChange={e => setInputAddr(e.target.value)}
            className="flex-1 h-9 px-3 rounded-lg bg-zinc-900 border border-zinc-800 text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-emerald-500/50 font-mono" />
          <button onClick={() => inputAddr.length >= 42 && setViewAddr(inputAddr)}
            className="h-9 px-4 rounded-lg bg-zinc-800 text-xs font-medium text-zinc-300 hover:bg-zinc-700 transition-colors">Inspect</button>
        </div>
      )}

      {/* OG Badge */}
      <Card className={`border transition-all duration-500 ${
        badges?.OG ? 'border-amber-500/30 bg-gradient-to-br from-amber-500/5 to-transparent' : 'border-zinc-800/50 bg-zinc-900/30'
      }`}>
        <CardContent className="p-5 flex items-center gap-4">
          <div className={`w-14 h-14 rounded-full flex items-center justify-center text-2xl transition-all ${
            badges?.OG ? 'bg-gradient-to-br from-amber-400 to-amber-600 shadow-[0_0_24px_rgba(245,158,11,0.3)]' : 'bg-zinc-800 border border-zinc-700'
          }`}>⭐</div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-zinc-100">OG Badge</span>
              {badges?.OG === undefined ? null : badges?.OG
                ? <Badge className="bg-amber-500/10 text-amber-400 border-amber-500/20 text-[10px]">✓ VERIFIED</Badge>
                : <Badge variant="outline" className="text-zinc-500 text-[10px]">Not detected</Badge>
              }
            </div>
            <p className="text-xs text-zinc-500 mt-0.5">ERC-1155 Pioneer Badge — Soneium Mainnet</p>
          </div>
          {badges && <div className="text-xs text-zinc-500 font-mono">{ownedCount}/7 badges</div>}
        </CardContent>
      </Card>

      {/* Seasons S1-S6 */}
      <Card className="bg-zinc-900/50 border-zinc-800/50">
        <CardContent className="p-5">
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-sm font-semibold text-zinc-100">Seasonal Badges</h3>
            <Badge variant="secondary" className="bg-zinc-800 text-zinc-400 text-[10px]">S1–S6</Badge>
          </div>
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
            {SEASONS.map(s => (
              <BadgeCard key={s.id} emoji={s.emoji} id={s.id} name={s.name} owned={badges?.[s.id] ?? null} />
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Future */}
      <Card className="bg-zinc-900/30 border-dashed border-zinc-800">
        <CardContent className="p-5">
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-sm font-semibold text-zinc-500">Upcoming Seasons</h3>
            <Badge variant="outline" className="text-zinc-600 border-zinc-700 text-[10px]">S7+</Badge>
          </div>
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
            {FUTURE.map(s => (
              <BadgeCard key={s.id} emoji={s.emoji} id={s.id} name={s.name} owned={null} locked />
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
