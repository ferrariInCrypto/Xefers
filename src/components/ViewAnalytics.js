import React, { useState, useEffect } from "react";
import { ColumnChart, AreaChart, PieChart } from "react-chartkick";
import "chartkick/chart.js";
import axios from "axios";

function History() {
  const [address, setAddress] = useState("");
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState([]);


   const getDateStringFromTimestamp = (ts, showTime) => {
    const d = new Date(ts);
    if (showTime) {
      return `${d.toLocaleDateString()} ${d.toLocaleTimeString()}`;
    }
    return d.toLocaleDateString();
  };

  const checkWalletConnection = async () => {
    const e = window.ethereum;
    if (!e) {
      return;
    }
    try {
      const accounts = await e.request({ method: "eth_accounts" });
      if (accounts.length > 0) {
        setAddress(accounts[0]);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const getTransactionHistory = async (addr) => {

    const url = `https://api-testnet.bttcscan.com/api?module=account&action=txlist&address=${addr}&startblock=0&endblock=99999999&sort=asc`;

    const response = await axios.get(url);
    console.log("API Response:", response.data); // Log the full response

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
    checkWalletConnection();
  }, []);

  useEffect(() => {
    if (address) {
      getTransactionHistory(address);
    }
  }, [address]);

  const chartData = Object.entries(

    data.reduce((acc, row) => {
      const timestamp = row.timeStamp; // Access the correct property
      console.log("Block Signed At Timestamp:", timestamp); //
      const date = getDateStringFromTimestamp(timestamp * 1000, false);
      console.log("Block Signed At Timestamp:", row.block_signed_at);

      console.log("Formatted Date:", date); // Log the date for debugging
      if (!acc[date]) {
        acc[date] = 0;
      }
      acc[date] += 1;
      return acc;
    }, {})
  ).map(([date, count]) => [date, count]);

  return (
    <div className=" font-Oxanium">
      {loading ? (
        <p>Loading...</p>
      ) : data.length > 0 ? (
        <div>
          <h1 className="font-Oxanium text-gray-700 text-xl">
            View Analytics :{" "}
            <span className="text-gray-400">
              {" "}
              {address.slice(0, 6) + "..." + address.slice(-6)}
            </span>
          </h1>
          <br />

          <div className="font-Oxanium flex space-x-4">
            {/* Left Column with ColumnChart and AreaChart */}
            <div className="flex flex-col space-y-4 w-2/3">
              <div className="shadow-lg p-4 bg-white rounded-lg">
                <ColumnChart data={chartData} />
              </div>
              <div className="shadow-lg p-4 bg-white rounded-lg">
                <AreaChart data={chartData} />
              </div>
            </div>

            {/* Right Column with PieChart */}
            <div className="shadow-lg p-4 bg-white rounded-lg w-1/3">
              <PieChart data={chartData} />
            </div>
          </div>
        </div>
      ) : (
        <p>No transaction record found.</p>
      )}
    </div>
  );
}

export default History;
