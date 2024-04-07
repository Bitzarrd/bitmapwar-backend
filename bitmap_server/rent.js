//当地址为 bc1qptgujmlkez7e6744yctzjgztu0st372mxs6702 的时候说明被质押了!
import axios from "axios";

const deposit_address = "bc1qptgujmlkez7e6744yctzjgztu0st372mxs6702";

/**
 * 检查某个地块是否被质押
 * @param bitmap_id
 * @returns {Promise<boolean>}
 */
export async function checkRent(bitmap_id) {
    try {
        const url = 'https://indexapitx.bitmap.game/api/v1/collection/bitmap/detail?id=' + bitmap_id;
        let response = await axios.get(url);
        if (response.data.data[0].address === deposit_address) {
            return true;
        } else {
            return false;
        }
    } catch (e) {
        console.error(e);
        return false;
    }
}


async function test() {
    await checkRent(113111);
}

// test();