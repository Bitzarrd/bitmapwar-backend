import {make_signature} from "../signature.js";
import dotenv from "dotenv";

dotenv.config();

async function test() {

    const privateKey = "17294725c9cf12270b59508fcce1c33d7f405fb1ee0fa6d548fc478f25a855b3";//process.env.PRIVATE_KEY;
    const amount = "1";
    const nonce = 1;
    const signature = await make_signature(privateKey, amount, nonce);
    console.log(signature);
}

test();
