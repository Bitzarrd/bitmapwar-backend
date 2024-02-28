User定义了一个用户的数据，每个钱包有且仅有一个

| 字段名 | 字段类型 | 字段说明 |
|-------|-------|-------|
| address  | string  | BTC钱包地址  |
| merlin_address  | string  | 钱包地址  |
| taproot_address  | string  | taproot钱包地址  |
| public_key  | string  | 公钥  |
| profit  | string  | 可领取的收益总数  |
| jackpot  | string  | 爆灯奖励  |
| jackpot_bw  | string  | 蓝法杖爆灯奖励  |
| virus  | int  | 当前拥有，但是未投入地图的士兵总数  |
| land  | int  | 用户累计地块数，是对每轮统计的地块的累计数  |
| total_profit  | string  | 用户累计收益，是对每轮统计的收益的累计数，只加不减  |
| total_purchase_virus  | int  | 累计买兵数量  |
| points  | int  | 积分 |
