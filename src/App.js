import React, { useEffect, useState } from "react";
import { Route, Routes, useNavigate } from "react-router-dom";
import { Layout, Select } from "antd";
import xefersLogo from "./assets/xefersLogo.png";
import CreateRequest from "./components/CreateRequest";
import History from "./components/History";
import Home from "./components/Home";
import Link from "./components/Link";
import GetLinkByAddress from "./components/GetLinkByAddress";



import {

  CHAIN_OPTIONS,
  DEFAULT_CHAIN,
} from "./util/constants";
import { capitalize, toHexString } from "./util";


import "./App.css";


const { Option } = Select;

function App() {
  const [account, setAccount] = useState();
  const [loading, setLoading] = useState(false);
  const [activeChain, setActiveChain] = useState(DEFAULT_CHAIN);


  const navigate = useNavigate();
  const path = window.location.pathname;

  const isRedirect = path.startsWith("/link/");


  const changeNetwork = async (chainId) => {
    const e = window.ethereum;
    if (!e) {
      alert("Metamask must be connected to use the app");
      return;
    }

    await window.ethereum.request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId }],
    });
  };

  useEffect(() => {
    if (account) {
      changeNetwork(toHexString(activeChain.id));
    }
  }, [activeChain, account]);

  const login = async () => {
    setLoading(true);
    const e = window.ethereum;
    if (!e) {
        alert("MetaMask must be connected to use the app");
        return;
    }
    try {
        const accs = await e.request({ method: "eth_requestAccounts" });
        setAccount(accs[0]);
        sessionStorage.setItem("address", accs[0]); // Use accs[0] instead of account
    } catch (err) {
        console.error(err);
    } finally {
        setLoading(false);
    }
};

const checkConnected = async () => {
    const e = window.ethereum;
    if (!e) {
        return;
    }
    try {
        const accounts = await e.request({ method: "eth_accounts" }); // Get accounts
        if (accounts.length > 0) {
            setAccount(accounts[0]); // Set account if connected
        } else {
            await login(); // Prompt user to connect if no accounts
        }
    } catch (err) {
        console.error(err);
    }
};


  useEffect(() => {
    checkConnected();
  }, []);

  const menuItems = [
    {
      key: "/",
      label: <img src={xefersLogo} height={35} width={50} />,
      showOnRedirectPage: true,
      onClick: () => navigate("/create"),
    },
    {
      key: "/create",
      label: "Create Link",
      onClick: () => navigate("/create"),
    },
    {
      key: "/history",
      label: "View Transaction ",
      onClick: () => navigate("/history"),
    },
    {
      key: "/GetLinkByAddress",
      label: account ? (
        <span onClick={() => navigate("/GetLinkByAddress")}>
        History: {account ? (account.toString().slice(0, 14) + '...' + account.toString().slice(-4)) : ""}
      </span>
      
      ) : (
        <button
          className="bg-[#1d2132] text-[#fff] py-2 px-4 rounded-lg shadow-md hover:bg-[#283046] hover:shadow-lg transition-all duration-300 ease-in-out"
          onClick={login}
          loading={loading}
          disabled={loading}
        >
          Login with Metamask
        </button>
      ),
      showOnRedirectPage: true,
    },
 

    {
      key: 1,
      label: (
        <span>
          Chain:&nbsp;
          <Select
            className="font-Ubuntu select-network hover:border-none"
            defaultValue={activeChain.id}
            style={{ width: 175 }}
            onChange={(v) => setActiveChain(CHAIN_OPTIONS[v])}
          >
            {Object.values(CHAIN_OPTIONS).map((chain, i) => (
              <Option className="hover:border-none" key={i} value={chain.id}>
                {capitalize(chain.name)}
              </Option>
            ))}
          </Select>
        </span>
      ),
      showOnRedirectPage: true,
    },
  ];

  return (
    <div className="App">
      <div>
        <header className="p-4 font-Ubuntu bg-gray-100 flex justify-evenly items-center">
          <nav className="w-full flex justify-center items-center">
            <ul className="flex items-center space-x-6">
              {menuItems.map((item) => (
                <li
                  key={item.key}
                  className="text-[#1d2132] cursor-pointer"
                  style={{ listStyleType: "none" }}
                  onClick={item.onClick}
                >
                  {item.label}
                </li>
              ))}
            </ul>
          </nav>
        </header>

        <div className="" style={{ padding: "0 50px" }}>
          <div className="container">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route
                path="/GetLinkByAddress"
                element={
                  <GetLinkByAddress activeChain={activeChain} account={account} />
                }
              />
              <Route
                path="/link/:contractAddress"
                element={
                  <Link activeChain={activeChain} account={account} />
                }
              />
              <Route
                path="/create"
                element={
                  <CreateRequest activeChain={activeChain} account={account} />
                }
              />
              <Route
                path="/history"
                element={<History activeChain={activeChain} />}
              />
              <Route  />
            </Routes>
          </div>
        </div>
      
      </div>


    </div>
  );
}

export default App;
