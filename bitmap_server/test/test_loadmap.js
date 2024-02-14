import axios from "axios";

const bitmap_count_url = "https://indexapitx.bitmap.game/api/v1/collection/bitmap/count";
const bitmap_owner_url = "https://indexapitx.bitmap.game/api/v1/collection/bitmap/${address}/?page=1&limit=10000";
// const bitmap_owner_url = "https://indexapitx.bitmap.game/api/v1/collection/bitmap/bc1qnjfw8qkzfysg7cvdqkll8mp89pjfxk9flqxh0z/?page=1&limit=10000";
// const bitmap_stake_url = "https://bridge.merlinchain.io/api/v1/history/stake/bitmaps?btc_from_address=bc1pe7ju6esj9v9a4mczju6gt2kujq0pm4q2kuy90j7rdhkshlggszdqqs2pc9";
const bitmap_stake_url = "https://bridge.merlinchain.io/api/v1/history/stake/bitmaps?btc_from_address=${address}";

async function loadBitmap(owner) {
    let url1 = bitmap_owner_url.replace("${address}", owner);
    let url2 = bitmap_stake_url.replace("${address}", owner);
    let p1 = axios.get(url1);
    let p2 = axios.get(url2);
    let all = await Promise.all([p1, p2]);
    let maps_1 = all[0].data.data.items.map((item) => {
        return item.bitmap_id.toString();
    });
    let maps_2 = all[1].data.data.map((item) => {
        return item.replace(".bitmap", "");
    });
    let mergedArray = [...maps_1, ...maps_2];
    let uniqueArray = Array.from(new Set(mergedArray));
    return uniqueArray.sort();
}

async function test(){
    console.log(await loadBitmap("bc1qnjfw8qkzfysg7cvdqkll8mp89pjfxk9flqxh0z"));

    console.log(await loadBitmap("bc1pe7ju6esj9v9a4mczju6gt2kujq0pm4q2kuy90j7rdhkshlggszdqqs2pc9"))

}

test();