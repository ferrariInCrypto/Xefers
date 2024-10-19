import React, { useState } from "react";
import {
  Input,
  Row,
  Col,
  Steps,
  Card,
  Checkbox,
  Result,
} from "antd";
import {
  redirectUrl,
  getExplorerUrl,
  toHexString,
  isValidUrl,
} from "../util";
import { CREATE_STEPS, EXAMPLE_FORM } from "../util/constants";
import { deployContract } from "../contractInfo/Contract";
import { createLink } from "../util/db";
import logo2 from "../assets/logo2.png"

function CreateRequest({ activeChain, account }) {
  const [data, setData] = useState({ reward: 0, rewardChecked: false });
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

    // Make sure current network is correct based on current metamask network.
    if (targetChainId !== currentNetwork) {
      setError(
        `Please switch to the ${activeChain.name} (${targetChainId}) network in metamask to create this xefers Link request.`
      );
      await window.ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ targetChainId }], // chainId must be in hexadecimal numbers
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

    // Format files for upload.
    let res = { ...data };
    res["chainId"] = activeChain.id;

    try {
      // 1) deploy base contract with metadata,
      if (true) {
        const contract = await deployContract(
          data.title,
          data.reward,
          data.redirectUrl
        );
   
        res["address"] = contract.address;
        res["redirectUrl"] = redirectUrl(contract.address);

     
        res["contractUrl"] = getExplorerUrl(activeChain, res.address);
      }

      // Result rendered after successful doc upload + contract creation.
      setResult(res);

      const result = await createLink({
        id: res.address || new Date().getTime().toString(),
        title: data.title,
        redirectUrl: data.redirectUrl,
        reward: data.reward,
        owner: account,
        chainId: activeChain.id,
      });

      console.log(result)
    } catch (e) {
      console.error("error creating xefers Link", e);
      setError(e.message || e.toString());
    } finally {
      setLoading(false);
    }
  };


  const setDemoData = (e) => {
    e.preventDefault();
    setData({ ...EXAMPLE_FORM });
  };

  if (result) {
    return (
      <Result
        className="font-Ubuntu"
        icon={<img className="mx-auto" src={logo2} height={100} width={100} />}
        title="Your Link request"
        subTitle="Your request for a Xefers link has been generated and is prepared for sharing."
        extra={[
          <button className="bg-none text-[#283046] py-2 px-4 rounded-md border border-1 border-[#283046]  transition-all duration-300 ease-in-out">
            <a
              className="hover:text-gray-500"
              href={result.contractUrl}
              target="_blank"
            >
              View created contract
            </a>
          </button>,
          <button className="bg-none text-[#283046] py-2 px-4 rounded-md border border-1 border-[#283046]  transition-all duration-300 ease-in-out">
            <a
              className="hover:text-gray-500"
              href={result.redirectUrl}
              target="_blank"
            >
              Share this url
            </a>
          </button>,
        ]}
      />
    );
  }

  return (
    <div>
      <Row>
        <Col span={24}>
          <Card
            className="create-form font-Ubuntu white boxed"
            title={
              <h1 className="text-xl text-gray-700 font-bold">Start your own xefer campaign</h1> // Adjust text size with text-4xl and add font-bold
            }
          >
            <br />
            <h1 className="vertical-margin">Set your Campaign title:</h1>
            <Input
              placeholder="The title to your campaign"
              value={data.title}
              className="font-Ubuntu hover:border-black"
              onChange={(e) => updateData("title", e.target.value)}
            />
            <br />
            <br />
            <p>
              <h1 className="vertical-margin">
                Visitors will sign a message with their address and be
                redirected to the URL below.
              </h1>
            </p>
            <Input
              className="font-Ubuntu hover:border-black"
              placeholder="redirect URL (e.g. https://sunpump.meme)"
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
            reward per address.
            <br />
            {data.rewardChecked && (
              <div className="font-Ubuntu mt-4">
                <Input
                  placeholder="Reward amount (in ETH)"
                  value={data.reward}
                  prefix="Reward:"
                  onChange={(e) => updateData("reward", e.target.value)}
                />
                <p className="mt-2">
                  Make sure to fund the contract after deployment for it to
                  distribute rewards.
                </p>
              </div>
            )}
            <br />
            <div className="flex justify-start space-x-4  items-center">
              <button
                className="bg-[#1d2132] text-white py-2 px-4 rounded-lg shadow-md hover:bg-[#283046] hover:shadow-lg transition-all duration-300 ease-in-out"
                onClick={create}
              >
                {!error && !result && loading ? "Waiting..." : "Create  Contract"}
              </button>

              <button
                className="bg-none text-[#283046] py-2 px-4 rounded-md border border-1 border-[#283046]  transition-all duration-300 ease-in-out"
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
          <div className="white boxed   font-Ubuntu">
            <Steps
              className="font-Ubuntu "
              size="small"
              current={1}
              items={CREATE_STEPS}
            />
          </div>
        </Col>
      </Row>
    </div>
  );
}

export default CreateRequest;
