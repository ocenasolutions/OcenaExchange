export interface MetaMaskProvider {
  request: (args: { method: string; params?: any[] }) => Promise<any>
  isMetaMask?: boolean
  selectedAddress?: string
}

export interface WalletConnectProvider {
  enable: () => Promise<string[]>
  request: (args: { method: string; params?: any[] }) => Promise<any>
}

export interface WalletConnection {
  address: string
  provider: MetaMaskProvider | WalletConnectProvider
  chainId: number
}

export interface WalletState {
  isConnected: boolean
  address?: string
  balance?: string
  chainId?: number
  provider?: MetaMaskProvider | WalletConnectProvider
}
