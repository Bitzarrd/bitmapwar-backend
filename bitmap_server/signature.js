import {getBytes, solidityPackedKeccak256} from "ethers";
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
const message = solidityPackedKeccak256(['uint256', 'uint256'], [amount, nonce]);
const message_hash = getBytes(message);

console.log("message", message);
console.log("message_hash", message_hash);


// Sign the message

export async function signature() {
    let s = await wallet.signMessage(message_hash);
    console.log(s);
}

signature()