import {evmAddressToMerlinAddress, pubKeyToBtcAddress, pubKeyToEVMAddress} from "../address.js";

async function test() {

    const public_key = "0245e4eaf2ed3b3be91d65e4e668c279a9a081d7be8f8755c5269f7bf6766d4d27";

    const btc_address = pubKeyToBtcAddress(public_key);
    const evm_address = pubKeyToEVMAddress(public_key);
    const merlin_address = await evmAddressToMerlinAddress(evm_address);

    console.log("public_key", public_key);
    console.log("btc_address", btc_address);
    console.log("evm_address", evm_address)
    console.log("merlin_address", merlin_address)
}

test();