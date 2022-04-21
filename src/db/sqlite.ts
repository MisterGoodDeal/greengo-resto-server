import { SQLiteQueryParams, SQLiteSelectParams } from "../utils/interfaces";

const db = require("better-sqlite3")("./src/db/database.db");

/**
 * Usage :
 * query: "INSERT INTO users (fullname, email, age) VALUES (@fullname, * @email, @age)"
 * params: { fullname: "John Doe", email: "jdoe@gmail.com", age: 99 }
 */
const insert = ({ query, params }: SQLiteQueryParams) => {
  return db.prepare(query).run(params);
};

/**
 * Usage :
 * query: "SELECT * FROM users WHERE id = 1"
 */
const select = ({ query }: SQLiteSelectParams) => {
  return db.prepare(query).all();
};

export const sqlite = {
  insert: insert,
  select: select,
};
