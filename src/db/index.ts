const env = require("dotenv").config();
const mysql = require("mysql2/promise");

async function queryWithoutParams(sql: string) {
  try {
    const connection = await mysql.createConnection(config.db);
    const [results] = await connection.execute(sql);
    connection.end();
    return results;
  } catch (error) {
    console.log("Config >", config);
    console.log("MySQL error > ", error);
  }
}
async function queryWithParams(sql: string, params: any) {
  try {
    const connection = await mysql.createConnection(config.db);
    const [results] = await connection.execute(sql, params);
    connection.end();
    return results;
  } catch (error) {
    console.log("Config >", config);
    console.log("MySQL error > ", error);
  }
}

const config = {
  db: {
    host: process.env.MYSQL_HOST,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DB,
  },
  listPerPage: 10,
};

export const db = {
  query: queryWithoutParams,
  queryParams: queryWithParams,
};
