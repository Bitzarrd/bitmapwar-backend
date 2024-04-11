let all_reward_profit = BigInt("250884000000000000");
// 0.6217616580310881%
let reward = 0.006217616580310881;

// 2024-03-14T07:21:09.183Z info: 用户：bc1q28u36uad828wcy4ywam3k9qtke7uum0pfak4nw 名次：9 颜色：green 领地：20427 病毒：100 损失：0 奖励：0.6217616580310881%

console.log(reward * 100 + "%");

let profit = all_reward_profit * BigInt(Math.floor(reward * 10000)) / BigInt(1000000);
let profit2= all_reward_profit * BigInt(Math.floor(reward)) / BigInt(100);

console.log(profit);
console.log(profit2);
// 155548080000000000n
// 1555480800000000n
// 15554808000000n
