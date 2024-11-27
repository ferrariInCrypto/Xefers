import React, { useEffect, useState } from "react";
import { createLink } from "../util/storeDb";
import logo2 from "../assets/xefersLogo.png";
import { ethers } from "ethers";
import { Form } from "antd";
import { XEFERS_CONTRACT } from "../contractInfo/Metadata";
import { CHAIN } from "../util/chainInfo";
import { Input, Row, Col, Card, Checkbox, Result, Modal } from "antd";

const getExplorerUrl = (activeChain, hash, useTx) =>
  `${activeChain?.url || CHAIN.url}${useTx ? "tx/" : "address/"}${hash}`;

const redirectUrl = (address) => `${window.location.origin}/link/${address}`;

export const toHexString = (number) => {
  return "0x" + Number(number).toString(16);
};

export const isValidUrl = (link) => {
  if (!link) return false;

  try {
    new URL(link);
    return true;
  } catch (_) {
    return false;
  }
};

const getSigner = async () => {
  let signer;
  await window.ethereum.enable();
  const provider = new ethers.providers.Web3Provider(window.ethereum);
  signer = provider.getSigner();
  return signer;
};

export const getPrimaryAccount = async () => {
  let provider;
  if (window.ethereum) {
    await window.ethereum.enable();
    provider = new ethers.providers.Web3Provider(window.ethereum);
  } else {
    return undefined; // No supported account detected.
  }

  const accounts = await provider.listAccounts();
  return accounts[0];
};

export async function deployContract(title, reward, redirectUrl) {
  const signer = await getSigner();

  // Create an instance of a Contract Factory
  const factory = new ethers.ContractFactory(
    XEFERS_CONTRACT.abi,
    XEFERS_CONTRACT.bytecode,
    signer
  );

  // Start deployment, returning a promise that resolves to a contract object
  const contract = await factory.deploy(title, reward, redirectUrl);
  await contract.deployed();
  console.log("Contract deployed to address:", contract.address);
  return contract;
}

export const validAddress = (addr) => {
  try {
    ethers.utils.getAddress(addr);
    return true;
  } catch (e) {
    return false;
  }
};

export const getMetadata = async (contractAddress) => {
  if (!contractAddress) {
    return {};
  }
  const signer = await getSigner();
  const signatureContract = new ethers.Contract(
    contractAddress,
    XEFERS_CONTRACT.abi,
    signer
  );
  const result = await signatureContract.getMetadata();
  return result;
};

export const getTitle = async (contractAddress) => {
  if (!contractAddress) {
    return {};
  }
  const signer = await getSigner();
  const signatureContract = new ethers.Contract(
    contractAddress,
    XEFERS_CONTRACT.abi,
    signer
  );
  const result = await signatureContract.getTitle();
  return result;
};

