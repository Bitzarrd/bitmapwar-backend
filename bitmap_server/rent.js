//当地址为 bc1qptgujmlkez7e6744yctzjgztu0st372mxs6702 的时候说明被质押了!
import axios from "axios";
import {parseEther} from "ethers";

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

// CREATE TABLE `rental` (
//     `bitmap_id` int(11) NOT NULL,
//     `days` int(11) NOT NULL DEFAULT '7',
//     `timeout` int(11) NOT NULL DEFAULT '0',
//     `owner` varchar(255) NOT NULL,
//     `total_profit` varchar(255) NOT NULL DEFAULT '0',
//     `total_btc` varchar(255) NOT NULL DEFAULT '0',
//     `total_energy` varchar(255) NOT NULL DEFAULT '0',
//     `type` varchar(255) NOT NULL DEFAULT 'energy',
//     PRIMARY KEY (`bitmap_id`),
//     KEY `rent_for_owner` (`owner`)
// ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

export async function getRental(mysql_connection, bitmap_id) {
    const sql = "SELECT * FROM rental WHERE bitmap_id = ?";

    try {
        const result = await new Promise((resolve, reject) => {
            mysql_connection.query(sql, [bitmap_id], function (err, result, fields) {
                if (err) {
                    reject(err);
                } else {
                    resolve(result);
                }
            });
        });

        return result;
    } catch (err) {
        throw err;
    }
}

export async function getAvailableRental(mysql_connection, owner) {
    const now_timestamp = Math.floor(Date.now() / 1000);
    const sql = "SELECT * FROM rental WHERE owner = ? AND timeout > ?";

    try {
        const result = await new Promise((resolve, reject) => {
            mysql_connection.query(sql, [owner, now_timestamp], function (err, result, fields) {
                if (err) {
                    reject(err);
                } else {
                    resolve(result);
                }
            });
        });

        return result;
    } catch (err) {
        throw err;
    }
}

export function newRental(bitmap_id, days, timeout, owner, total_profit, total_btc, total_energy, type) {
    return {
        bitmap_id: bitmap_id,
        days: days,
        timeout: timeout,
        owner: owner,
        total_profit: total_profit,
        total_btc: total_btc,
        total_energy: total_energy,
        type: type
    };
}

export async function insertRental(mysql_connection, bitmap_id, days, timeout, owner, total_profit, total_btc, total_energy, type) {
    const sql = "INSERT INTO rental (bitmap_id, days, timeout, owner, total_profit, total_btc, total_energy, type) VALUES (?, ?, ?, ?, ?, ?, ?, ?)";

    try {
        await new Promise((resolve, reject) => {
            mysql_connection.query(sql, [bitmap_id, days, timeout, owner, total_profit, total_btc, total_energy, type], function (err, result, fields) {
                if (err) {
                    reject(err);
                } else {
                    resolve(result);
                }
            });
        });
    } catch (err) {
        throw err;
    }
}

export async function updateRental(mysql_connection, bitmap_obj) {
    const sql = "UPDATE rental SET days = ?, timeout = ?, owner = ?, total_profit = ?, total_btc = ?, total_energy = ?, type = ? WHERE bitmap_id = ?";

    try {
        await new Promise((resolve, reject) => {
            mysql_connection.query(sql, [bitmap_obj.days, bitmap_obj.timeout, bitmap_obj.owner, bitmap_obj.total_profit, bitmap_obj.total_btc, bitmap_obj.total_energy, bitmap_obj.type, bitmap_obj.bitmap_id], function (err, result, fields) {
                if (err) {
                    reject(err);
                } else {
                    resolve(result);
                }
            });
        });
    } catch (err) {
        throw err;
    }

}

// ### 租赁费用
// 租赁费用分为积分、btc、profit余额
// 积分定义：游戏行为获得（购买士兵），积分通过租赁地块扣除
// btc购买：调梅林钱包租赁
// profit余额：账号收益余额购买
// 7天              能量 500                btc 0.0004            profit 0.0004
// 15天            能量 800                btc 0.0006            profit 0.0006
// 30天            能量 1200              btc 0.001              profit 0.001

export function getRentPrice(days) {
    let energy = 0;
    let btc = 0;
    let profit = 0;

    switch (days) {
        case 7:
            energy = 500;
            btc = parseEther('0.0004').toString();
            profit = parseEther('0.0004').toString();
            break;
        case 15:
            energy = 800;
            btc = parseEther('0.0006').toString();
            profit = parseEther('0.0006').toString();
            break;
        case 30:
            energy = 1200;
            btc = parseEther('0.001').toString();
            profit = parseEther('0.001').toString();
            break;
        default:
            throw new Error("Invalid days");
    }

    return {
        energy: energy,
        btc: btc,
        profit: profit
    };
}

async function test() {
    await checkRent(113111);
}

// test();