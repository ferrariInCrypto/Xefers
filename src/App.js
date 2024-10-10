import React, { useEffect, useState } from "react";
import { Route, Routes, useNavigate } from "react-router-dom";
import { Layout, Menu, Select, Badge, Modal } from "antd";
import { BellTwoTone } from "@ant-design/icons";

import CreateRequest from "./components/CreateRequest";
import History from "./components/History";
import Home from "./components/Home";
import logo from "./assets/logo.png";
import LinkRedirect from "./components/LinkRedirect";
import OwnerLinks from "./components/OwnerLinks";
import Notification from "./components/Notification";
import { About } from "./components/About";

import { APP_DESC, APP_NAME, CHAIN_OPTIONS, DEFAULT_CHAIN } from "./util/constants";
import { capitalize, toHexString } from "./util";
import { fetchNotifications } from "./util/notifications";

import './App.css';

const { Option } = Select;
const { Header, Content, Footer } = Layout;

function App() {
  const [account, setAccount] = useState();
  const [loading, setLoading] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [activeChain, setActiveChain] = useState(DEFAULT_CHAIN);
  const [showNotifications, setShowNotifications] = useState(false);

  const navigate = useNavigate();
  const path = window.location.pathname;

  const isRedirect = path.startsWith("/link/");

  useEffect(() => {
    if (account) {
      getNotifications();
    }
  }, [account]);

  const getNotifications = async () => {
    try {
      const data = await fetchNotifications(account);
      setNotifications(data);
    } catch (e) {
      console.error(e);
    }
  };

  const changeNetwork = async (chainId) => {
    const e = window.ethereum;
    if (!e) {
      alert('Metamask must be connected to use the app');
      return;
    }

    await window.ethereum.request({
      method: 'wallet_switchEthereumChain',
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
      alert('Metamask must be connected to use the app');
      return;
    }
    try {
      const accs = await e.request({ method: 'eth_requestAccounts' });
      setAccount(accs[0]);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const checkConnected = async () => {
    const e = window.ethereum;
    if (!e) {
      return;
    }
    const connected = e.isConnected();
    if (connected) {
      await login();
    }
  };

  useEffect(() => {
    checkConnected();
  }, []);

  const menuItems = [
    {
      key: '/',
      label: (
        <img
          src={logo}
          className="header-logo pointer"
          alt="logo"
          onClick={() => navigate("/")}
        />
      ),
      showOnRedirectPage: true,
    },
    {
      key: '/create',
      label: "Create Link",
      onClick: () => navigate("/create"),
    },
    {
      key: '/history',
      label: "Link History",
      onClick: () => navigate("/history"),
    },
    {
      key: '/ownerlinks',
      label: account ? (
        <span onClick={() => navigate('/ownerlinks')}>Hello: {account}</span>
      ) : (
        <button
          className="bg-[#1d2132] text-white py-2 px-4 rounded-lg shadow-md hover:bg-[#283046] hover:shadow-lg transition-all duration-300 ease-in-out"
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
      key: 0,
      label: (
        <Badge count={notifications.length || 0}>
          <BellTwoTone
            className="notification-bell"
            onClick={() => setShowNotifications(true)}
          />
        </Badge>
      ),
    },
    {
      key: 1,
      label: (
        <span>
          Network:&nbsp;
          <Select
            defaultValue={activeChain.id}
            style={{ width: 175 }}
            className="select-network"
            onChange={(v) => setActiveChain(CHAIN_OPTIONS[v])}
          >
            {Object.values(CHAIN_OPTIONS).map((chain, i) => (
              <Option key={i} value={chain.id}>
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
      <Layout className="layout">
        <Header className="header-menu">
          <Menu
            mode="horizontal"
            selectedKeys={[path]}
            items={isRedirect ? menuItems.filter(item => item.showOnRedirectPage) : menuItems}
          />
        </Header>
        <Content style={{ padding: "0 50px" }}>
          <div className="container">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/ownerlinks" element={<OwnerLinks activeChain={activeChain} account={account} />} />
              <Route path="/link/:contractAddress" element={<LinkRedirect activeChain={activeChain} account={account} />} />
              <Route path="/create" element={<CreateRequest activeChain={activeChain} account={account} />} />
              <Route path="/history" element={<History activeChain={activeChain} />} />
              <Route path="/about" element={<About />} />
            </Routes>
          </div>
        </Content>
        <Footer style={{ textAlign: "center" }}>
          {APP_NAME} &copy;{new Date().getFullYear()} - {APP_DESC} -{" "}
          <a href="#" onClick={(e) => {
            e.preventDefault();
            navigate("/about");
          }}>
            About
          </a>
        </Footer>
      </Layout>

      <Modal
        title={`Notifications (${notifications.length})`}
        bodyStyle={{ overflowY: 'scroll' }}
        open={showNotifications}
        onOk={() => setShowNotifications(false)}
        onCancel={() => setShowNotifications(false)}
        cancelButtonProps={{ style: { display: 'none' } }}
      >
        <div style={{ overflowY: 'scroll', maxHeight: '500px' }}>
          {notifications.map((n, i) => (
            <Notification key={i} notification={n} />
          ))}
        </div>
      </Modal>
    </div>
  );
}

export default App;
