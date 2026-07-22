import { createContext, useContext, useCallback, useReducer, type ReactNode } from 'react'

export interface TxEntry {
  hash: string
  type: string
  time: number
  status: 'confirmed' | 'pending' | 'failed'
}

interface State {
  countTx: number
  countNft: number
  sessionStart: number
  txHistory: TxEntry[]
  isLooping: boolean
  viewAddress: string | null
}

type Action =
  | { type: 'INCR_TX' }
  | { type: 'ADD_TX'; payload: TxEntry }
  | { type: 'SET_NFT'; payload: number }
  | { type: 'SET_LOOP'; payload: boolean }
  | { type: 'SET_ADDRESS'; payload: string | null }
  | { type: 'RESET' }

const init = (): State => ({
  countTx: 0,
  countNft: 0,
  sessionStart: Date.now(),
  txHistory: [],
  isLooping: false,
  viewAddress: null,
})

function reducer(st: State, ac: Action): State {
  switch (ac.type) {
    case 'INCR_TX': return { ...st, countTx: st.countTx + 1 }
    case 'ADD_TX': return { ...st, txHistory: [ac.payload, ...st.txHistory].slice(0, 30) }
    case 'SET_NFT': return { ...st, countNft: ac.payload }
    case 'SET_LOOP': return { ...st, isLooping: ac.payload }
    case 'SET_ADDRESS': return { ...st, viewAddress: ac.payload }
    case 'RESET': return init()
  }
}

const Ctx = createContext<{ st: State; dispatch: React.Dispatch<Action> } | null>(null)

export function AppProvider({ children }: { children: ReactNode }) {
  const [st, dispatch] = useReducer(reducer, undefined, init)
  return <Ctx.Provider value={{ st, dispatch }}>{children}</Ctx.Provider>
}

export function useApp() {
  const c = useContext(Ctx)
  if (!c) throw new Error('useApp needs AppProvider')
  return c
}

export function useActions() {
  const { st, dispatch } = useApp()
  return {
    ...st,
    incrTx: useCallback(() => dispatch({ type: 'INCR_TX' }), [dispatch]),
    addTx: useCallback((h: string, t: string, s: TxEntry['status'] = 'confirmed') =>
      dispatch({ type: 'ADD_TX', payload: { hash: h, type: t, time: Date.now(), status: s } }), [dispatch]),
    setNft: useCallback((n: number) => dispatch({ type: 'SET_NFT', payload: n }), [dispatch]),
    setLoop: useCallback((v: boolean) => dispatch({ type: 'SET_LOOP', payload: v }), [dispatch]),
    setAddr: useCallback((a: string | null) => dispatch({ type: 'SET_ADDRESS', payload: a }), [dispatch]),
    reset: useCallback(() => dispatch({ type: 'RESET' }), [dispatch]),
  }
}
