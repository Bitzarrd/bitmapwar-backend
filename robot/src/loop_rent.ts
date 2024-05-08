// 下注条件：每局开始后20min场上如果没有玩家下注，则脚本开始下注。其他条件不下注
// 下注阵营：随机选取
// 下注金额：1个兵
// 下注地址：bc1pct76kp5l9ru5uftjdlt2c8hvveyqqpac47ug78d7gze4nrrqw8dq9jv0dn

import winston from 'winston';
import dotenv from "dotenv";
import {program} from 'commander';
import {WebSocket} from 'ws';
import * as fs from "node:fs";
import axios from "axios";

dotenv.config();

const myFormat = winston.format.printf(({level, message, timestamp}) => {
  return `${timestamp} ${level}: ${message}`;
});


const logger = winston.createLogger({
  transports: [new winston.transports.Console()],
  level: "debug",
  format: winston.format.combine(
    winston.format.timestamp(),
    myFormat
  ),
});


program
  .requiredOption('-pk, --public_key <string>', 'public_key', '025499c675669bcf6ee2587f827f42e3c90e13ec0493ef5c477e0c5e8a4ba86d6d')
  .requiredOption('-m, --map_id <number>', 'map_id', '697116')
  .requiredOption('-s, --soldier <number>', 'soldier amount number', '1')
  .requiredOption('-i, --interval_of_endtime <number>', 'interval of end time', '1200')
  .requiredOption('-ws, --websocket_url <string>', 'websocket server', 'http://localhost:3000');

program.parse();

const options = program.opts();

const main = async () => {
  console.log(options);
  while (true) {
    await sleep(2000);
    let status_resp = await axios.get("http://localhost:3000/Status");
    //当前时间和结束时间间隔
    const now = Math.floor(Date.now() / 1000);
    const stop_time = status_resp.data.stop_time;
    const next_round = status_resp.data.next_round;
    const player_count = status_resp.data.player_count;
    const interval = stop_time - now;
    //距离下一局开始时间
    const next_round_interval = next_round - now;
    if (interval > 0) {
      logger.info(`检查服务器状态，本局结束时间:${timestampToBeijingTime(stop_time)},下一局开始时间: ${timestampToBeijingTime(next_round)}，当前下注次数地图数:${player_count},距离本局结束间隔${interval}秒`);
    } else {
      logger.info(`检查服务器状态，本局结束时间:${timestampToBeijingTime(stop_time)},下一局开始时间: ${timestampToBeijingTime(next_round)}，当前下注次数地图数:${player_count},距离下一局开始间隔${next_round_interval}秒`);
    }

    if (interval < (Number)(options.interval_of_endtime) && interval > 0 && player_count === 0) {
      logger.info("开始下注");
      const colors = ['red', 'blue', 'green', 'purple'];
      let bet_resp = await axios.post(options.websocket_url + "/Join", {
        "public_key": options.public_key,
        "amount": (Number)(options.soldier),
        "color": colors[Math.floor(Math.random() * colors.length)],
        "map_id": (Number)(options.map_id),
      });
      logger.info(`下注结果:${JSON.stringify(bet_resp.data)}`);
    }
  }
};

async function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function timestampToBeijingTime(timestamp: number): string {
  // 创建一个 Date 对象并设置时间戳（以毫秒为单位）
  const date = new Date(timestamp * 1000);

  // 获取本地时间与 UTC 时间的时区偏移量（以分钟为单位）
  const offset = date.getTimezoneOffset();

  // 计算北京时间的时间戳（以秒为单位）
  const beijingTimestamp = timestamp + offset * 60 + 8 * 60 * 60;

  // 创建一个新的 Date 对象以表示北京时间
  const beijingDate = new Date(beijingTimestamp * 1000);

  // 获取北京时间的年、月、日、时、分和秒
  const year = beijingDate.getFullYear();
  const month = beijingDate.getMonth() + 1; // 月份从 0 开始，所以要加 1
  const day = beijingDate.getDate();
  const hours = beijingDate.getHours();
  const minutes = beijingDate.getMinutes();
  const seconds = beijingDate.getSeconds();

  // 构造北京时间的字符串表示
  const beijingTime = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;

  return beijingTime;
}


main().then(r => {
  logger.info("finish");
});

