const fs = require("fs");
const path = require("path");
const mysql = require("mysql2/promise");
require("dotenv").config();

async function main() {
  const dbName = process.env.DB_NAME;
  if (!dbName) {
    throw new Error("DB_NAME is not set in .env");
  }

  const sqlPath = path.resolve(__dirname, "../../ecommerce_schema.sql");
  const sql = fs.readFileSync(sqlPath, "utf8");
  const fixedSql = sql
    .replace(/CREATE DATABASE IF NOT EXISTS\s+[^\s;]+/i, `CREATE DATABASE IF NOT EXISTS \`${dbName}\``)
    .replace(/USE\s+[^\s;]+/i, `USE \`${dbName}\``);

  const connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    multipleStatements: true,
  });

  await connection.query(fixedSql);
  console.log(`Database initialized: ${dbName}`);
  await connection.end();
}

main().catch((err) => {
  console.error("Database initialization failed:", err.message);
  process.exit(1);
});
