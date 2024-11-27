import React, { Suspense, lazy, useEffect, useState } from "react";
import { Route, Routes, useNavigate, useLocation } from "react-router-dom";
import { Select, Drawer, Button } from "antd";
import { MenuOutlined } from "@ant-design/icons";
import xefersLogo from "./assets/xefersLogo.png";
import { CHAIN_OPTIONS, CHAIN } from "./util/chainInfo";


// Icons
import { FaLink } from "react-icons/fa6";
import { SiSimpleanalytics } from "react-icons/si";
import { TbBrandCampaignmonitor } from "react-icons/tb";

import "./App.css";

const { Option } = Select;

// Lazy load components
const CreateCampaign = React.lazy(() => import("./components/CreateCampaign"));
const History = React.lazy(() => import("./components/ViewAnalytics"));
const Home = React.lazy(() => import("./components/Home"));
const Link = React.lazy(() => import("./components/Link"));
const TransactionHistory = React.lazy(() => import("./components/TransactionHistory"));

function App() {
  const toHexString = (number) => {
    return "0x" + Number(number).toString(16);
  };

  const [account, setAccount] = useState();
  const [loading, setLoading] = useState(false);
  const [activeChain, setActiveChain] = useState(CHAIN);
  const [drawerVisible, setDrawerVisible] = useState(false);

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
        <div className="flex items-center space-x-2">
          <FaLink />
          <span>Create Link</span>
        </div>
      ),
      onClick: () => {
        setDrawerVisible(false);
        navigate("/create");
      },
    },
    {
      key: "/history",
      label: (
        <div className="flex items-center space-x-2">
          <SiSimpleanalytics />
          <span>Analytics</span>
        </div>
      ),
      onClick: () => {
        setDrawerVisible(false);
        navigate("/history");
      },
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
          disabled={loading}
        >
          Connect Wallet
        </button>
      ),
      onClick: () => {
        setDrawerVisible(false);
        navigate("/TransactionHistory");
      },
    },
    {
      key: 1,
      label: (
        <span>
          Chain:{" "}
          <Select
            defaultValue={activeChain.id}
            style={{ width: 150 }}
            onChange={(v) => setActiveChain(CHAIN_OPTIONS[v])}
          >
            {Object.values(CHAIN_OPTIONS).map((chain, i) => (
              <Option key={i} value={chain.id}>
                {chain.name}
              </Option>
            ))}
          </Select>
        </span>
      ),
    },
  ];

  return (
    <div className="flex mt-8 flex-col lg:flex-row">
      {/* Sidebar for Desktop */}
      <div className="hidden lg:block w-1/5 h-screen bg-white p-4 border-r border-gray-300">
        <header className="mb-4">
          <img src={xefersLogo} alt="Logo" height={35} width={50} />
          <hr className="my-6" />
          <nav className="flex flex-col space-y-10">
            {menuItems.map((item) => (
              <div
                key={item.key}
                className="cursor-pointer rounded-lg p-2 hover:bg-gray-100 transition-all"
                onClick={item.onClick}
              >
                {item.label}
              </div>
            ))}
          </nav>
        </header>
      </div>

      {/* Drawer for Mobile */}
      <div className="lg:hidden p-6">
        <Button
          className="bg-[#1d2132] text-[#fff] "
          icon={<MenuOutlined />}
          onClick={() => setDrawerVisible(true)}
        >
   
       
        </Button>
        <Drawer
          // title={<img src={xefersLogo} alt="Logo" height={35} width={50} />}
          placement="left"
          onClose={() => setDrawerVisible(false)}
          visible={drawerVisible}
        >
          <nav className="flex flex-col space-y-6">
            {menuItems.map((item) => (
              <div
                key={item.key}
                className="cursor-pointer rounded-lg p-2 hover:bg-gray-100 transition-all"
                onClick={item.onClick}
              >
                {item.label}
              </div>
            ))}
          </nav>
        </Drawer>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-4">
      <Suspense fallback={<div>Loading...</div>} >
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
        </Routes>
  
  </Suspense>
      </div>
     
    </div>
  );
}

export default App;
