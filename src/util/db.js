import { Polybase } from "@polybase/client";
import { POLYBASE_NAMESPACE } from "./constants";

const db = new Polybase({
  defaultNamespace: POLYBASE_NAMESPACE
});

const linkCollection = db.collection(process.env.DB_NAMES);

export async function createLink(
  { id, title, redirectUrl, reward, owner, address, chainId }
) {
  // .create(args) args array is defined by the constructor fn
  const recordData = await linkCollection.create([
    id, title, redirectUrl, reward, owner, new Date().getTime(), chainId
  ]);

  console.log('created link', recordData)
  return recordData;
}

export async function getLinksForOwner(address) {
  const records = await linkCollection.where("owner", "==", address).get();
  return records;
}