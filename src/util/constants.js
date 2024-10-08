export const COVALENT_KEY = process.env.REACT_APP_COVALENT_KEY; // covalent api key

export const APP_NAME = "Xefers";
export const APP_DESC = "Multi-chain L2 network referral link tracking"

export const POLYBASE_NAMESPACE = process.env.REACT_APP_POLYBASE_NAMESPACE || "pk/0xbb44be3b8e07ed240e9144acfa4760f872ea5282b86647e678b505ffc2192b8cb5462e4624f2b1f363b6ad91b23ad7c3b99bf97450354725273cd486c1898606/Xefers"
export const PUSH_NOTIFICATIONS_ENV = 'staging'
export const PUSH_PK = process.env.REACT_APP_PUSH_PK;


export const CHAIN_OPTIONS = {
  1029:
  {
    // https://guide.scroll.io/user-guide/setup
    name: 'BitTorrent Chain Donau ',
    rpcUrl: 'https://pre-rpc.bittorrentchain.io/',
    symbol: 'BTT',
    url:"https://testnet.bttcscan.com/",
    id: 1029
  },
 

};

export const DEFAULT_CHAIN_ID = 1029;
export const DEFAULT_CHAIN = CHAIN_OPTIONS[DEFAULT_CHAIN_ID]

export const EXAMPLE_FORM = {
  title: "My referral marketing campaign",
  redirectUrl: "https://airdrops.io/uniswap",
  reward: 0
};

export const IPFS_BASE_URL = "https://w3s.link/ipfs"

export const CREATE_STEPS = [
  {
    title: "Fill in fields",
    description: "Enter required data to register the link."
  },
  {
    title: "Create zklink",
    description: "Requires authorizing a Zklink 'LinkContract' creation request."
  },
  {
    title: "Wait for zklink to be created",
    description: "Your contract and referral url will be ready for others to use"
  }
]

console.log("config", COVALENT_KEY, DEFAULT_CHAIN);
