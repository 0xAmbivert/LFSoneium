import { useApp } from '@/hooks/use-store'
import { Badge } from '@/components/ui/badge'
import { ExternalLink, Hexagon, Activity } from 'lucide-react'

export function ActivityFeed() {
  const { st } = useApp()

  return (
    <div className="p-4 lg:p-8 space-y-5 max-w-6xl">
      {/* Header */}
      <div>
        <h2 className="text-lg font-bold text-zinc-100 flex items-center gap-2">
          <Activity size={18} className="text-emerald-400" />
          Activity
        </h2>
        <p className="text-xs text-zinc-600 mt-0.5">Session transaction history</p>
      </div>

      {st.txHistory.length === 0 ? (
        <div className="glass rounded-xl py-20 text-center border border-dashed border-white/[0.06]">
          <div className="text-4xl mb-3">🌱</div>
          <p className="text-zinc-500 text-sm">No transactions yet. Run some actions first.</p>
        </div>
      ) : (
        <>
          {/* Timeline */}
          <div className="glass rounded-xl p-5 border border-white/[0.06]">
            <div className="relative">
              {/* Timeline line */}
              <div className="absolute left-[15px] top-3 bottom-3 w-px bg-white/[0.04]" />

              <div className="space-y-1">
                {st.txHistory.map((tx, i) => {
                  const statusColor = tx.status === 'confirmed' ? 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.3)]'
                    : tx.status === 'pending' ? 'bg-amber-400'
                    : 'bg-red-400'
                  const time = new Date(tx.time)
                  const timeStr = time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })

                  return (
                    <div key={i} className="relative flex items-start gap-4 px-4 py-3 rounded-lg hover:bg-white/[0.02] transition-colors group">
                      {/* Timeline dot */}
                      <div className="relative z-10 mt-1">
                        <div className={`w-[10px] h-[10px] rounded-full ${statusColor}`} />
                      </div>

                      <div className="flex-1 min-w-0 flex items-center gap-3">
                        <Badge variant="secondary" className="bg-white/[0.04] text-zinc-300 text-[10px] min-w-[60px] justify-center border-0 font-medium">
                          {tx.type}
                        </Badge>
                        <a href={`https://soneium.blockscout.com/tx/${tx.hash}`}
                          target="_blank" rel="noopener noreferrer"
                          className="font-mono text-xs text-zinc-600 hover:text-emerald-400 transition-colors flex items-center gap-1.5 flex-1 min-w-0 group/link">
                          <span className="truncate">{tx.hash}</span>
                          <ExternalLink size={11} className="shrink-0 opacity-0 group-hover/link:opacity-100 transition-opacity" />
                        </a>
                        <span className="text-[10px] text-zinc-700 whitespace-nowrap hidden sm:block">{timeStr}</span>
                        <span className={`text-[9px] font-medium min-w-[48px] text-right ${
                          tx.status === 'confirmed' ? 'text-emerald-500'
                          : tx.status === 'pending' ? 'text-amber-400'
                          : 'text-red-400'
                        }`}>{tx.status}</span>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>

          {/* Stats Summary */}
          <div className="glass rounded-xl p-5 border border-white/[0.06]">
            <h3 className="text-sm font-semibold text-zinc-100 mb-4">Session Summary</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { label: 'Total TX', value: st.countTx },
                { label: 'Unique Types', value: new Set(st.txHistory.map(t => t.type)).size },
                { label: 'Confirmed', value: st.txHistory.filter(t => t.status === 'confirmed').length },
                { label: 'Session Duration', value: `${Math.floor((Date.now() - st.sessionStart) / 60000)}m` },
              ].map(s => (
                <div key={s.label} className="glass rounded-lg p-3 text-center">
                  <p className="text-lg font-bold text-zinc-100">{s.value}</p>
                  <p className="text-[10px] text-zinc-500 uppercase tracking-wider mt-0.5">{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
