Player表示单个在场玩家的数据，每次投入士兵就会创建一个

| 字段名 | 字段类型 | 字段说明 |
|-------|-------|-------|
| bitmap  | string  | 地块ID  |
| color  | string  | 颜色  |
| init_virus  | int  | 投入的士兵数量  |
| virus  | int  | 当前的士兵数量  |
| loss  | int  | 损失的士兵数量  |
| land  | int  | 地块总数  |
| x  | int  | 格子所在的行数  |
| y  | int  | 格子所在的列数  |
| owner  | string  | 钱包地址  |

