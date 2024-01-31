提现订单

| 字段名 | 字段类型 | 字段说明 |
|-------|-------|-------|
| id | int | 订单ID 自增 也是nonce|
| address | string | 提现地址 |
| amount | string | 提现金额 |
| txid | string | 交易ID |
| status | int | 状态 0:Pending中 1:Success已完成 |
| create_time | int | 创建时间 |
| signature | string | 签名 |