function CreateCampaign({ activeChain, account }) {
  const [contractAdd, setContract] = useState("");
  const [buttonState, setbuttonState] = useState("Confirm");

  const DEMO = {
    title: "Marketing Campaign for SunPump.meme",
    redirectUrl: "https://sunpump.meme/",
    reward: 0,
  };

 

  const [data, setData] = useState({
    title: "",
    redirectUrl: "",
    reward: 0,
    rewardChecked: true,
  });

  const [error, setError] = useState();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState();
  const [isModalVisible, setIsModalVisible] = useState(false); // Modal visibility state

  const updateData = (key, value) => {
    if (key === "redirectUrl") {
      value = value.indexOf("://") === -1 ? "http://" + value : value;
    }
    setData({ ...data, [key]: value });
  };

  const isValid = (data) => {
    return data.title && isValidUrl(data.redirectUrl);
  };
  const isValidData = isValid(data);

  const chainVerifier = async () => {
    const currentNetwork = await window.ethereum.request({
      method: "eth_chainId",
    });

    const targetChainId = toHexString(activeChain.id);

    if (targetChainId !== currentNetwork) {
      setError(
        `Please switch to the ${activeChain.name} (${targetChainId}) network in Metamask to create this xefers Link request.`
      );
      await window.ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ targetChainId }],
      });
      return;
    }
  };

  useEffect(() => {
    chainVerifier();
  }, []);
  const create = async () => {
    setError(undefined);

    chainVerifier();

    if (!isValidData) {
      setError(
        "Please provide a xefers Link page title and valid redirect URL."
      );
      return;
    }

    setLoading(true);

    let res = { ...data };
    res["chainId"] = activeChain.id;

    try {
      const rewardValue = data.rewardChecked
        ? data.reward
          ? parseFloat(data.reward)
          : 0
        : 0;

      const contract = await deployContract(
        data.title,
        rewardValue,
        data.redirectUrl
      );

      res["address"] = contract.address;
      setContract(contract.address);
      res["redirectUrl"] = redirectUrl(contract.address);
      res["contractUrl"] = getExplorerUrl(activeChain, res.address);

      setResult(res);

      const LinkHash = await createLink({
        id: res.address || new Date().getTime().toString(),
        title: data.title,
        redirectUrl: data.redirectUrl,
        reward: rewardValue,
        owner: account,
        chainId: activeChain.id,
      });

      console.log(LinkHash);
    } catch (e) {
      console.error("error creating xefers Link", e);
      setError(e.message || e.toString());
    } finally {
      setLoading(false);
    }
  };

  const setDemoData = (e) => {
    e.preventDefault();
    setData({ ...DEMO });
  };

  const openModal = () => {
    setIsModalVisible(true);
  };

  const closeModal = () => {
    setIsModalVisible(false);
  };

  const fundContract = async () => {
    if (typeof window.ethereum !== "undefined") {
      setbuttonState("Confirming transaction...");
      const signer = await getSigner();

      const contractAddress = contractAdd; // Use the correct contract address
      const rewardAmount = ethers.utils.parseEther(data.reward);

      // Create the transaction object
      const tx = {
        to: contractAddress,
        value: rewardAmount,
      };

      console.log("Transaction object:", tx);

      const balance = await signer.getBalance();
      if (balance.lt(rewardAmount)) {
        console.error("Insufficient funds for this transaction.");
        return;
      }

      try {
        // Send the transaction
        const transactionResponse = await signer.sendTransaction(tx);
        console.log("Transaction sent:", transactionResponse);

        const receipt = await transactionResponse.wait();

        console.log("Transaction mined:", receipt);

        closeModal();
        setbuttonState("Confirm");
        setContract("");
      } catch (error) {
        console.error("Transaction failed:", error);
      }
    }
  };

  if (result) {
    return (
      <div className="p-2 bg-white mx-auto w-full sm:w-[90%] md:w-[70%] lg:w-[60%] rounded-lg shadow-lg relative">
        <Result
          className="font-Oxanium text-center"
          icon={
            <img
              className="mx-auto w-20 h-20 sm:w-24 sm:h-24"
              src={logo2}
              alt="Logo"
            />
          }
          title="Your Link Request"
          subTitle="Your request for a Xefers link has been generated and is prepared for sharing."
          extra={[
            <button
              onClick={openModal}
              key="viewContract"
              className="bg-none text-[#283046] py-2 px-4 rounded-md border border-[#283046] transition-all duration-300 ease-in-out w-full sm:w-auto"
            >
              {data.reward > 0 ? (
                "Fund created contract"
              ) : (
                <a
                  className="hover:text-gray-500"
                  href={result.contractUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  View created contract
                </a>
              )}
            </button>,
            <a
              href={result.redirectUrl}
              target="_blank"
              rel="noopener noreferrer"
              key="shareURL"
            >
              <button className="bg-none text-[#283046] py-2 px-4 rounded-md border border-[#283046] transition-all duration-300 ease-in-out w-full sm:w-auto mt-2 sm:mt-0">
                Share this URL
              </button>
            </a>,
          ]}
        />

        {/* Modal for Viewing Contract */}
        {data.reward > 0 && (
          <Modal
            visible={isModalVisible}
            onCancel={closeModal}
            footer={null}
            centered
            width={600}
            className="modal-custom"
          >
            <div className="mx-auto mt-8 p-4 rounded-md shadow-md font-Oxanium text-[#1d2132]">
              <h2 className="text-start text-lg sm:text-xl font-semibold mb-4">
                Fund the contract (Only supports BTTC token)
              </h2>
              <Form layout="vertical">
                <Form.Item
                  name="reward"
                  label={
                    <span className="font-Oxanium text-[#1d2132]">Reward</span>
                  }
                  rules={[
                    { required: true, message: "Please enter the reward!" },
                  ]}
                >
                  <Input
                    placeholder={data.reward}
                    className="placeholder-gray-400 border-gray-600 focus:border-gray-400"
                    value={data.reward}
                    onChange={(e) => updateData("reward", e.target.value)}
                  />
                </Form.Item>
                <Form.Item>
                  <button
                    className="bg-[#1d2132] font-Oxanium text-white py-2 px-4 rounded-lg shadow-md hover:bg-[#283046] hover:shadow-lg transition-all duration-300 ease-in-out w-full"
                    onClick={fundContract}
                  >
                    {buttonState}
                  </button>
                </Form.Item>
              </Form>
            </div>
          </Modal>
        )}
      </div>
    );
  }

  return (
    <div>
      <Row>
        <Col span={24}>
          <Card
            className="create-form font-Oxanium white boxed"
            title={
              <h1 className="text-xl text-gray-700 font-bold">
                Let's start your Xefer campaign
              </h1>
            }
          >
            <br />
            <h1 className="vertical-margin">Destination Url</h1>
            <Input
              className="font-Oxanium hover:border-black"
              placeholder=" URL (e.g. https://sunpump.meme)"
              value={data.redirectUrl}
              onChange={(e) => updateData("redirectUrl", e.target.value)}
            />
            <br />
            <br />
            <h1 className="vertical-margin">Set your Campaign title:</h1>
            <Input
              placeholder="The title to your campaign"
              value={data.title}
              className="font-Oxanium hover:border-black"
              onChange={(e) => updateData("title", e.target.value)}
            />
            <br />
            <br />
            <Checkbox
              className="hover:border-black"
              checked={data.rewardChecked}
              onChange={(e) => updateData("rewardChecked", e.target.checked)}
            />
            &nbsp; Enable referal rewards. (Support BTTC token)
            <br />
            {data.rewardChecked && (
              <div className="font-Oxanium mt-4">
                <Input
                  placeholder="Reward amount (in BTT)"
                  value={data.reward}
                  onChange={(e) => updateData("reward", e.target.value)}
                />
                <p className="mt-2">
                  Make sure to fund the contract after deployment for it to
                  distribute rewards.
                </p>
              </div>
            )}
            <br />
            <div className="flex justify-start space-x-4 items-center">
              <button
                className="bg-[#1d2132] text-white py-2 px-4 rounded-lg shadow-md hover:bg-[#283046] hover:shadow-lg transition-all duration-300 ease-in-out"
                onClick={create}
              >
                {!error && !result && loading
                  ? "Waiting..."
                  : "Create Contract"}
              </button>

              <button
                className="bg-none text-[#283046] py-2 px-4 rounded-md border border-1 border-[#283046] transition-all duration-300 ease-in-out"
                href="#"
                onClick={setDemoData}
              >
                Set demo data
              </button>
            </div>
            <br />
            <br />
            {error && (
              <div>
                <div className="error-text">{error}</div>
              </div>
            )}
          </Card>
        </Col>
      </Row>
    </div>
  );
}

export default CreateCampaign;
