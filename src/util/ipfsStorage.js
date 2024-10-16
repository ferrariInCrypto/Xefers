// import { Web3Storage } from "web3.storage";
import axios from "axios";
import { Web3Storage } from "web3.storage/dist/bundle.esm.min.js"; // webpack 4
import { IPFS_BASE_URL } from "./constants";

const API_KEY = process.env.REACT_APP_STORAGE_KEY;

if (!API_KEY) {
  alert('')
}

function getAccessToken() {
  return API_KEY;
}

function makeStorageClient() {
  return new Web3Storage({ token: getAccessToken() });
}

export const ipfsUrl = (cid, fileName) => {
    let url = `${IPFS_BASE_URL}/${cid}`;
    if (fileName) {
      return `${url}/${fileName}`;
    }
    return url;
  };


export async function storeFiles(files) {
  console.log('store', files)
  const client = makeStorageClient();
  const cid = await client.put(files);
  console.log("stored files with cid:", cid);
  return cid;
}

export function fetchMetadata(cid) {
  const url = `${ipfsUrl(cid)}/metadata.json`
  return axios.get(url)
}

export async function retrieveFiles(cid) {
  const client = makeStorageClient();
  const res = await client.get(cid);
  console.log(`Got a response! [${res.status}] ${res.statusText}`);
  if (!res.ok) {
    throw new Error(`failed to get ${cid}`);
  }


  return res;
}
