import React, { useState, useEffect } from "react";
import { Button, Input, Table } from "antd";
import { APP_NAME } from "../util/constants";
import { abbreviate, col, getDateStringFromTimestamp } from "../util";
import { LineChart } from "react-chartkick";
import Chart from 'chart.js/auto'; // Make sure this is included


import axios from "axios";


const COLUMNS = [
  col("tx_hash", row => abbreviate(row || '', 6)),
  col("from_address"),
  col("value"),
  col("gas_spent"),
  col("block_signed_at", row => getDateStringFromTimestamp(row, true)),
];
const TestChart = () => {
  const data = {
    '2024-01-01': 3,
    '2024-01-02': 1,
    '2024-01-03': 2,
  };

  return <LineChart data={data} xtitle="Date" ytitle="Value" />;
};

function History({ activeChain }) {
  const [address, setAddress] = useState("0x2FC4C46cfe5c355777d2Adcda7251C0797b5AfFB");
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState(["hey"]);

  const fetchHistory = async (addr) => {
    const url = `https://api-testnet.bttcscan.com/api?module=account&action=txlist&address=${addr}&startblock=0&endblock=99999999&sort=asc`;

    try {
      setLoading(true);
      const response = await axios.get(url);
      if (response.data.result) {
        setData(response.data.result);
      } else {
        setData([]);
      }
    } catch (error) {
      console.error("Error fetching transactions:", error);
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (address) {
      fetchHistory(address);
    }
  }, [address]);

  return (
    <div>

      <TestChart/>
      <p>
        This page can be used to lookup {APP_NAME} transactions against a given&nbsp;
        {activeChain.name} address.
      </p>
      <Input
        value={address}
        onChange={(e) => setAddress(e.target.value)}
        prefix="Address"
      ></Input>
      <br />
      <p></p>

      &nbsp;
      <Button onClick={fetchHistory} disabled={loading} loading={loading}>
        View referrals
      </Button>&nbsp;
      {address && data && <a href={`${activeChain.url}address/${address}`} target="_blank" rel="noreferrer">View on {activeChain.name}</a>}
      <br />
      <hr />
      {data && (
        <div>
          <h1>Referral Summary</h1>
          {/* Create a line chart grouped by the day */}
          <LineChart
            data={data.reduce((acc, row) => {
              const date = getDateStringFromTimestamp(row.block_signed_at, false);
              if (!acc[date]) {
                acc[date] = 0;
              }
              acc[date] += 1
              return acc;
            }, {})}
            xtitle="Date"
            ytitle="Referrals (Count)"
          />
          {/* <LineChart
            data={data.map((row) => [
              getDateStringFromTimestamp(row.block_signed_at, true),
              row.value,
            ])}
            xtitle="Date"
            ytitle="Value"
          /> */}
          <br />
          <h2>Transaction list</h2>
          <Table
            dataSource={data}
            columns={COLUMNS}
            className="pointer"
            onRow={(record, rowIndex) => {
              return {
                onClick: (event) => {
                  console.log("event", event.target.value);
                  window.open(
                    `${activeChain.url}tx/${record.tx_hash}`,
                    "_blank"
                  );
                }, // click row
                onDoubleClick: (event) => { }, // double click row
                onContextMenu: (event) => { }, // right button click row
                onMouseEnter: (event) => { }, // mouse enter row
                onMouseLeave: (event) => { }, // mouse leave row
              };
            }}
          />
        </div>
      )}
    </div>
  );
}

export default History;
