import React, { useEffect, useState } from "react";
import { Route, Routes, useNavigate, useLocation } from "react-router-dom";
import { Select } from "antd";
import xefersLogo from "./assets/xefersLogo.png";
import CreateCampaign from "./components/CreateCampaign";
import History from "./components/ViewAnalytics";
import Home from "./components/Home";
import Link from "./components/Link";
import TransactionHistory from "./components/TransactionHistory";
import { CHAIN_OPTIONS, CHAIN } from "./util/chainInfo";


//icons

import { FaLink } from "react-icons/fa6";
import { SiSimpleanalytics } from "react-icons/si";
import { TbBrandCampaignmonitor } from "react-icons/tb";

import "./App.css";

const { Option } = Select;

function App() {

   const toHexString = (number) => {
    return "0x" + Number(number).toString(16);
  }


  const [account, setAccount] = useState();
  const [loading, setLoading] = useState(false);
  const [activeChain, setActiveChain] = useState(CHAIN);

  const navigate = useNavigate();
  const location = useLocation();

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
      sessionStorage.setItem("address", accs[0]);
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
      const accounts = await e.request({ method: "eth_accounts" });
      if (accounts.length > 0) {
        setAccount(accounts[0]);
      } else {
        await login();
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
      key: "/create",
      label: (
        <div className="flex text-white bg-[#1d2132] cursor-pointer rounded-lg p-4 transition-all duration-300 items-center space-x-2">
          <FaLink /> {/* Icon for Create Link */}
          <span>Create Link</span>
        </div>
      ),
      onClick: () => navigate("/create"),
      isActive: location.pathname === "/create",
    },
    {
      key: "/history",
      label: (
        <div className="flex items-center space-x-2">
          <SiSimpleanalytics /> {/* Icon for Create Link */}
          <span>Analytics</span>
        </div>
      ),
      onClick: () => navigate("/history"),
    },
    {
      key: "/TransactionHistory",
      label: account ? (
        <div className="flex items-center space-x-2">
          <TbBrandCampaignmonitor /> {/* Icon for Create Link */}
          <span onClick={() => navigate("/TransactionHistory")}>
            History:{" "}
            {account
              ? account.toString().slice(0, 6) +
                "..." +
                account.toString().slice(-5)
              : ""}
          </span>
        </div>
      ) : (
        <button
          className="bg-[#1d2132] text-[#fff] py-2 px-4 rounded-lg shadow-md hover:bg-[#283046] hover:shadow-lg transition-all duration-300 ease-in-out"
          onClick={login}
          loading={loading}
          disabled={loading}
        >
          Connect Wallet
        </button>
      ),
      showOnRedirectPage: true,
    },
    {
      key: 1,
      label: (
        <span>
          Chain :&nbsp;
          <Select
            className="font-Oxanium select-network hover:border-none"
            defaultValue={activeChain.id}
            style={{ width: 175 }}
            onChange={(v) => setActiveChain(CHAIN_OPTIONS[v])}
          >
            {Object.values(CHAIN_OPTIONS).map((chain, i) => (
              <Option
                className="hover:border-none font-Oxanium"
                key={i}
                value={chain.id}
              >
                {chain.name}
              </Option>
            ))}
          </Select>
        </span>
      ),
      showOnRedirectPage: true,
    },
  ];

  return (
    <div className="flex">
      <div className="w-1/5 h-screen bg-white p-4 border-r border-gray-300">
        <header className="font-Oxanium mb-4">
          <div></div>
          <img src={xefersLogo} className=" " height={35} width={50} />
          <br />
          <hr />
          <br />
          <br />
          <nav className="flex flex-col space-y-6">
            {menuItems.map((item) => (
              <div
                key={item.key}
                className={`text-[#1d2132] cursor-pointer rounded-lg p-2 transition-all duration-300 
                  ${
                    item.isActive || item.key === "/create"
                      ? ""
                      : "hover:bg-gray-100 p-4"
                  }`}
                onClick={item.onClick}
              >
                {item.label}
              </div>
            ))}
          </nav>
        </header>
      </div>

      <div className="w-4/5 p-4">
        <div className="container">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route
              path="/TransactionHistory"
              element={
                <TransactionHistory activeChain={activeChain} account={account} />
              }
            />
            <Route
              path="/link/:contractAddress"
              element={<Link activeChain={activeChain} account={account} />}
            />
            <Route
              path="/create"
              element={
                <CreateCampaign activeChain={activeChain} account={account} />
              }
            />
            <Route
              path="/history"
              element={<History activeChain={activeChain} />}
            />
            <Route />
          </Routes>
        </div>
      </div>
    </div>
  );
}

export default App;
