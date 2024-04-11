import {make_signature} from "../signature.js";
import dotenv from "dotenv";

dotenv.config();

async function test() {

    const privateKey = "17294725c9cf12270b59508fcce1c33d7f405fb1ee0fa6d548fc478f25a855b3";//process.env.PRIVATE_KEY;
    const amount = "60000000000000000";
    const nonce = 1;
    const to = "0x8E2B80470512F318C87fab1d2D3cEF45773AE571";
    const signature = await make_signature(privateKey, amount, nonce, to);
    console.log(signature);
}

test();
