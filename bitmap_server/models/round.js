// import {mysql_query_with_args} from "../mysql.js";
// import {now} from "../utils.js";
//
// export async function insert(mysql_connection, rank_for_save, last_join, users) {
//     return await mysql_query_with_args(mysql_connection,
//         "INSERT INTO `round` (`end_time`,`rank`,`last_join`,`users`) VALUES (?,?,?,?);",
//         [now(), JSON.stringify(rank_for_save), last_join, JSON.stringify(users)]
//     );
// }