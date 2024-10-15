import React from "react";
import { Row, Col } from "antd";
import { useNavigate } from "react-router-dom";
import { APP_DESC } from "../util/constants";
import {   } from "@ant-design/icons";

const CHECKLIST_ITEMS = [
  "1. Decentralized referral tracking on the BTTC network with smart contract-based reward distribution",
  "2. Zero-knowledge proof implementation for user privacy, ensuring no personal data is exposed",
  "3. Transparent and immutable reward distribution system to prevent fraud and manipulation",
  "4. Simple and user-friendly interface for creating and managing referral campaigns",
  "5. Scalable architecture with low transaction fees and high throughput for efficient performance"
];


function Home(props) {
  const navigate = useNavigate();

  const goToCreate = () => {
    navigate("/create");
  };

  return (
    <div className="hero-section ">
      <Row>
        <Col span={24}>
          <div className="hero-slogan-section">
            <div className="hero-slogan text-5xl font-Ubuntu">
              <h1>
                {APP_DESC}
              </h1>
            </div>
         
            {CHECKLIST_ITEMS.map((item, i) => {
              return (
                <p className="font-Ubuntu text-gray-600  text-xl" key={i}>
               
                  &nbsp;
                  {item}
                </p>
              );
            })}
            <br />

            <button  className="bg-[#1d2132] text-white py-2 px-4 rounded-lg shadow-md hover:bg-[#283046] hover:shadow-lg transition-all duration-300 ease-in-out" onClick={goToCreate}>
              Create a Link Campaign  
            </button>
          </div>
        </Col>
       
      </Row>
    </div>
  );
}

Home.propTypes = {};

export default Home;
