import 'dotenv/config';
import * as bcrypt from 'bcryptjs';
import { copyFileSync, mkdirSync, readdirSync } from 'fs';
import { join, resolve } from 'path';
import { DataSource } from 'typeorm';
import { countWorkingDays, EmployeeStatus, Role, toLocalDate } from '@app/common';
import { Attendance } from '../apps/attendance-service/src/attendance.entity';
import { CreateAttendancesTable1731700000002 } from '../apps/attendance-service/src/database/migrations/1731700000002-create-attendances-table';
import { CreateUsersTable1731700000000 } from '../apps/auth-service/src/database/migrations/1731700000000-create-users-table';
import { User } from '../apps/auth-service/src/users/user.entity';
import { CreateEmployeesTable1731700000001 } from '../apps/employee-service/src/database/migrations/1731700000001-create-employees-table';
import { Employee } from '../apps/employee-service/src/employee.entity';

const ADMIN = { email: 'admin@presensiku.test', password: 'Admin123!' };
const EMPLOYEE_PASSWORD = 'Karyawan123!';

const EMPLOYEES = [
  {
    employeeCode: '10231',
    phone: '0812111110231',
    fullName: 'Rina Wulandari',
    position: 'Staf HRD',
    department: 'HR',
    joinDate: '2022-01-03',
  },
  {
    employeeCode: '10244',
    phone: '0812111110244',
    fullName: 'Budi Santoso',
    position: 'Backend Developer',
    department: 'IT',
    joinDate: '2023-03-14',
  },
  {
    employeeCode: '10258',
    phone: '0812111110258',
    fullName: 'Sari Putri',
    position: 'Finance Analyst',
    department: 'Finance',
    joinDate: '2023-08-01',
  },
  {
    employeeCode: '10262',
    phone: '0812111110262',
    fullName: 'Dimas Pratama',
    position: 'QA Engineer',
    department: 'IT',
    joinDate: '2023-11-20',
  },
  {
    employeeCode: '10270',
    phone: '0812111110270',
    fullName: 'Andi Wijaya',
    position: 'Digital Marketer',
    department: 'Marketing',
    joinDate: '2024-02-05',
  },
  {
    employeeCode: '10181',
    phone: '0812111110181',
    fullName: 'Lestari Ayu',
    position: 'Akuntan',
    department: 'Finance',
    joinDate: '2021-06-12',
    inactive: true,
  },
];

const NOTES = ['Lanjut task sprint', 'Daily standup 09:00', null, 'Review pekerjaan kemarin', null];

function dataSource(database: string, entity: Function, migration: Function) {
  return new DataSource({
    type: 'mysql',
    host: process.env.DB_HOST ?? 'localhost',
    port: Number(process.env.DB_PORT ?? 3306),
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database,
    entities: [entity],
    migrations: [migration],
    timezone: 'Z',
    dateStrings: ['DATE'],
  });
}

function emailOf(fullName: string): string {
  return `${fullName.toLowerCase().replace(/\s+/g, '.')}@presensiku.test`;
}

function recentWorkdays(count: number): string[] {
  const days: string[] = [];
  const cursor = new Date();
  while (days.length < count) {
    cursor.setDate(cursor.getDate() - 1);
    const date = toLocalDate(cursor);
    if (countWorkingDays(date, date) === 1) days.unshift(date);
  }
  return days;
}

function copySamplePhotos(): string[] {
  const source = resolve(__dirname, 'seed-photos');
  const target = resolve(process.env.UPLOAD_DIR ?? 'uploads', 'attendance');
  mkdirSync(target, { recursive: true });

  return readdirSync(source).map((file) => {
    copyFileSync(join(source, file), join(target, `seed-${file}`));
    return `attendance/seed-${file}`;
  });
}

async function seed() {
  const authDb = dataSource(process.env.AUTH_DB_NAME!, User, CreateUsersTable1731700000000);
  const employeeDb = dataSource(process.env.EMPLOYEE_DB_NAME!, Employee, CreateEmployeesTable1731700000001);
  const attendanceDb = dataSource(process.env.ATTENDANCE_DB_NAME!, Attendance, CreateAttendancesTable1731700000002);
  const databases = [authDb, employeeDb, attendanceDb];
  await Promise.all(databases.map((database) => database.initialize()));
  await Promise.all(databases.map((database) => database.runMigrations()));

  try {
    const users = authDb.getRepository(User);
    if (await users.existsBy({ email: ADMIN.email })) {
      console.log('Data demo sudah ada, seed dilewati.');
      return;
    }

    await users.save(
      users.create({
        email: ADMIN.email,
        passwordHash: await bcrypt.hash(ADMIN.password, 10),
        role: Role.Admin,
        employeeId: null,
      }),
    );

    const employeePasswordHash = await bcrypt.hash(EMPLOYEE_PASSWORD, 10);
    const photos = copySamplePhotos();
    const workdays = recentWorkdays(8);
    const employees = employeeDb.getRepository(Employee);
    const attendances = attendanceDb.getRepository(Attendance);

    for (const [index, { inactive, ...data }] of EMPLOYEES.entries()) {
      const email = emailOf(data.fullName);
      const employee = await employees.save(
        employees.create({ ...data, email, status: inactive ? EmployeeStatus.Inactive : EmployeeStatus.Active }),
      );
      await users.save(
        users.create({
          email,
          passwordHash: employeePasswordHash,
          role: Role.Employee,
          employeeId: employee.id,
          isActive: !inactive,
        }),
      );
      if (inactive) continue;

      const history = workdays
        .filter((_, dayIndex) => (dayIndex + index) % 6 !== 0)
        .map((attendanceDate, dayIndex) => {
          const minute = 40 + ((index * 7 + dayIndex * 4) % 20);
          return attendances.create({
            employeeId: employee.id,
            attendanceDate,
            checkInAt: new Date(`${attendanceDate}T07:${minute}:00+07:00`),
            photoPath: photos[(index + dayIndex) % photos.length],
            notes: NOTES[(index + dayIndex) % NOTES.length],
          });
        });
      await attendances.save(history);
    }

    console.log('Seed selesai.');
    console.log(`  Admin HRD : ${ADMIN.email} / ${ADMIN.password}`);
    console.log(`  Karyawan  : ${emailOf('Budi Santoso')} / ${EMPLOYEE_PASSWORD} (berlaku untuk semua karyawan demo)`);
  } finally {
    await Promise.all(databases.map((database) => database.destroy()));
  }
}

seed().catch((error) => {
  console.error('Seed gagal:', error.message);
  process.exit(1);
});
