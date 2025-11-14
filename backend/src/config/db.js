import pg from "pg";
import dotenv from "dotenv";
dotenv.config();

const { Pool } = pg;

const pool = new Pool({
  host: "aws-1-ca-central-1.pooler.supabase.com",
  port: 5432,
  database: "postgres",
  user: "postgres.ukepqavytmaotdgdxhum",
  password: "w6Y0EgE4QoM7Ci5B",
  ssl: {
    rejectUnauthorized: false
  }
});

export default pool;