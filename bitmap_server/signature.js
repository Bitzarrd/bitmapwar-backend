import {getBytes, id, solidityPackedKeccak256, verifyMessage, ethers} from "ethers";
import bitcoin from 'bitcoinjs-lib';
import bitcoinMessage from 'bitcoinjs-message';

export async function make_signature(privateKey, amount, nonce, to) {
    console.log("make_signature", privateKey, amount, nonce);
    const wallet = new ethers.Wallet(privateKey);
    const messageHash = solidityPackedKeccak256(['uint256', 'uint256', 'address'], [amount.toString(), nonce, to]);
    let messageHashBytes = getBytes(messageHash)
    return await wallet.signMessage(messageHashBytes);
}

export function ethCheckSignature(message, signature) {
    return verifyMessage(message, signature);
}

export function test() {
    let message = 'Login For Bitmapwar!';
    console.log(message);
    let signature = '0x1b4b4';
    console.log(signature);
    let address = ethCheckSignature(message, signature);
    console.log(address);
}


// function verifyTaprootSignature(message, signature, publicKey) {
//     try {
//         const keyPair = bitcoin.ECPair.fromPublicKey(Buffer.from(publicKey, 'hex'));
//         const signatureBuffer = Buffer.from(signature, 'hex');
//         const messageHash = bitcoin.crypto.sha256(Buffer.from(message, 'utf8'));
//
//         const result = bitcoin.crypto.verify(
//             messageHash,
//             signatureBuffer,
//             keyPair.publicKey
//         );
//
//         return result;
//     } catch (error) {
//         console.error('验证签名时出错：', error);
//         return false;
//     }
// }

function verifyTaprootSignature(message, signature, publicKey) {
    try {
        const address = bitcoin.payments.p2pkh({ pubkey: Buffer.from(publicKey, 'hex') }).address;
        console.log(address);
        const result = bitcoinMessage.verify(message, address, signature);

        return result;
    } catch (error) {
        console.error('验证签名时出错:', error);
        return false;
    }
}

export function test_btc() {
    let message = 'Login For Bitmapwar!';
    let signature = 'H3khUeUswA6rFVArWcC71FZTsvmhQmKRF0e9TSLLqJi4EK8U/EI1pj5vxsnIKRFYI2FulSD6MOKp20InAnf4tCA='
    let public_key = '03d26bce8755abbc5a58fbc64d8998af29311bb9b773cd6ade2cbb7d63fc6b3057';
    console.log(verifyTaprootSignature(message, signature, public_key));
}

test_btc();