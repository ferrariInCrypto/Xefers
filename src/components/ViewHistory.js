import React, { useState, useEffect } from "react";
import { getDateStringFromTimestamp } from "../util";
import { BarChart } from 'react-chartkick'
import 'chartkick/chart.js'
import axios from "axios";


function History({  }) {

  const [address, setAddress] = useState("");


const checkConnected = async () => {
  const e = window.ethereum;
  if (!e) {
      return;
  }
  try {
      const accounts = await e.request({ method: "eth_accounts" }); // Get accounts
      if (accounts.length > 0) {
          setAddress(accounts[0]); // Set account if connected
      }
  } catch (err) {
      console.error(err);
  }
};


  const [ loading, setLoading] = useState(false);
  const [data, setData] = useState(["hey"]);

  const getTransactionHistory = async (addr) => {
    
    const url = `https://api-testnet.bttcscan.com/api?module=account&action=txlist&address=${addr}&startblock=0&endblock=99999999&sort=asc`;

    try {
      setLoading(true);
      const response = await axios.get(url);
      console.log(data)
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


  useEffect (() => {
    
    checkConnected()
  },[])
  useEffect(() => {
    if (address) {
      getTransactionHistory(address);
    }
  }, [address]);

  return (
    <div>

     
      {data && (
        <div>
          <h1 className="font-Oxanium text-gray-700 text-xl"> Summary of {address.toString().slice(0,9)  + "..." + address.toString().slice(-4)}</h1>
          <br/>
          {/* Create a line chart grouped by the day */}
          <BarChart
            data={data.reduce((acc, row) => {
              const date = getDateStringFromTimestamp(row.block_signed_at, false);
              if (!acc[date]) {
                acc[date] = 0;
              }
              acc[date] += 1
              return acc;
            }, {})}
            xtitle="Date"
            ytitle="Referrals"
          />

          <br />
        
        </div>
      )}
    </div>
  );
}

export default History;
