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


export function mysql_query_with_args(mysql_connection, sql, args) {
    return new Promise((resolve, reject) => {
        mysql_connection.query(sql, args, function (err, result, fields) {
            if (err) {
                reject(err);
            } else {
                resolve(result);
            }
        });
    });
}