import {ethers} from "ethers";

const txid = "0xd03f067a6ed67b6165fe579f88cb0421d1f29a1f1de421b3f83475960ec0bdb6";
const abi = [];

const rpc_url = "https://data-seed-prebsc-1-s1.binance.org:8545";
const provider = new ethers.JsonRpcProvider(rpc_url);
const receipt = await provider.getTransactionReceipt(txid);

console.log("receipt", receipt);
