import React from "react";
import { Row, Col } from "antd";
import { useNavigate } from "react-router-dom";
import { APP_DESC } from "../util/constants";

const CHECKLIST_ITEMS = [
  "1. Decentralized referral tracking on the BTTC network with smart contract-based reward distribution",
  "2. Transparent and immutable reward distribution system to prevent fraud and manipulation",
  "3. Simple and user-friendly interface for creating and managing referral campaigns",
  "4. Scalable architecture with low transaction fees and high throughput for efficient performance",
  "5. (In Future) Zero-knowledge proof implementation for user privacy, ensuring no personal data is exposed",
];

function Home(props) {
  const navigate = useNavigate();

  const goToCreate = () => {
    navigate("/create");
  };

  return (
    <div className="">
      <Row>
        <Col span={18}>
          <div className="hero-slogan-section">
            <div className="mb-8 text-4xl font-Ubuntu">
              <h1>{APP_DESC}</h1>
            </div>

            {CHECKLIST_ITEMS.map((item, i) => {
              return (
                <p className="font-Ubuntu  text-gray-600  text-lg" key={i}>
                  &nbsp;
                  {item}
                </p>
              );
            })}
            <br />

            <button
              className="bg-[#1d2132]  text-md text-white py-2 px-4 rounded-lg shadow-md hover:bg-[#283046] hover:shadow-lg transition-all duration-300 ease-in-out"
              onClick={goToCreate}
            >
              Create a Campaign
            </button>
          </div>
        </Col>
      </Row>
    </div>
  );
}

Home.propTypes = {};

export default Home;
