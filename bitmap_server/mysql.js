import dotenv from "dotenv";
import mysql from "mysql";


export function mysql_query(mysql_connection, sql) {
    return new Promise((resolve, reject) => {
        mysql_connection.query(sql, function (err, result, fields) {
            if (err) {
                reject(err);
            } else {
                resolve(result);
            }
        });
    });
}