export const COVALENT_KEY = process.env.REACT_APP_COVALENT_KEY; // covalent api key
export const POLYBASE_NAMESPACE = process.env.REACT_APP_POLYBASE_NAMESPACE || "pk/0xbb44be3b8e07ed240e9144acfa4760f872ea5282b86647e678b505ffc2192b8cb5462e4624f2b1f363b6ad91b23ad7c3b99bf97450354725273cd486c1898606/zklinks"
export const APP_NAME = "Xefers";
export const APP_DESC = "Network referral link tracking"
export const APP_ICON_URL = 'X';
export const IPFS_BASE_URL = "https://w3s.link/ipfs"



//chain

export const DEFAULT_CHAIN_ID = 1029;
export const DEFAULT_CHAIN = CHAIN_OPTIONS[DEFAULT_CHAIN_ID]

export const CHAIN_OPTIONS = {
  1029:
  {
    
    name: 'BitTorrent Chain Donau ',
    rpcUrl: 'https://pre-rpc.bittorrentchain.io/',
    symbol: 'BTT',
    url:"https://testnet.bttcscan.com/",
    id: 1029
  },

};


//Example Forms

export const EXAMPLE_FORM = {
  title: "Marketing Campaign for SunPump.meme",
  redirectUrl: "https://sunpump.meme/",
  reward: 0
};


export const CREATE_STEPS = [
  {
    title: "Complete the Fields",
    description: "Provide the necessary information to register your link."
  },
  {
    title: "Generate Your Links",
    description: "You need to authorize the creation request for the 'LinkContract' xefer."
  },
  {
    title: "Await URL Creation",
    description: "Your contract and referral URL will be prepared for others to access."
  }
];



