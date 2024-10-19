export const POLYBASE_NAMESPACE =  "pk/0xbb44be3b8e07ed240e9144acfa4760f872ea5282b86647e678b505ffc2192b8cb5462e4624f2b1f363b6ad91b23ad7c3b99bf97450354725273cd486c1898606/zklinks"



//chain


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


export const DEFAULT_CHAIN_ID = 1029;
export const DEFAULT_CHAIN = CHAIN_OPTIONS[DEFAULT_CHAIN_ID]

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
    description: "You need to authorize the creation request for the 'Xefer' contract."
  },
  {
    title: "Await URL Creation",
    description: "Your contract and referral URL will be prepared for others to access."
  }
];



