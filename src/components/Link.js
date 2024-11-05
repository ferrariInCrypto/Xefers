import { InfoCircleOutlined } from "@ant-design/icons";
import { Button, Card, Modal, Spin } from "antd";
import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { XEFERS_CONTRACT } from "../contractInfo/Metadata";
import { ethers } from "ethers";


export default function LinkRedirect({ activeChain, account, provider }) {
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState();
  const [data, setData] = useState({});
  const [success, setSuccess] = useState(false);

  const { contractAddress } = useParams();

   const getRpcError = (error) => {
    if (error?.data?.message) {
      return error.data.message;
    } else if (error?.reason) { 
      return error.reason;
    } else if (error?.message) {
      return error.message;
    }
    return JSON.stringify(error);
  };


  const getSigner = async () => {
    let signer;
    await window.ethereum.enable();
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    signer = provider.getSigner();
    return signer;
  };

   const getMetadata = async (contractAddress) => {
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



   const refer = async (contractAddress) => {
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
  


  async function confirmReferral() {
    if (!contractAddress || !account) {
      return;
    }
    setLoading(true);
    try {
      const result = await refer(contractAddress);
      console.log(result);
      setSuccess(true);
    } catch (e) {
      console.log(e);
      setError("Error completing referral: " + getRpcError(e));
    } finally {
      setLoading(false);
    }
  }

  async function load() {
    if (!contractAddress || !account) {
      return;
    }
    setLoading(true);
    try {
      const res = await getMetadata(contractAddress);
      setData({
        title: res[0],
        redirectUrl: res[1],
        owner: res[2],
        reward: res[3],
      });
    } catch (e) {
      console.log(e);
      let message = getRpcError(e);
      if (message.indexOf("call revert") !== -1) {
        message = "You may be connected to the wrong network. Please check selected network and Metamask and try again.";
      }
      setError("Error reading link data: " + message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (account) {
      setError(undefined);
      load();
    } else {
      setError("Please connect your wallet to continue.");
    }
  }, [provider, account]);

  if (loading) {
    return <div className="flex justify-center items-center h-screen"><Spin tip="Loading..." /></div>;
  }

  const { redirectUrl, title, owner, reward } = data;
  const fullRedirectUrl = `${redirectUrl || ""}?ref=${account}`;

  const alreadyReferred = error && error.indexOf("already referred") !== -1;
  const walletError = error && error.indexOf("wallet to continue") !== -1;

  if (alreadyReferred) {
    return (
      <div className="p-4">
        <span className="text-red-500">{error}</span>
        <br />
        <br />
        <div>
          <p>You may still continue to the page: {redirectUrl}</p>
          <Button type="primary" onClick={() => window.open(fullRedirectUrl)}>
            Continue to page
          </Button>
        </div>
      </div>
    );
  }

  const cardTitle = (
    <span className="flex items-center justify-between text-lg font-semibold">
      Claim your referral <InfoCircleOutlined />
    </span>
  );

  return (
    <div className="flex flex-col items-center p-4">
      <Card className="font-Oxanium text-md w-full max-w-md shadow-lg rounded-lg" title={cardTitle}>
        <div className="text-md mb-4">
          {title && <p><b>Title:</b> {title}</p>}
          {walletError && <p className="text-gray-600">This is a Xefers referral page.</p>}
          {redirectUrl && (
            <div className="flex justify-start items-center space-x-2">
              <p><b>Redirect URL:</b></p>
              <p className="underline underline-offset-1">{redirectUrl}</p>
            </div>
          )}
          {!error && (
            <p className="text-gray-500">
              You will be redirected to the following page when you click the button below:
            </p>
          )}
          {error && <div className="text-red-600">{error}</div>}
        </div>
        <button
          disabled={!redirectUrl || !account || error}
          className="w-full bg-[#1d2132] text-white py-2 px-4 rounded-lg shadow-md hover:bg-[#283046] hover:shadow-lg transition-all duration-300 ease-in-out"
          onClick={confirmReferral}
        >
          Continue to page
        </button>
      </Card>

      <Modal
        title={<span className="text-xl font-Oxanium font-semibold">Referral Successful</span>}
        open={success}
        okButtonProps={{ style: { display: "none" } }}
        cancelButtonProps={{ style: { display: "none" } }}
        onCancel={() => setSuccess(false)}
      >
        <hr />
        <br />
        <a className="underline text-gray-500 font-Oxanium hover:text-gray-700" href={fullRedirectUrl} rel="noreferrer">
          {fullRedirectUrl}
        </a>
        <br />
        <br />
        <p className="text-gray-500 font-Oxanium">By clicking on the link, you will be redirected to the following page:</p>
      </Modal>
    </div>
  );
}
