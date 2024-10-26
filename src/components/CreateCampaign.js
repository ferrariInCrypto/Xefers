import React, { useState } from "react";
import { Input, Row, Col, Steps, Card, Checkbox, Result } from "antd";
import { redirectUrl, getExplorerUrl, toHexString, isValidUrl } from "../util";
import { deployContract } from "../contractInfo/Contract";
import { createLink } from "../util/storeDb";
import logo2 from "../assets/logo2.png";

import { ethers } from "ethers";
import { XEFERS_CONTRACT } from "./Metadata";

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

export const refer = async (contractAddress) => {
  if (!contractAddress) {
    return {};
  }

  const signer = await getSigner();
  const signatureContract = new ethers.Contract(
    contractAddress,
    XEFERS_CONTRACT.abi,
    signer
  );
  const result = await signatureContract.refer();
  return result;
};

function CreateCampaign({ activeChain, account }) {
  const DEMO = {
    title: "Marketing Campaign for SunPump.meme",
    redirectUrl: "https://sunpump.meme/",
    reward: 0,
  };

  const STEPS = [
    {
      title: "Complete the Fields",
      description: "Provide the necessary information to register your link.",
    },
    {
      title: "Generate Your Links",
      description:
        "You need to authorize the creation request for the 'Xefer' contract.",
    },
    {
      title: "Await URL Creation",
      description:
        "Your contract and referral URL will be prepared for others to access.",
    },
  ];

  const [data, setData] = useState({
    title: "",
    redirectUrl: "",
    reward: "",
    rewardChecked: false,
  });
  const [error, setError] = useState();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState();

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

  const create = async () => {
    setError(undefined);

    const currentNetwork = await window.ethereum.request({
      method: "eth_chainId",
    });

    const targetChainId = toHexString(activeChain.id);

    // Ensure the correct network
    if (targetChainId !== currentNetwork) {
      setError(
        `Please switch to the ${activeChain.name} (${targetChainId}) network in metamask to create this xefers Link request.`
      );
      await window.ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ targetChainId }],
      });
      return;
    }

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
      res["redirectUrl"] = redirectUrl(contract.address);
      res["contractUrl"] = getExplorerUrl(activeChain, res.address);

      setResult(res);

      const result = await createLink({
        id: res.address || new Date().getTime().toString(),
        title: data.title,
        redirectUrl: data.redirectUrl,
        reward: rewardValue,
        owner: account,
        chainId: activeChain.id,
      });

      console.log(result);
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

  if (result) {
    return (
      <div className="p-2 bg-white rounded-lg shadow-lg">
        <Result
          className="font-Oxanium"
          icon={
            <img className="mx-auto" src={logo2} height={100} width={100} />
          }
          title="Your Link Request"
          subTitle="Your request for a Xefers link has been generated and is prepared for sharing."
          extra={[
            <button className="bg-none text-[#283046] py-2 px-4 rounded-md border border-1 border-[#283046] transition-all duration-300 ease-in-out">
              <a
                className="hover:text-gray-500"
                href={result.contractUrl}
                target="_blank"
              >
                View created contract
              </a>
            </button>,
            <button className="bg-none text-[#283046] py-2 px-4 rounded-md border border-1 border-[#283046] transition-all duration-300 ease-in-out">
              <a
                className="hover:text-gray-500"
                href={result.redirectUrl}
                target="_blank"
              >
                Share this URL
              </a>
            </button>,
          ]}
        />
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
            <h1 className="vertical-margin">Set your Campaign title:</h1>
            <Input
              placeholder="The title to your campaign"
              value={data.title}
              className="font-Oxanium hover:border-black"
              onChange={(e) => updateData("title", e.target.value)}
            />
            <br />
            <br />
            <h1 className="vertical-margin">
              Visitors will sign a message with their address and be redirected
              to the URL below.
            </h1>
            <Input
              className="font-Oxanium hover:border-black"
              placeholder="Redirect URL (e.g. https://sunpump.meme)"
              value={data.redirectUrl}
              onChange={(e) => updateData("redirectUrl", e.target.value)}
            />
            <br />
            <br />
            <Checkbox
              className="hover:border-black"
              checked={data.rewardChecked}
              onChange={(e) => updateData("rewardChecked", e.target.checked)}
            />
            &nbsp;The referrer will be rewarded when the link is used, with one
            reward per address. (Only support native BTTC for now)
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
      <Row>
        <Col span={24}>
          <div className="white boxed font-Oxanium">
            <Steps
              className="font-Oxanium"
              size="small"
              current={1}
              items={STEPS}
            />
          </div>
        </Col>
      </Row>
    </div>
  );
}

export default CreateCampaign;
