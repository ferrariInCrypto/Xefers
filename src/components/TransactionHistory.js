import { Card, Col, Row, Spin } from "antd";
import React, { useEffect, useState } from "react";
import { getLinksForOwner } from "../util/storeDb";
import { CHAIN } from "../util/chainInfo";

export default function TransactionHistory({ account, activeChain }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState();
  const [links, setLinks] = useState([]);

  const getExplorerUrl = (activeChain, hash, useTx) =>
    `${activeChain?.url || CHAIN.url}${useTx ? "tx/" : "address/"}${hash}`;

  const getDateStringFromTimestamp = (ts, showTime) => {
    const d = new Date(ts);
    if (showTime) {
      return `${d.toLocaleDateString()} ${d.toLocaleTimeString()}`;
    }
    return d.toLocaleDateString();
  };

  useEffect(() => {
    if (account) {
      getLinks(account);
    }
  }, [account]);

  async function getLinks(address) {
    setLoading(true);
    setError();
    try {
      const res = await getLinksForOwner(address);
      const results = res.data;
      console.log("links", results);
      setLinks(results);
    } catch (e) {
      console.log(e);
      setError("Error getting links: " + e.message);
    } finally {
      setLoading(false);
    }
  }

  const title = (
    <h1 className="font-Oxanium text-gray-700 text-lg md:text-xl">
      History of:{" "}
      <span className="text-gray-400">
        {account.slice(0, 9) + "..." + account.slice(-4)}
      </span>
    </h1>
  );

  return (
    <div className="p-4">
      <div className="mb-4">{title}</div>

      <Card className="font-Oxanium mt-4">
        {loading && <Spin tip="Loading..." />}
        {!loading && links.length === 0 && <p>No links found.</p>}
        {error && <p className="error-text">{error}</p>}

        <Row gutter={[16, 16]}>
          {links.map((link, i) => {
            const { data } = link;
            const explorerUrl = getExplorerUrl(activeChain, data.id);

            return (
              <Col
                xs={24}
                sm={12}
                lg={8}
                key={i}
                className="flex justify-center"
              >
                <Card
                  title={data.title}
                  bordered={true}
                  className="transition-transform text-gray-600 font-Oxanium transform hover:-translate-y-1 hover:shadow-lg cursor-pointer w-full"
                  onClick={() => {
                    console.log("clicked", data);
                    window.open(explorerUrl, "_blank");
                  }}
                >
                  <p className="font-semibold text-gray-500">
                    URL:{" "}
                    <a
                      className="text-gray-400"
                      href={data.redirectUrl}
                      target="_blank"
                      rel="noreferrer"
                    >
                      {data.redirectUrl}
                    </a>
                    <br />
                    {!isNaN(data.createdAt) && (
                      <>
                        <span>Timestamp:</span>{" "}
                        <span className="text-gray-400">
                          {getDateStringFromTimestamp(data.createdAt, true)}
                        </span>
                      </>
                    )}
                  </p>
                </Card>
              </Col>
            );
          })}
        </Row>
      </Card>
    </div>
  );
}
