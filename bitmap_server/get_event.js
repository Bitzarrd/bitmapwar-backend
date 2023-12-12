import {ethers} from "ethers";

const txid = "0xd03f067a6ed67b6165fe579f88cb0421d1f29a1f1de421b3f83475960ec0bdb6";
const abi = [];

const rpc_url = "https://data-seed-prebsc-1-s1.binance.org:8545";
const provider = new ethers.JsonRpcProvider(rpc_url);
const receipt = await provider.getTransactionReceipt(txid);
const tx  = await provider.getTransaction( txid );
const result = await tx.wait()

// const contract = new ethers.Contract(receipt.contractAddress, abi, provider);
// const events =

// const events =

console.log("receipt", receipt);
console.log("response",result)