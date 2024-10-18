import React, { useState, useEffect } from "react";
import { Input, Table } from "antd";
import { getTransactions } from "../util/api";
import { abbreviate, col, getDateStringFromTimestamp } from "../util";
import { LineChart } from "react-chartkick";

const COLUMNS = [
  col("tx_hash", (row) => abbreviate(row || "", 6)),
  col("from_address"),
  col("value"),
  col("gas_spent"),
  col("block_signed_at", (row) => getDateStringFromTimestamp(row, true)),
];

function History({ activeChain }) {
  const [address, setAddress] = useState("0x2FC4C46cfe5c355777d2Adcda7251C0797b5AfFB");
  const [loading, setLoading] = useState();
  const [data, setData] = useState();

  useEffect(() => {
    setData(undefined);
  }, [activeChain]);

  const fetchHistory = async () => {
    if (!address || !activeChain) {
      alert("Address and chainId are required");
      return;
    }

    setLoading(true);
    try {
      alert("This feature would be available in future")
      return
      // const res = await getTransactions(activeChain.id, '0x2FC4C46cfe5c355777d2Adcda7251C0797b5AfFB');
      
      // console.log(res)
      // setData(res.data.data.items);
      // console.log(data);
    } catch (e) {
      console.error(e);
      alert("error getting signdata" + e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <p>
      Enter the BitTorrent Chain Donau address in the input field and search for Xefers transactions associated with that address.
      </p>
      <Input
        value={address}
        className="hover:border hover:border-1 hover:border-gray-600"
        onChange={(e) => setAddress(e.target.value)}
        prefix="Search Address :"
      ></Input>

      <br />
 
      &nbsp;
      <button
        className="bg-[#1d2132] mt-4 text-white py-2 px-4 rounded-lg shadow-md hover:bg-[#283046] hover:shadow-lg transition-all duration-300 ease-in-out"
        onClick={fetchHistory}
        disabled={loading}
        loading={loading}
      >
        View referrals
      </button>
      <br/>
      &nbsp;
      {address && data && (
        <a
          href={`${activeChain.url}address/${address}`}
          target="_blank"
          rel="noreferrer"
        >
          View on {activeChain.name}
        </a>
      )}
      <br />
   
      {data && (
        <div>
          <h1>Referral Summary</h1>
          {/* Create a line chart grouped by the day */}
          <LineChart
            data={data.reduce((acc, row) => {
              const date = getDateStringFromTimestamp(
                row.block_signed_at,
                false
              );
              if (!acc[date]) {
                acc[date] = 0;
              }
              acc[date] += 1;
              return acc;
            }, {})}
            xtitle="Date"
            ytitle="Referrals (Count)"
          />

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
                onDoubleClick: (event) => {}, // double click row
                onContextMenu: (event) => {}, // right button click row
                onMouseEnter: (event) => {}, // mouse enter row
                onMouseLeave: (event) => {}, // mouse leave row
              };
            }}
          />
        </div>
      )}
    </div>
  );
}

History.propTypes = {};

export default History;
