import { InfoCircleOutlined } from "@ant-design/icons";
import { Button, Card, Modal } from "antd";
import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import {
  getMetadata,
  refer,
} from "../contract/Contract";
import { getRpcError } from "../util";




export default function LinkRedirect({ activeChain, account, provider }) {
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = useState();
  const [data, setData] = useState({});
  const [success, setSuccess] = useState(false);

  const { contractAddress } = useParams();

  async function completeReferral() {
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
      // Unpack the response
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
        message =
          "You may be connected to the wrong network. Please check selected network and metamask and try again.";
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
    return <div>Confirm the transaction in wallet</div>;
  }

  const { redirectUrl, title, owner, reward } = data;
  const fullRedirectUrl = `${redirectUrl || ""}?ref=${account}`;

  const alreadyReferred = error && error?.indexOf("already referred") !== -1;
  const walletError = error && error?.indexOf("wallet to continue") !== -1;

  if (alreadyReferred) {
    return (
      <div>
        <span className="error-text">{error}</span>
        <br />
        <br />
        {alreadyReferred && (
          <div>
            <p>You may still continue to the page: {redirectUrl}</p>
            <Button type="primary" onClick={() => window.open(fullRedirectUrl)}>
              Continue to page
            </Button>
          </div>
        )}
      </div>
    );
  }



  const cardTitle = (
    <span className="flex items-center justify-between">
      Credit your referral&nbsp;
      <InfoCircleOutlined  />
    </span>
  );

  return (
    <div>
      <Card className="font-Ubuntu text-md"  title={cardTitle}>

        <div className=" text-md">
        {title && <p><b>Title:</b> {title}</p>}
        {walletError && <p>This is a xefers referral page.</p>}

        {redirectUrl && <div className="flex justify-start items-center space-x-2"><p><b>Redirect URL:</b></p> <p className=" underline underline-offset-1"> {redirectUrl}</p></div>}
        {!error && (
          <p className=" text-gray-500">
            You will be redirected to the following page when you click the
            button below:
          </p>
        )}
        {error && <div className="error-text">{error}</div>}
        <br/>
        </div>
        {!success && (
          <button
            disabled={!redirectUrl || !account || error}
            className="bg-[#1d2132] text-white py-2 px-4 rounded-lg shadow-md hover:bg-[#283046] hover:shadow-lg transition-all duration-300 ease-in-out"
            onClick={() => {
              completeReferral();
            }}
          >
            Continue to page
          </button>
        )}
      </Card>


      <Modal
        title={<span className="secondary-text">Referral successful</span>}
        open={success}
        okButtonProps={{ style: { display: "none" } }}
        cancelButtonProps={{ style: { display: "none" } }}
        onCancel={() => setSuccess(false)}
      >
        <hr />
        <br/>
        <a className="underline hover:text-gray-500" href={fullRedirectUrl} rel="noreferrer">
          {fullRedirectUrl}
        </a>
        <br />
        <br />
        <p className=" text-gray-500">By clicking on the link you will be redirected to following page:</p>
      </Modal>
    </div>
  );
}
