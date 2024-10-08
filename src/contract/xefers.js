import { ethers } from "ethers";
import { Xefers_CONTRACT } from "./metadata";

const getSigner = async () => {
  let signer;
  await window.ethereum.enable();
  const provider = new ethers.providers.Web3Provider(window.ethereum);
  signer = provider.getSigner();
  return signer;
};

export const getPrimaryAccount = async () => {
  let provider;
  if (window.ethereum) {
    await window.ethereum.enable();
    provider = new ethers.providers.Web3Provider(window.ethereum);
  } else {
    return undefined; // No supported account detected.
  }

  const accounts = await provider.listAccounts();
  return accounts[0];
};

// https://docs.fantom.foundation/smart-contract/deploy-a-smart-contract
export async function deployContract(title, reward, redirectUrl) {
  const signer = await getSigner();

  //   https://dev.to/yosi/deploy-a-smart-contract-with-ethersjs-28no

  // Create an instance of a Contract Factory
  const factory = new ethers.ContractFactory(
    Xefers_CONTRACT.abi,
    Xefers_CONTRACT.bytecode,
    signer
  );

  // Start deployment, returning a promise that resolves to a contract object
  const contract = await factory.deploy(title, reward, redirectUrl);
  await contract.deployed();
  console.log("Contract deployed to address:", contract.address);
  return contract;
}

export const validAddress = (addr) => {
  try {
    ethers.utils.getAddress(addr);
    return true;
  } catch (e) {
    return false;
  }
};

export const getMetadata = async (contractAddress) => {
  if (!contractAddress) {
    return {};
  }
  const signer = await getSigner();
  const signatureContract = new ethers.Contract(
    contractAddress,
    Xefers_CONTRACT.abi,
    signer
  );
  const result = await signatureContract.getMetadata();
  return result;
};

export const getTitle = async (contractAddress) => {
  if (!contractAddress) {
    return {};
  }
  const signer = await getSigner();
  const signatureContract = new ethers.Contract(
    contractAddress,
    XefersS_CONTRACT.abi,
    signer
  );
  const result = await signatureContract.getTitle();
  return result;
};

export const refer = async (contractAddress) => {
  if (!contractAddress) {
    return {};
  }

  const signer = await getSigner();
  const signatureContract = new ethers.Contract(
    contractAddress,
    XefersS_CONTRACT.abi,
    signer
  );
  const result = await signatureContract.refer();
  return result;
};

