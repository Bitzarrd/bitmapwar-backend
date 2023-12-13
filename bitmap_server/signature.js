import {getBytes, id, solidityPackedKeccak256, verifyMessage, ethers} from "ethers";

export async function make_signature(privateKey, amount, nonce) {
    console.log("make_signature", privateKey, amount, nonce);
    const wallet = new ethers.Wallet(privateKey);
    const messageHash = solidityPackedKeccak256(['uint256', 'uint256'], [(Number)(amount), nonce]);
    let messageHashBytes = getBytes(messageHash)
    return await wallet.signMessage(messageHashBytes);
}