import { useApp } from '@/hooks/use-store'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ExternalLink } from 'lucide-react'

export function ActivityFeed() {
  const { st } = useApp()

  return (
    <div className="p-6 lg:p-8 space-y-6 max-w-6xl">
      <div>
        <h2 className="text-lg font-bold text-zinc-100">Activity Feed</h2>
        <p className="text-xs text-zinc-500 mt-1">Transaction history for this session</p>
      </div>

      <Card className="bg-zinc-900/50 border-zinc-800/50">
        <CardContent className="p-5">
          {st.txHistory.length === 0 ? (
            <div className="py-16 text-center">
              <div className="text-4xl mb-3">🌱</div>
              <p className="text-zinc-500 text-sm">No transactions yet. Start the loop or run actions.</p>
            </div>
          ) : (
            <div className="space-y-0.5">
              {st.txHistory.map((tx, i) => {
                const statusColor = tx.status === 'confirmed' ? 'bg-emerald-400' : tx.status === 'pending' ? 'bg-amber-400' : 'bg-red-400'
                const time = new Date(tx.time)
                const dateStr = time.toLocaleDateString()
                const timeStr = time.toLocaleTimeString()

                return (
                  <div key={i} className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-zinc-800/30 transition-colors group">
                    <span className={`w-2 h-2 rounded-full ${statusColor} shadow-[0_0_6px] ${
                      tx.status === 'confirmed' ? 'shadow-emerald-400/30' : tx.status === 'pending' ? 'shadow-amber-400/30' : 'shadow-red-400/30'
                    }`} />
                    <Badge variant="secondary" className="bg-zinc-800 text-zinc-300 text-[10px] min-w-[64px] justify-center">
                      {tx.type}
                    </Badge>
                    <a
                      href={`https://soneium.blockscout.com/tx/${tx.hash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-mono text-xs text-zinc-500 hover:text-emerald-400 transition-colors flex items-center gap-1 flex-1 min-w-0"
                    >
                      <span className="truncate">{tx.hash}</span>
                      <ExternalLink size={12} className="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </a>
                    <span className="text-[10px] text-zinc-600 whitespace-nowrap hidden sm:block">{dateStr} {timeStr}</span>
                    <span className={`text-[9px] font-medium min-w-[48px] text-right ${
                      tx.status === 'confirmed' ? 'text-emerald-500' : tx.status === 'pending' ? 'text-amber-400' : 'text-red-400'
                    }`}>
                      {tx.status}
                    </span>
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Stats Summary */}
      {st.txHistory.length > 0 && (
        <Card className="bg-zinc-900/50 border-zinc-800/50">
          <CardContent className="p-5">
            <h3 className="text-sm font-semibold text-zinc-100 mb-3">Session Summary</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { label: 'Total TX', value: st.countTx },
                { label: 'Unique Types', value: new Set(st.txHistory.map(t => t.type)).size },
                { label: 'Confirmed', value: st.txHistory.filter(t => t.status === 'confirmed').length },
                { label: 'NFTs Minted', value: st.countNft },
              ].map(s => (
                <div key={s.label} className="bg-zinc-800/30 rounded-lg p-3 text-center">
                  <p className="text-lg font-bold text-zinc-100">{s.value}</p>
                  <p className="text-[10px] text-zinc-500 uppercase tracking-wider">{s.label}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
