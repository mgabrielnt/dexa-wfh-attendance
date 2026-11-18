import 'dotenv/config';
import { createConnection } from 'mysql2/promise';

const DATABASE_ENV_KEYS = ['AUTH_DB_NAME', 'EMPLOYEE_DB_NAME', 'ATTENDANCE_DB_NAME'];
const SAFE_NAME = /^[A-Za-z0-9_]+$/;

function databaseNames(): string[] {
  return DATABASE_ENV_KEYS.map((key) => {
    const name = process.env[key];
    if (!name || !SAFE_NAME.test(name)) {
      throw new Error(`${key} di file .env kosong atau berisi karakter yang tidak diizinkan`);
    }
    return name;
  });
}

async function setup() {
  const connection = await createConnection({
    host: process.env.DB_HOST ?? 'localhost',
    port: Number(process.env.DB_PORT ?? 3306),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
  });

  try {
    for (const name of databaseNames()) {
      await connection.query(
        `CREATE DATABASE IF NOT EXISTS \`${name}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`,
      );
      console.log(`  ✓ database ${name}`);
    }
    console.log('Database siap. Lanjutkan dengan: npm run seed');
  } finally {
    await connection.end();
  }
}

setup().catch((error) => {
  console.error('Gagal menyiapkan database:', error.message);
  console.error('Pastikan MySQL sudah berjalan dan DB_HOST, DB_PORT, DB_USER, DB_PASSWORD di backend/.env benar.');
  process.exit(1);
});
