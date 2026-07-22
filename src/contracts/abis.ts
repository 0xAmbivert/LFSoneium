import { parseAbi } from 'viem'

export const abi721 = parseAbi(['function balanceOf(address) view returns (uint256)', 'function name() view returns (string)', 'function symbol() view returns (string)'])
export const abi1155 = parseAbi(['function balanceOf(address, uint256) view returns (uint256)', 'function uri(uint256) view returns (string)'])
export const abiPoke = parseAbi(['function poke()'])
export const abiMint = parseAbi(['function mint()'])
export const abiWeth = parseAbi(['function deposit() payable', 'function withdraw(uint256 wad)', 'function balanceOf(address) view returns (uint256)'])
export const abiRouter = parseAbi(['function execute(bytes commands, bytes[] inputs, uint256 deadline) payable'])
