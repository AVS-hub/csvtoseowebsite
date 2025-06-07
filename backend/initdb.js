import dotenv from "dotenv";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { PGlite } from "@electric-sql/pglite";

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dbPath = path.join(__dirname, "db");

// Always recreate the database for a clean start
if (fs.existsSync(dbPath)) {
  fs.rmSync(dbPath, { recursive: true, force: true });
}

const postgres = new PGlite(dbPath);
const dbSqlPath = path.join(__dirname, "db.sql");
const dbInitCommands = fs
  .readFileSync(dbSqlPath, "utf-8")
  .toString()
  .split(/(?=CREATE TABLE |INSERT INTO)/);
for (let cmd of dbInitCommands) {
  console.dir({ "backend:db:init:command": cmd });
  try {
    await postgres.exec(cmd);
  } catch (e) {
    console.dir({ "backend:db:init:error": e });
  }
}
