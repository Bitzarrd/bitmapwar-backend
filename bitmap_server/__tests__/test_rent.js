import {checkRent, checkRent2} from "../rent.js";
import mysql from "mysql";
import dotenv from "dotenv";

describe('Rent Module', () => {

    let mysql_connection; // 声明连接变量

    beforeAll(async () => {
        dotenv.config();
        mysql_connection = mysql.createConnection({
            host: process.env.MYSQL_HOST,
            user: process.env.MYSQL_USER,
            password: process.env.MYSQL_PASS,
            database: process.env.MYSQL_DB,
            idleTimeoutMillis: 86400 * 100 // 设置连接在没有活动时断开
        });
        await mysql_connection.connect({});
    });

    it('checks if a bitmap is rented1', async () => {
        const result = await checkRent(1);
        // console.log(result)
        expect(result).toBe(true);
    });
    it('checks if a bitmap is rented2', async () => {
        const result = await checkRent2(mysql_connection, 1);
        // console.log(result)
        expect(result).toBe(true);
    });
});