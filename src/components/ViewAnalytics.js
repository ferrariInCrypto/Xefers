import React, { useState, useEffect } from "react";
import { ColumnChart, AreaChart, LineChart, PieChart } from "react-chartkick";
import "chartkick/chart.js";
import axios from "axios";

function History() {
  const [address, setAddress] = useState("");
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState([]);

  const getDateStringFromTimestamp = (ts, showTime) => {
    const d = new Date(ts);
    return showTime
      ? `${d.toLocaleDateString()} ${d.toLocaleTimeString()}`
      : d.toLocaleDateString();
  };

  const checkWalletConnection = async () => {
    const e = window.ethereum;
    if (!e) return;
    try {
      const accounts = await e.request({ method: "eth_accounts" });
      if (accounts.length > 0) setAddress(accounts[0]);
    } catch (err) {
      console.error(err);
    }
  };

  const getTransactionHistory = async (addr) => {
    const url = `https://previewnet.mirrornode.hedera.com/api/v1/accounts/${addr}`
 

    try {
      setLoading(true);
      const response = await axios.get(url);
      console.log(response.data.transactions)
      if (response.data.transactions) {
        setData(response.data.transactions);
      } else {
        setData([]);
      }
    } catch (error) {
      console.error("Error fetching Hedera transactions:", error);
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkWalletConnection();
  }, []);

  useEffect(() => {
    if (address) getTransactionHistory(address);
  }, [address]);

  const chartData = Object.entries(
    data.reduce((acc, row) => {
      const timestamp = row.consensus_timestamp; // Use correct timestamp field from the API
      const date = getDateStringFromTimestamp(Number(timestamp) * 1000, false); // Convert properly
      if (!acc[date]) acc[date] = 0;
      acc[date] += 1;
      return acc;
    }, {})
  ).map(([date, count]) => [date, count]);

  return (
    <div className="font-Oxanium p-4">
      {loading ? (
        <p className="text-center text-gray-600">Loading...</p>
      ) : data.length > 0 ? (
        <div>
          <h1 className="text-gray-700 text-lg sm:text-xl text-start">
            View Analytics for:{" "}
            <span className="text-gray-400">
              {address.slice(0, 6) + "..." + address.slice(-4)}
            </span>
          </h1>
          <br />

          <div className="flex flex-col lg:flex-row gap-4">
            {/* Left Column */}
            <div className="flex flex-col gap-4 w-full lg:w-1/2">
              <div className="shadow-lg p-4 bg-white rounded-lg w-full">
                <LineChart data={chartData} />
              </div>
              <div className="shadow-lg p-4 bg-white rounded-lg w-full">
                <AreaChart data={chartData} />
              </div>
            </div>

            {/* Right Column */}
            <div className="flex flex-col gap-4 w-full lg:w-1/2">
              <div className="shadow-lg p-4 bg-white rounded-lg w-full">
                <PieChart data={chartData} />
              </div>
              <div className="shadow-lg p-4 bg-white rounded-lg w-full">
                <ColumnChart data={chartData} />
              </div>
            </div>
          </div>
        </div>
      ) : (
        <p className="text-center text-gray-600">
          No transaction record found.
        </p>
      )}
    </div>
  );
}

export default History;
