import React from "react";
import { Row, Col } from "antd";
import { useNavigate } from "react-router-dom";

const INFO = [
  "1. Decentralized referral tracking on the BTTC network with smart contract-based reward distribution",
  "2. Transparent and immutable reward distribution system to prevent fraud and manipulation",
  "3. Simple and user-friendly interface for creating and managing referral campaigns",
  "4. Scalable architecture with low transaction fees and high throughput for efficient performance",
  "5. Zero-knowledge proof implementation for more enhanced user privacy, ensuring no personal data is exposed",
];

function Home(props) {
  
  const navigate = useNavigate();

  const navigateTo = () => {
    navigate("/create");
  };

  return (

      <Row>
        <Col span={18}>
          <div className="hero-slogan-section ">
            <div className="mb-8  text-4xl font-Oxanium">
              <h1>Decentralized referral link tracking</h1>
            </div>

            {INFO.map((item, i) => {
              return (
                <p className="font-Oxanium  text-gray-600  text-lg" key={i}>
                  &nbsp;
                  {item}
                </p>
              );
            })}
            <br />

            <button
              className="bg-[#1d2132] font-Oxanium  text-md text-white py-2 px-4 rounded-lg shadow-md hover:bg-[#283046] hover:shadow-lg transition-all duration-300 ease-in-out"
              onClick={navigateTo}
            >
              Create a Campaign
            </button>
          </div>
        </Col>
      </Row>

  );
}

Home.propTypes = {};

export default Home;
