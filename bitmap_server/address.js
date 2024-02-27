import {bytesToHex, publicToAddress, toBytes, toChecksumAddress, toRpcSig} from '@ethereumjs/util';
import {bech32} from "bech32";
import crypto from "crypto";

export const pubKeyToEVMAddress = (pubKey) => {
    const address = toChecksumAddress(bytesToHex(publicToAddress(toBytes(`0x${pubKey}`), true)));
    return address;
};

export const evmAddressToMerlinAddress = (evmAddress) => {
    let myHeaders = new Headers();
    myHeaders.append("authority", "rpc.particle.network");
    myHeaders.append("accept", "application/json, text/plain, */*");
    myHeaders.append("accept-language", "zh-CN,zh;q=0.9,en;q=0.8,zh-TW;q=0.7");
    myHeaders.append("content-type", "application/json");
    // myHeaders.append("origin", "http://localhost:3001");
    // myHeaders.append("referer", "http://localhost:3001/");
    myHeaders.append("sec-ch-ua", "\"Not A(Brand\";v=\"99\", \"Google Chrome\";v=\"121\", \"Chromium\";v=\"121\"");
    myHeaders.append("sec-ch-ua-mobile", "?0");
    myHeaders.append("sec-ch-ua-platform", "\"macOS\"");
    myHeaders.append("sec-fetch-dest", "empty");
    myHeaders.append("sec-fetch-mode", "cors");
    myHeaders.append("sec-fetch-site", "cross-site");
    myHeaders.append("user-agent", "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36");

    let raw = JSON.stringify({
        "method": "particle_aa_getSmartAccount",
        "params": [
            {
                "name": "BTC",
                "version": "1.0.0",
                "ownerAddress": evmAddress
            }
        ],
        // "id": 1708962412974633,
        "jsonrpc": "2.0"
    });

    let requestOptions = {
        method: 'POST',
        headers: myHeaders,
        body: raw,
        redirect: 'follow'
    };

    return new Promise((resolve, reject) => {
        fetch("https://rpc.particle.network/evm-chain?method=particle_aa_getSmartAccount&chainId=686868&projectUuid=a0c97b7b-ecd2-44c3-a8f8-545d5858f221&projectKey=c7npkknKRK6E44YKbBAhcsGRjHdXVC0hvMDmtGjK", requestOptions)
            .then(response => response.text())
            .then(result => {
                const data = JSON.parse(result);
                resolve(data.result[0].smartAccountAddress);
            })
            .catch(error => {
                console.log('error', error);
                reject(error);
            });
    });
    // fetch("https://rpc.particle.network/evm-chain?method=particle_aa_getSmartAccount&chainId=686868&projectUuid=a0c97b7b-ecd2-44c3-a8f8-545d5858f221&projectKey=c7npkknKRK6E44YKbBAhcsGRjHdXVC0hvMDmtGjK", requestOptions)
    //     .then(response => response.text())
    //     .then(result => console.log(result))
    //     .catch(error => console.log('error', error));
    //
    //
    // return "0x";
}

export const pubKeyToBtcAddress = (pubKey) => {
    const sha256Digest = crypto
        .createHash("sha256")
        .update(pubKey, "hex")
        .digest("hex");

    const ripemd160Digest = crypto
        .createHash("ripemd160")
        .update(sha256Digest, "hex")
        .digest("hex");

    const bech32Words = bech32.toWords(Buffer.from(ripemd160Digest, "hex"));
    const words = new Uint8Array([0, ...bech32Words]);
    const btc_address = bech32.encode("bc", words);
    return btc_address;
}


