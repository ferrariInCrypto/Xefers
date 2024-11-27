import { Polybase } from "@polybase/client";

// Initialize the Polybase client and connect to the Xefers collection
const db = new Polybase({
  defaultNamespace: "pk/0xbb44be3b8e07ed240e9144acfa4760f872ea5282b86647e678b505ffc2192b8cb5462e4624f2b1f363b6ad91b23ad7c3b99bf97450354725273cd486c1898606/zklinks",
});

const linkCollection = db.collection("Zklink");

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
