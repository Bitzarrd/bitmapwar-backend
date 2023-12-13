import {getBytes, id, solidityPackedKeccak256, verifyMessage} from "ethers";
import dotenv from "dotenv";
import {ethers} from "ethers";

dotenv.config();

const privateKey = process.env.PRIVATE_KEY;
const rpc_url = "https://magical-wiser-uranium.bsc-testnet.quiknode.pro/129a6185443fadec6a5f672b3727e6864400dfd8/";
const provider = new ethers.JsonRpcProvider(rpc_url);

const wallet = new ethers.Wallet(privateKey, provider);
// Define the message and nonce
const amount = 100; // Amount to withdraw
const nonce = 1; // Nonce value
// const messageHash = id(amount + ":" + nonce);
const messageHash = solidityPackedKeccak256(['uint256', 'uint256'], [amount, nonce]);


let messageHashBytes = getBytes(messageHash)

console.log("messageHashBytes", messageHashBytes);

export async function signature() {
    let s = await wallet.signMessage(messageHashBytes);
    console.log(s);
}

signature()

signature = "0xa9631881a814aec5b1faaf2a9b70be0212195704a76b99e20dc00796722e3ef77007b09c49e45f0d5afd5056e5e11d34069d8b7251b967e744ee9327af6d04f21c"

const recoveredAddress = verifyMessage(messageHashBytes, signature);

console.log("recoveredAddress", recoveredAddress);