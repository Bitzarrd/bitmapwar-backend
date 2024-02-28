import {evmAddressToMerlinAddress, pubKeyToBtcAddress, pubKeyToEVMAddress, pubKeyToTaprootAddress} from "../address.js";

async function test() {

    const public_key = "0374a4e3bec2a167024882f0407f172340ea41163fef28529b93b34e53a369913a";

    const btc_address = pubKeyToBtcAddress(public_key);
    const taproot_address = pubKeyToTaprootAddress(public_key);
    const evm_address = pubKeyToEVMAddress(public_key);
    const merlin_address = await evmAddressToMerlinAddress(evm_address);

    console.log("public_key", public_key);
    console.log("btc_address", btc_address);
    console.log("taproot_address", taproot_address);

    console.log("evm_address", evm_address)
    console.log("merlin_address", merlin_address)
}

test();