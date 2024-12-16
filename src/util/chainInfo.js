export const CHAIN_OPTIONS = {
  
    199:
    {
      
      name: 'BitTorrent Chain Mainnet',
      rpcUrl: 'https://rpc.bittorrentchain.io',
      symbol: 'BTT',
      url:"https://bttcscan.com/",
      id: 199
    },

    297:
    {
      
      name: 'Hedera Previewnet',
      rpcUrl: 'https://previewnet.hashio.io/api',
      symbol: 'HBAR',
      url:"https://hashscan.io/previewnet/",
      id: 297
    },
  
  };
  
  
  export const CHAIN_ID = 297;
  export const CHAIN = CHAIN_OPTIONS[CHAIN_ID]
  