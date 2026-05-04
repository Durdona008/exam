/**
 * SuperAdmin Seed
 * 
 * Ishlatish: npm run seed
 * 
 * Bu script birinchi marta ishga tushirilganda SuperAdmin yaratadi.
 * .env faylidagi SUPERADMIN_* o'zgaruvchilardan foydalanadi.
 */

import { createConnection } from 'typeorm';
import * as bcrypt from 'bcrypt';
import * as dotenv from 'dotenv';

dotenv.config();

async function seedSuperAdmin() {
  const connection = await createConnection({
    type: 'postgres',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT) || 5432,
    username: process.env.DB_USERNAME || 'postgres',
    password: process.env.DB_PASSWORD || 'password',
    database: process.env.DB_DATABASE || 'crm_db',
    entities: [__dirname + '/../../**/*.entity{.ts,.js}'],
    synchronize: true,
  });

  const userRepo = connection.getRepository('users');

  const phone = process.env.SUPERADMIN_PHONE || '+998901234567';
  const existing = await userRepo.findOne({ where: { phone } });

  if (existing) {
    console.log('✅ SuperAdmin allaqachon mavjud:', phone);
    await connection.close();
    return;
  }

  const passwordHash = await bcrypt.hash(
    process.env.SUPERADMIN_PASSWORD || 'superadmin123',
    10,
  );

  await userRepo.save({
    fullName: process.env.SUPERADMIN_NAME || 'Super Admin',
    phone,
    passwordHash,
    role: 'SUPERADMIN',
    isActive: true,
  });

  console.log('✅ SuperAdmin yaratildi!');
  console.log('   Telefon:', phone);
  console.log('   Parol:', process.env.SUPERADMIN_PASSWORD || 'superadmin123');
  console.log('\n⚠️  Parolni .env faylida o\'zgartiring!\n');

  await connection.close();
}

seedSuperAdmin().catch((err) => {
  console.error('❌ Seed xatosi:', err);
  process.exit(1);
});
