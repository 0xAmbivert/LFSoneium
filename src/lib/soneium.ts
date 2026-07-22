import { createPublicClient, createWalletClient, custom, http, type Address, type Hash } from 'viem'
import { CHAIN, ADDRESS } from '@/contracts/addresses'
import { abi721, abi1155, abiPoke, abiMint, abiWeth, abiRouter } from '@/contracts/abis'

export const publicClient = createPublicClient({ chain: CHAIN, transport: http() })

export function getWalletClient() {
  if (!window.ethereum) return null
  return createWalletClient({ chain: CHAIN, transport: custom(window.ethereum) })
}

export function truncate(addr: string, start = 6, end = 4) {
  return `${addr.slice(0, start)}...${addr.slice(-end)}`
}

export function shortHash(h: string) {
  return `${h.slice(0, 6)}...${h.slice(-4)}`
}

// ── Read ──

export async function checkOGBadge(addr: Address) {
  const bal = await publicClient.readContract({
    address: ADDRESS.OG,
    abi: abi1155,
    functionName: 'balanceOf',
    args: [addr, 0n],
  })
  return bal > 0n
}

export async function checkSeasonBadge(addr: Address, contractAddr: Address) {
  const bal = await publicClient.readContract({
    address: contractAddr,
    abi: abi721,
    functionName: 'balanceOf',
    args: [addr],
  })
  return bal > 0n
}

export async function checkAllBadges(addr: Address): Promise<Record<string, boolean>> {
  const results: Record<string, boolean> = {}
  for (const [label, contract] of Object.entries(ADDRESS)) {
    if (label === 'OG') {
      try {
        const bal = await publicClient.readContract({
          address: contract, abi: abi1155, functionName: 'balanceOf', args: [addr, 0n],
        })
        results.OG = bal > 0n
      } catch { results.OG = false }
    } else if (['S1','S2','S3','S4','S5','S6'].includes(label)) {
      try {
        const bal = await publicClient.readContract({
          address: contract, abi: abi721, functionName: 'balanceOf', args: [addr],
        })
        results[label] = bal > 0n
      } catch { results[label] = false }
    }
  }
  return results
}

export async function getNftBalance(addr: Address) {
  const bal = await publicClient.readContract({
    address: ADDRESS.NFT, abi: abi721, functionName: 'balanceOf', args: [addr],
  })
  return Number(bal)
}

export async function getEthBalance(addr: Address) {
  return await publicClient.getBalance({ address: addr })
}

export async function getWethBalance(addr: Address) {
  return await publicClient.readContract({
    address: ADDRESS.WETH, abi: abiWeth, functionName: 'balanceOf', args: [addr],
  }) as bigint
}

export async function getTransactionCount(addr: Address) {
  return await publicClient.getTransactionCount({ address: addr })
}

export async function getGasPrice() {
  return await publicClient.getGasPrice()
}

// ── Write ──

export async function pokeTx(): Promise<Hash> {
  const wc = getWalletClient(); if (!wc) throw new Error('No wallet')
  const [addr] = await wc.requestAddresses()
  return await wc.writeContract({ address: ADDRESS.POKE, abi: abiPoke, functionName: 'poke', account: addr, chain: CHAIN }) as Hash
}

export async function mintTx(): Promise<Hash> {
  const wc = getWalletClient(); if (!wc) throw new Error('No wallet')
  const [addr] = await wc.requestAddresses()
  return await wc.writeContract({ address: ADDRESS.NFT, abi: abiMint, functionName: 'mint', account: addr, chain: CHAIN }) as Hash
}

export async function wrapTx(amount = 100_000_000_000n): Promise<Hash> {
  const wc = getWalletClient(); if (!wc) throw new Error('No wallet')
  const [addr] = await wc.requestAddresses()
  return await wc.writeContract({ address: ADDRESS.WETH, abi: abiWeth, functionName: 'deposit', account: addr, chain: CHAIN, value: amount }) as Hash
}

export async function unwrapTx(): Promise<Hash> {
  const wc = getWalletClient(); if (!wc) throw new Error('No wallet')
  const [addr] = await wc.requestAddresses()
  const balance = await getWethBalance(addr)
  if (balance === 0n) throw new Error('No WETH to unwrap')
  return await wc.writeContract({ address: ADDRESS.WETH, abi: abiWeth, functionName: 'withdraw', args: [balance], account: addr, chain: CHAIN }) as Hash
}

export async function swapTx(): Promise<Hash> {
  const wc = getWalletClient(); if (!wc) throw new Error('No wallet')
  const [addr] = await wc.requestAddresses()
  const amount = 1_000_000_000_000n
  return await wc.writeContract({
    address: ADDRESS.UNI_ROUTER, abi: abiRouter, functionName: 'execute',
    args: ['0x0b' as `0x${string}`, [(ADDRESS.WETH.toLowerCase() as `0x${string}`).padEnd(66, '0') + amount.toString(16).padStart(64, '0') as `0x${string}`], BigInt(Math.floor(Date.now() / 1000) + 600)],
    account: addr, chain: CHAIN, value: amount,
  }) as Hash
}

export async function heartbeatTx(): Promise<Hash> {
  const wc = getWalletClient(); if (!wc) throw new Error('No wallet')
  const [addr] = await wc.requestAddresses()
  const rand = `0x${[...Array(40)].map(() => Math.floor(Math.random() * 16).toString(16)).join('')}` as Address
  return await wc.sendTransaction({ to: rand, value: 0n, account: addr, chain: CHAIN }) as Hash
}
