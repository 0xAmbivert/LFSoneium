export const SONEIUM_CHAIN_ID = 1868

export const SONEIUM_RPC = 'https://rpc.soneium.org'

export const SONEIUM_EXPLORER = 'https://soneium.blockscout.com'

export const ADDRESS = {
  S1: '0x05AB5e724848cEFeac6D303CDf94032E5Cc3552B',
  S2: '0x6b2f6D8216E075D3a71F4aaf21d7158Af9B8dc82',
  S3: '0x7BF02b42b9d4cCD85b497C9F53e6b7474f9c2546',
  S4: '0x17121f9a7041ffe3ef248f7b84658d9229bad64f',
  S5: '0xD8d14f829665183049707E0bDD93f9012bB3c4C2',
  S6: '0xe5a3d28fe65895d7cd7146fb50199b85fba74c3e',
  OG: '0x2A21B17E366836e5FFB19bd47edB03b4b551C89d',
  POKE: '0xac3fa700149513bed425398f10a08767Aef138c3',
  NFT: '0xe134662e9CDf904Ea3D90dB3F527054ED3687d83',
  WETH: '0x4200000000000000000000000000000000000006',
  UNI_ROUTER: '0x0E2850543f69F678257266E0907fF9A58B3F13dE',
} as const

export const CHAIN = {
  id: SONEIUM_CHAIN_ID,
  name: 'Soneium Mainnet',
  nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
  rpcUrls: { default: { http: [SONEIUM_RPC] } },
  blockExplorers: { default: { name: 'Blockscout', url: SONEIUM_EXPLORER } },
} as const

export const SEASONS = [
  { id: 'S1', emoji: '💎', name: 'Diamond', addr: ADDRESS.S1 },
  { id: 'S2', emoji: '🔥', name: 'Blaze', addr: ADDRESS.S2 },
  { id: 'S3', emoji: '👑', name: 'Crown', addr: ADDRESS.S3 },
  { id: 'S4', emoji: '🏆', name: 'Champion', addr: ADDRESS.S4 },
  { id: 'S5', emoji: '🌟', name: 'Star', addr: ADDRESS.S5 },
  { id: 'S6', emoji: '🚀', name: 'Galaxy', addr: ADDRESS.S6 },
] as const

export const ACTIONS = [
  { id: 'poke', label: 'Poke', desc: 'Ecosystem ping', icon: '🧪', contract: ADDRESS.POKE, method: 'poke' as const },
  { id: 'mint', label: 'Mint', desc: 'Mint NFT', icon: '✨', contract: ADDRESS.NFT, method: 'mint' as const },
  { id: 'wrap', label: 'Wrap', desc: 'ETH → WETH', icon: '📥', contract: ADDRESS.WETH, method: 'deposit' as const },
  { id: 'unwrap', label: 'Unwrap', desc: 'WETH → ETH', icon: '📤', contract: ADDRESS.WETH, method: 'withdraw' as const },
  { id: 'swap', label: 'Swap', desc: 'Uniswap V4', icon: '🦄', contract: ADDRESS.UNI_ROUTER, method: 'execute' as const },
  { id: 'heartbeat', label: 'Heartbeat', desc: '0 ETH ping', icon: '💓', contract: '', method: 'send' as const },
] as const
