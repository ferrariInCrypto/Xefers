import { Polybase } from "@polybase/client";

// Initialize the Polybase client and connect to the Xefers collection
const db = new Polybase({
  defaultNamespace: "pk/0x7093dfec37a4f0018f5a956c8b96da93f1a25f38e5af60802860b90b33c2ced4bd00f057b215130519fba1b33ea6c2f2a715fb682605e714ea5e7fc78cb9ba39/Xefers",
});

const linkCollection = db.collection("Xefers");

// Function to create a new link record in the Xefers collection
export async function createLink({ id, title, redirectUrl, reward, owner, address, chainId }) {
  try {
    // Create a new record in the collection with specified data
    const recordData = await linkCollection.create([
      id,
      title,
      redirectUrl,
      reward,
      owner,
      new Date().getTime(), // Timestamp
      chainId
    ]);

    // Return the record data after successful creation
    return recordData;
  } catch (error) {
    console.error("Error creating link:", error);
    throw error;
  }
}

// Function to retrieve links owned by a specific address
export async function getLinksForOwner(address) {
  try {
    // Query the collection for records where 'owner' matches the given address
    const records = await linkCollection.where("owner", "==", address).get();

    // Return the filtered records
    return records;
  } catch (error) {
    console.error("Error fetching links for owner:", error);
    throw error;
  }
}
